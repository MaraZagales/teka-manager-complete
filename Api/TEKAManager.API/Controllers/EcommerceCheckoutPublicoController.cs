using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Globalization;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

/// <summary>
/// Confirma una solicitud de compra pública y la registra como Pedido pendiente.
/// No procesa pagos ni confirma definitivamente la venta.
/// </summary>
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("public-commerce")]
[Route("api/ecommerce/checkout")]
public sealed class EcommerceCheckoutPublicoController(
    TekaDbContext db,
    IEmailService emailService,
    ILogger<EcommerceCheckoutPublicoController> logger) : ControllerBase
{
    public sealed class CheckoutPublicoRequest
    {
        [Required]
        public Guid SolicitudId { get; set; }

        [Required, StringLength(100), MinLength(2)]
        public string Nombre { get; set; } = "";

        [StringLength(100)]
        public string? Apellido { get; set; }

        [Required, EmailAddress, StringLength(150)]
        public string Email { get; set; } = "";

        [Phone, StringLength(30)]
        public string? Telefono { get; set; }

        [Required, StringLength(120), MinLength(2)]
        public string Calle { get; set; } = "";

        [Required, StringLength(20), MinLength(1)]
        public string Altura { get; set; } = "";

        [StringLength(50)]
        public string? PisoDepto { get; set; }

        [StringLength(100)]
        public string? Barrio { get; set; }

        [StringLength(20)]
        public string? CodigoPostal { get; set; }

        [Range(1, int.MaxValue)]
        public int ProvinciaId { get; set; }

        [Range(1, int.MaxValue)]
        public int LocalidadId { get; set; }

        [StringLength(250)]
        public string? Observaciones { get; set; }

        [Required, MinLength(1), MaxLength(50)]
        public List<CheckoutPublicoItemRequest> Items { get; set; } = [];
    }

    public sealed class CheckoutPublicoItemRequest
    {
        [Range(1, int.MaxValue)]
        public int ProductoId { get; set; }

        public decimal Cantidad { get; set; }
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Confirmar(
        [FromBody] CheckoutPublicoRequest request,
        CancellationToken cancellationToken)
    {
        if (request.SolicitudId == Guid.Empty)
            return BadRequest(new { mensaje = "La identificación de la solicitud no es válida." });

        Normalizar(request);

        var items = request.Items
            .GroupBy(item => item.ProductoId)
            .Select(group => new CheckoutItem(group.Key, group.Sum(item => item.Cantidad)))
            .ToList();

        if (items.Any(item => item.Cantidad < 0.01m || item.Cantidad > 9999m))
            return BadRequest(new { mensaje = "Las cantidades solicitadas no son válidas." });

        var connection = (SqlConnection)db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        await using var transaction =
            (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        try
        {
            var carritoExistente = await BuscarCarritoAsync(
                connection, transaction, request.SolicitudId, cancellationToken);

            if (carritoExistente?.PedidoId is int pedidoExistenteId)
            {
                var pedidoExistente = await CargarPedidoAsync(
                    connection, transaction, pedidoExistenteId, cancellationToken);

                await transaction.CommitAsync(cancellationToken);

                return Ok(new
                {
                    pedidoId = pedidoExistente.PedidoId,
                    total = pedidoExistente.Total,
                    estado = "Pendiente",
                    domicilioEntrega = pedidoExistente.DomicilioEntrega,
                    solicitudYaProcesada = true,
                    correoEnviado = (bool?)null,
                    mensaje = "La solicitud ya había sido registrada. TEKA se comunicará para confirmar la compra."
                });
            }

            var catalogo = await CargarCatalogoPublicoAsync(connection, transaction, cancellationToken);
            ValidarItemsPublicados(items, catalogo);
            await ValidarDisponibilidadAsync(connection, transaction, items, cancellationToken);

            var clienteId = await ObtenerOCrearClienteAsync(
                connection, transaction, request, cancellationToken);

            var domicilio = await ObtenerOCrearDomicilioEntregaAsync(
                connection, transaction, clienteId, request, cancellationToken);

            var carritoId = await ObtenerOCrearCarritoAsync(
                connection,
                transaction,
                carritoExistente,
                request.SolicitudId,
                clienteId,
                cancellationToken);

            await ReemplazarItemsAsync(
                connection, transaction, carritoId, items, cancellationToken);

            var pedido = await ConvertirEnPedidoAsync(
                connection,
                transaction,
                carritoId,
                request.Observaciones,
                domicilio.DomicilioClienteId,
                domicilio.DomicilioEntrega,
                cancellationToken);

            var lineas = await CargarLineasPedidoAsync(
                connection, transaction, pedido.PedidoId, cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            var correoEnviado = true;
            try
            {
                await emailService.SendAsync(
                    request.Email,
                    $"Recibimos tu solicitud de compra TEKA #{pedido.PedidoId}",
                    ArmarCorreo(request, pedido, lineas));
            }
            catch (Exception ex)
            {
                correoEnviado = false;
                logger.LogError(
                    ex,
                    "El pedido ecommerce {PedidoId} fue creado, pero no se pudo enviar el correo a {Email}",
                    pedido.PedidoId,
                    request.Email);
            }

            return StatusCode(StatusCodes.Status201Created, new
            {
                pedidoId = pedido.PedidoId,
                total = pedido.Total,
                estado = "Pendiente",
                domicilioEntrega = pedido.DomicilioEntrega,
                solicitudYaProcesada = false,
                correoEnviado,
                mensaje = correoEnviado
                    ? "Recibimos tu solicitud. TEKA se comunicará para confirmar la compra."
                    : "La solicitud fue registrada, pero no pudimos enviar el correo de confirmación. TEKA se comunicará para confirmar la compra."
            });
        }
        catch (CheckoutPublicoException ex)
        {
            await RollbackSeguroAsync(transaction, cancellationToken);
            return ex.EsConflicto
                ? Conflict(new { mensaje = ex.Message })
                : BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            await RollbackSeguroAsync(transaction, cancellationToken);
            logger.LogWarning(ex, "Solicitud ecommerce duplicada {SolicitudId}", request.SolicitudId);
            return Conflict(new
            {
                mensaje = "La solicitud ya está siendo procesada. Esperá unos segundos antes de volver a intentar."
            });
        }
        catch (SqlException ex)
        {
            await RollbackSeguroAsync(transaction, cancellationToken);
            logger.LogWarning(ex, "No se pudo confirmar la solicitud ecommerce {SolicitudId}", request.SolicitudId);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            await RollbackSeguroAsync(transaction, cancellationToken);
            logger.LogError(ex, "Error al confirmar la solicitud ecommerce {SolicitudId}", request.SolicitudId);
            return StatusCode(500, new { mensaje = "No se pudo registrar la solicitud de compra." });
        }
    }

    private static void Normalizar(CheckoutPublicoRequest request)
    {
        request.Nombre = request.Nombre.Trim();
        request.Apellido = Limpiar(request.Apellido);
        request.Email = request.Email.Trim().ToLowerInvariant();
        request.Telefono = Limpiar(request.Telefono);
        request.Calle = request.Calle.Trim();
        request.Altura = request.Altura.Trim();
        request.PisoDepto = Limpiar(request.PisoDepto);
        request.Barrio = Limpiar(request.Barrio);
        request.CodigoPostal = Limpiar(request.CodigoPostal);
        request.Observaciones = Limpiar(request.Observaciones);
    }

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static async Task<CarritoEncontrado?> BuscarCarritoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        Guid solicitudId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT TOP (1) CarritoId, ClienteId, Estado, PedidoIdConvertido
            FROM dbo.Carrito WITH (UPDLOCK, HOLDLOCK)
            WHERE IdentificadorSesion = @SolicitudId;
            """;

        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.Add("@SolicitudId", SqlDbType.UniqueIdentifier).Value = solicitudId;

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) return null;

        return new CarritoEncontrado(
            reader.GetInt32(reader.GetOrdinal("CarritoId")),
            reader.IsDBNull(reader.GetOrdinal("ClienteId"))
                ? null
                : reader.GetInt32(reader.GetOrdinal("ClienteId")),
            reader.GetString(reader.GetOrdinal("Estado")),
            reader.IsDBNull(reader.GetOrdinal("PedidoIdConvertido"))
                ? null
                : reader.GetInt32(reader.GetOrdinal("PedidoIdConvertido")));
    }

    private static async Task<Dictionary<int, CatalogoItem>> CargarCatalogoPublicoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand("dbo.sp_Ecommerce_Catalogo_Publico", connection, transaction)
        {
            CommandType = CommandType.StoredProcedure
        };

        var resultado = new Dictionary<int, CatalogoItem>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            var productoId = Convert.ToInt32(reader["ProductoId"], CultureInfo.InvariantCulture);
            var nombre = Convert.ToString(reader["Nombre"], CultureInfo.InvariantCulture) ?? "Producto";
            var precio = Convert.ToDecimal(reader["Precio"], CultureInfo.InvariantCulture);
            resultado[productoId] = new CatalogoItem(productoId, nombre, precio);
        }

        return resultado;
    }

    private static void ValidarItemsPublicados(
        IEnumerable<CheckoutItem> items,
        IReadOnlyDictionary<int, CatalogoItem> catalogo)
    {
        foreach (var item in items)
        {
            if (!catalogo.ContainsKey(item.ProductoId))
                throw new CheckoutPublicoException(
                    $"El producto {item.ProductoId} ya no está disponible en el catálogo público.");
        }
    }

    private static async Task ValidarDisponibilidadAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        IEnumerable<CheckoutItem> items,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT pdo.ProductoId,
                   CAST(
                       CASE
                           WHEN pdo.CupoOnline IS NULL
                                OR pdo.CupoOnline <= 0
                                OR COALESCE(sp.CantidadActual, 0) <= 0
                               THEN 0
                           WHEN pdo.CupoOnline < COALESCE(sp.CantidadActual, 0)
                               THEN pdo.CupoOnline
                           ELSE COALESCE(sp.CantidadActual, 0)
                       END AS decimal(18,2)) AS DisponibleOnline
            FROM dbo.ProductoDisponibilidadOnline pdo
            INNER JOIN dbo.Producto p
                ON p.ProductoId = pdo.ProductoId AND p.Activo = 1
            LEFT JOIN dbo.StockProducto sp
                ON sp.ProductoId = pdo.ProductoId AND sp.DepositoId = pdo.DepositoId
            ;
            """;

        var disponibilidad = new Dictionary<int, decimal>();
        await using (var command = new SqlCommand(sql, connection, transaction))
        await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
                disponibilidad[reader.GetInt32(0)] = reader.GetDecimal(1);
        }

        foreach (var item in items)
        {
            if (!disponibilidad.TryGetValue(item.ProductoId, out var disponible)
                || disponible < item.Cantidad)
            {
                throw new CheckoutPublicoException(
                    $"El producto {item.ProductoId} no tiene disponibilidad online suficiente.");
            }
        }
    }

    private static async Task<int> ObtenerOCrearClienteAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        CheckoutPublicoRequest request,
        CancellationToken cancellationToken)
    {
        const string buscarSql = """
            SELECT TOP (2) ClienteId
            FROM dbo.Cliente WITH (UPDLOCK, HOLDLOCK)
            WHERE Activo = 1
              AND LOWER(LTRIM(RTRIM(Email))) = @Email
            ORDER BY ClienteId;
            """;

        var coincidencias = new List<int>();
        await using (var buscar = new SqlCommand(buscarSql, connection, transaction))
        {
            buscar.Parameters.Add("@Email", SqlDbType.VarChar, 150).Value = request.Email;
            await using var reader = await buscar.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
                coincidencias.Add(reader.GetInt32(0));
        }

        if (coincidencias.Count > 1)
            throw new CheckoutPublicoException(
                "Existe más de un cliente activo con ese correo. Contactá a TEKA para completar la solicitud.",
                esConflicto: true);

        if (coincidencias.Count == 1) return coincidencias[0];

        var valoresPorDefecto = await ObtenerValoresClienteInvitadoAsync(
            connection, transaction, cancellationToken);

        await using var insertar = new SqlCommand("dbo.sp_Cliente_Insert", connection, transaction)
        {
            CommandType = CommandType.StoredProcedure
        };
        insertar.Parameters.Add("@Nombre", SqlDbType.VarChar, 100).Value = request.Nombre;
        insertar.Parameters.Add("@Apellido", SqlDbType.VarChar, 100).Value =
            (object?)request.Apellido ?? DBNull.Value;
        insertar.Parameters.Add("@TipoDocumentoId", SqlDbType.Int).Value = valoresPorDefecto.TipoDocumentoId;
        insertar.Parameters.Add("@Documento", SqlDbType.VarChar, 20).Value = DBNull.Value;
        insertar.Parameters.Add("@Telefono", SqlDbType.VarChar, 30).Value =
            (object?)request.Telefono ?? DBNull.Value;
        insertar.Parameters.Add("@Email", SqlDbType.VarChar, 150).Value = request.Email;
        insertar.Parameters.Add("@CondicionIVAId", SqlDbType.Int).Value = valoresPorDefecto.CondicionIvaId;
        insertar.Parameters.Add("@Observaciones", SqlDbType.VarChar, 500).Value =
            "Cliente creado automáticamente desde una solicitud de compra ecommerce.";

        var result = await insertar.ExecuteScalarAsync(cancellationToken);
        if (result is null || result == DBNull.Value)
            throw new CheckoutPublicoException("No se pudo registrar al comprador.");

        return Convert.ToInt32(result, CultureInfo.InvariantCulture);
    }

    private static async Task<ValoresClienteInvitado> ObtenerValoresClienteInvitadoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                (SELECT TOP (1) TipoDocumentoId
                 FROM dbo.TipoDocumento
                 WHERE Activo = 1 AND (Nombre = 'Consumidor Final' OR CodigoARCA = 99)
                 ORDER BY CASE WHEN CodigoARCA = 99 THEN 0 ELSE 1 END, TipoDocumentoId) AS TipoDocumentoId,
                (SELECT TOP (1) CondicionIVAId
                 FROM dbo.CondicionIVA
                 WHERE Activo = 1 AND Nombre = 'Consumidor Final'
                 ORDER BY CondicionIVAId) AS CondicionIVAId;
            """;

        await using var command = new SqlCommand(sql, connection, transaction);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        await reader.ReadAsync(cancellationToken);

        if (reader.IsDBNull(0) || reader.IsDBNull(1))
            throw new CheckoutPublicoException(
                "Falta configurar el tipo de documento o la condición IVA 'Consumidor Final'.");

        return new ValoresClienteInvitado(reader.GetInt32(0), reader.GetInt32(1));
    }

    private static async Task<DomicilioEntregaResultado> ObtenerOCrearDomicilioEntregaAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int clienteId,
        CheckoutPublicoRequest request,
        CancellationToken cancellationToken)
    {
        const string ubicacionSql = """
            SELECT TOP (1)
                td.TipoDomicilioId,
                l.Nombre AS LocalidadNombre,
                p.Nombre AS ProvinciaNombre
            FROM dbo.Localidad l
            INNER JOIN dbo.Provincia p
                ON p.ProvinciaId = l.ProvinciaId AND p.Activo = 1
            CROSS JOIN dbo.TipoDomicilio td
            WHERE l.LocalidadId = @LocalidadId
              AND l.ProvinciaId = @ProvinciaId
              AND l.Activo = 1
              AND td.Activo = 1
              AND UPPER(LTRIM(RTRIM(td.Nombre))) = 'ENTREGA'
            ORDER BY td.TipoDomicilioId;
            """;

        int tipoDomicilioId;
        string localidadNombre;
        string provinciaNombre;
        await using (var ubicacion = new SqlCommand(ubicacionSql, connection, transaction))
        {
            ubicacion.Parameters.Add("@LocalidadId", SqlDbType.Int).Value = request.LocalidadId;
            ubicacion.Parameters.Add("@ProvinciaId", SqlDbType.Int).Value = request.ProvinciaId;
            await using var reader = await ubicacion.ExecuteReaderAsync(cancellationToken);
            if (!await reader.ReadAsync(cancellationToken))
                throw new CheckoutPublicoException(
                    "Seleccioná una provincia y localidad válidas para la entrega.");

            tipoDomicilioId = reader.GetInt32(0);
            localidadNombre = reader.GetString(1);
            provinciaNombre = reader.GetString(2);
        }

        const string buscarSql = """
            SELECT TOP (1) DomicilioClienteId
            FROM dbo.DomicilioCliente WITH (UPDLOCK, HOLDLOCK)
            WHERE ClienteId = @ClienteId
              AND TipoDomicilioId = @TipoDomicilioId
              AND Activo = 1
              AND UPPER(LTRIM(RTRIM(Calle))) = UPPER(@Calle)
              AND UPPER(LTRIM(RTRIM(Altura))) = UPPER(@Altura)
              AND UPPER(ISNULL(LTRIM(RTRIM(PisoDepto)), '')) = UPPER(@PisoDepto)
              AND UPPER(ISNULL(LTRIM(RTRIM(Barrio)), '')) = UPPER(@Barrio)
              AND UPPER(ISNULL(LTRIM(RTRIM(CodigoPostal)), '')) = UPPER(@CodigoPostal)
              AND LocalidadId = @LocalidadId
              AND ProvinciaId = @ProvinciaId
            ORDER BY DomicilioClienteId;
            """;

        int? domicilioClienteId;
        await using (var buscar = new SqlCommand(buscarSql, connection, transaction))
        {
            AgregarParametrosDomicilio(buscar, clienteId, tipoDomicilioId, request);
            var result = await buscar.ExecuteScalarAsync(cancellationToken);
            domicilioClienteId = result is null || result == DBNull.Value
                ? null
                : Convert.ToInt32(result, CultureInfo.InvariantCulture);
        }

        if (!domicilioClienteId.HasValue)
        {
            var direccionInterna = string.Join(" ", new[]
            {
                request.Calle,
                request.Altura,
                request.PisoDepto,
                request.Barrio,
                request.CodigoPostal
            }.Where(parte => !string.IsNullOrWhiteSpace(parte)));

            if (direccionInterna.Length > 250)
                throw new CheckoutPublicoException(
                    "El domicilio es demasiado extenso. Abreviá calle, piso, barrio o código postal.");

            await using var insertar = new SqlCommand(
                "dbo.sp_DomicilioCliente_Insert", connection, transaction)
            {
                CommandType = CommandType.StoredProcedure
            };
            insertar.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
            insertar.Parameters.Add("@TipoDomicilio", SqlDbType.VarChar, 30).Value = "Entrega";
            insertar.Parameters.Add("@Calle", SqlDbType.VarChar, 120).Value = request.Calle;
            insertar.Parameters.Add("@Altura", SqlDbType.VarChar, 20).Value = request.Altura;
            insertar.Parameters.Add("@PisoDepto", SqlDbType.VarChar, 50).Value =
                (object?)request.PisoDepto ?? DBNull.Value;
            insertar.Parameters.Add("@Barrio", SqlDbType.VarChar, 100).Value =
                (object?)request.Barrio ?? DBNull.Value;
            insertar.Parameters.Add("@CodigoPostal", SqlDbType.VarChar, 20).Value =
                (object?)request.CodigoPostal ?? DBNull.Value;
            insertar.Parameters.Add("@LocalidadId", SqlDbType.Int).Value = request.LocalidadId;
            insertar.Parameters.Add("@ProvinciaId", SqlDbType.Int).Value = request.ProvinciaId;
            insertar.Parameters.Add("@TipoDomicilioId", SqlDbType.Int).Value = tipoDomicilioId;

            var result = await insertar.ExecuteScalarAsync(cancellationToken);
            if (result is null || result == DBNull.Value)
                throw new CheckoutPublicoException("No se pudo registrar el domicilio de entrega.");

            domicilioClienteId = Convert.ToInt32(result, CultureInfo.InvariantCulture);
        }

        var partes = new List<string> { $"{request.Calle} {request.Altura}" };
        if (request.PisoDepto is not null) partes.Add(request.PisoDepto);
        if (request.Barrio is not null) partes.Add(request.Barrio);
        partes.Add($"{localidadNombre}, {provinciaNombre}");
        if (request.CodigoPostal is not null) partes.Add($"CP {request.CodigoPostal}");

        var domicilioEntrega = string.Join(" - ", partes);
        if (domicilioEntrega.Length > 300)
            throw new CheckoutPublicoException(
                "El domicilio de entrega es demasiado extenso. Abreviá piso, barrio o código postal.");

        return new DomicilioEntregaResultado(domicilioClienteId.Value, domicilioEntrega);
    }

    private static void AgregarParametrosDomicilio(
        SqlCommand command,
        int clienteId,
        int tipoDomicilioId,
        CheckoutPublicoRequest request)
    {
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
        command.Parameters.Add("@TipoDomicilioId", SqlDbType.Int).Value = tipoDomicilioId;
        command.Parameters.Add("@Calle", SqlDbType.VarChar, 120).Value = request.Calle;
        command.Parameters.Add("@Altura", SqlDbType.VarChar, 20).Value = request.Altura;
        command.Parameters.Add("@PisoDepto", SqlDbType.VarChar, 50).Value = request.PisoDepto ?? "";
        command.Parameters.Add("@Barrio", SqlDbType.VarChar, 100).Value = request.Barrio ?? "";
        command.Parameters.Add("@CodigoPostal", SqlDbType.VarChar, 20).Value = request.CodigoPostal ?? "";
        command.Parameters.Add("@LocalidadId", SqlDbType.Int).Value = request.LocalidadId;
        command.Parameters.Add("@ProvinciaId", SqlDbType.Int).Value = request.ProvinciaId;
    }

    private static async Task<int> ObtenerOCrearCarritoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        CarritoEncontrado? existente,
        Guid solicitudId,
        int clienteId,
        CancellationToken cancellationToken)
    {
        if (existente is null)
        {
            const string insertSql = """
                INSERT dbo.Carrito
                    (ClienteId, IdentificadorSesion, Estado, FechaCreacion, FechaUltimaActividad, Activo)
                OUTPUT INSERTED.CarritoId
                VALUES
                    (@ClienteId, @SolicitudId, 'Activo', GETDATE(), GETDATE(), 1);
                """;

            await using var insertar = new SqlCommand(insertSql, connection, transaction);
            insertar.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
            insertar.Parameters.Add("@SolicitudId", SqlDbType.UniqueIdentifier).Value = solicitudId;
            return Convert.ToInt32(
                await insertar.ExecuteScalarAsync(cancellationToken),
                CultureInfo.InvariantCulture);
        }

        if (existente.ClienteId is int clienteExistenteId && clienteExistenteId != clienteId)
            throw new CheckoutPublicoException(
                "La identificación de esta solicitud ya está asociada a otro comprador.",
                esConflicto: true);

        const string updateSql = """
            UPDATE dbo.Carrito
            SET ClienteId = @ClienteId,
                Estado = 'Activo',
                FechaAbandono = NULL,
                FechaUltimaActividad = GETDATE(),
                Activo = 1
            WHERE CarritoId = @CarritoId AND PedidoIdConvertido IS NULL;
            """;

        await using var actualizar = new SqlCommand(updateSql, connection, transaction);
        actualizar.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
        actualizar.Parameters.Add("@CarritoId", SqlDbType.Int).Value = existente.CarritoId;
        if (await actualizar.ExecuteNonQueryAsync(cancellationToken) != 1)
            throw new CheckoutPublicoException("La solicitud ya no se encuentra disponible.", esConflicto: true);

        return existente.CarritoId;
    }

    private static async Task ReemplazarItemsAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int carritoId,
        IEnumerable<CheckoutItem> items,
        CancellationToken cancellationToken)
    {
        await using (var eliminar = new SqlCommand(
                         "DELETE dbo.DetalleCarrito WHERE CarritoId = @CarritoId;",
                         connection,
                         transaction))
        {
            eliminar.Parameters.Add("@CarritoId", SqlDbType.Int).Value = carritoId;
            await eliminar.ExecuteNonQueryAsync(cancellationToken);
        }

        foreach (var item in items)
        {
            await using var guardar = new SqlCommand("dbo.sp_Carrito_GuardarItem", connection, transaction)
            {
                CommandType = CommandType.StoredProcedure
            };
            guardar.Parameters.Add("@CarritoId", SqlDbType.Int).Value = carritoId;
            guardar.Parameters.Add("@ProductoId", SqlDbType.Int).Value = item.ProductoId;
            guardar.Parameters.Add("@Cantidad", SqlDbType.Decimal).Value = item.Cantidad;
            guardar.Parameters["@Cantidad"].Precision = 18;
            guardar.Parameters["@Cantidad"].Scale = 2;
            await guardar.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private static async Task<PedidoResultado> ConvertirEnPedidoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int carritoId,
        string? observaciones,
        int domicilioClienteId,
        string domicilioEntrega,
        CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand("dbo.sp_Carrito_ConvertirEnPedido", connection, transaction)
        {
            CommandType = CommandType.StoredProcedure
        };
        command.Parameters.Add("@CarritoId", SqlDbType.Int).Value = carritoId;
        command.Parameters.Add("@Observaciones", SqlDbType.VarChar, 250).Value =
            (object?)observaciones ?? DBNull.Value;
        command.Parameters.Add("@DomicilioClienteId", SqlDbType.Int).Value = domicilioClienteId;
        command.Parameters.Add("@DomicilioEntrega", SqlDbType.VarChar, 300).Value = domicilioEntrega;

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
            throw new CheckoutPublicoException("No se pudo generar el pedido.");

        return new PedidoResultado(
            reader.GetInt32(reader.GetOrdinal("PedidoId")),
            reader.GetInt32(reader.GetOrdinal("ClienteId")),
            reader.GetDecimal(reader.GetOrdinal("Total")),
            reader.GetString(reader.GetOrdinal("DomicilioEntrega")));
    }

    private static async Task<PedidoResultado> CargarPedidoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int pedidoId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT PedidoId, ClienteId, Total, DomicilioEntrega
            FROM dbo.Pedido
            WHERE PedidoId = @PedidoId;
            """;

        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.Add("@PedidoId", SqlDbType.Int).Value = pedidoId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
            throw new CheckoutPublicoException("La solicitud figura procesada, pero no se encontró el pedido.");

        return new PedidoResultado(
            reader.GetInt32(0),
            reader.GetInt32(1),
            reader.GetDecimal(2),
            reader.IsDBNull(3) ? "" : reader.GetString(3));
    }

    private static async Task<List<PedidoLinea>> CargarLineasPedidoAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int pedidoId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT p.Nombre, d.Cantidad, d.PrecioUnitario, d.Subtotal
            FROM dbo.DetallePedido d
            INNER JOIN dbo.Producto p ON p.ProductoId = d.ProductoId
            WHERE d.PedidoId = @PedidoId
            ORDER BY d.DetallePedidoId;
            """;

        var resultado = new List<PedidoLinea>();
        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.Add("@PedidoId", SqlDbType.Int).Value = pedidoId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            resultado.Add(new PedidoLinea(
                reader.GetString(0),
                reader.GetDecimal(1),
                reader.GetDecimal(2),
                reader.GetDecimal(3)));
        }

        return resultado;
    }

    private static string ArmarCorreo(
        CheckoutPublicoRequest request,
        PedidoResultado pedido,
        IEnumerable<PedidoLinea> lineas)
    {
        var cultura = CultureInfo.GetCultureInfo("es-AR");
        var nombre = WebUtility.HtmlEncode(request.Nombre);
        var domicilio = WebUtility.HtmlEncode(pedido.DomicilioEntrega);
        var filas = new StringBuilder();

        foreach (var linea in lineas)
        {
            filas.Append("<tr>")
                .Append("<td style=\"padding:8px;border-bottom:1px solid #ddd\">")
                .Append(WebUtility.HtmlEncode(linea.Nombre))
                .Append("</td><td style=\"padding:8px;border-bottom:1px solid #ddd;text-align:center\">")
                .Append(linea.Cantidad.ToString("0.##", cultura))
                .Append("</td><td style=\"padding:8px;border-bottom:1px solid #ddd;text-align:right\">")
                .Append(linea.PrecioUnitario.ToString("C", cultura))
                .Append("</td><td style=\"padding:8px;border-bottom:1px solid #ddd;text-align:right\">")
                .Append(linea.Subtotal.ToString("C", cultura))
                .Append("</td></tr>");
        }

        return $$"""
            <div style="font-family:Arial,sans-serif;color:#2f2f2f;max-width:680px;margin:auto">
              <h2 style="color:#7a4b2a">Recibimos tu solicitud de compra</h2>
              <p>Hola {{nombre}},</p>
              <p>Tu solicitud <strong>#{{pedido.PedidoId}}</strong> fue registrada y quedó en estado
                 <strong>Pendiente</strong>.</p>
              <p>El equipo de TEKA se comunicará con vos para confirmar la disponibilidad,
                 la forma de entrega y el pago.</p>
              <p><strong>Domicilio de entrega informado:</strong> {{domicilio}}</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <thead>
                  <tr style="background:#f3eee9">
                    <th style="padding:8px;text-align:left">Producto</th>
                    <th style="padding:8px">Cantidad</th>
                    <th style="padding:8px;text-align:right">Precio</th>
                    <th style="padding:8px;text-align:right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>{{filas}}</tbody>
              </table>
              <p style="font-size:18px;text-align:right"><strong>Total: {{pedido.Total.ToString("C", cultura)}}</strong></p>
              <p>Este correo confirma la recepción de la solicitud; todavía no representa una venta confirmada.</p>
              <p>Gracias por elegir TEKA Muebles.</p>
            </div>
            """;
    }

    private static async Task RollbackSeguroAsync(
        SqlTransaction transaction,
        CancellationToken cancellationToken)
    {
        try
        {
            if (transaction.Connection is not null)
                await transaction.RollbackAsync(cancellationToken);
        }
        catch
        {
            // La excepción original es la que debe informarse y registrarse.
        }
    }

    private sealed class CheckoutPublicoException(string message, bool esConflicto = false)
        : Exception(message)
    {
        public bool EsConflicto { get; } = esConflicto;
    }

    private sealed record CheckoutItem(int ProductoId, decimal Cantidad);
    private sealed record CatalogoItem(int ProductoId, string Nombre, decimal Precio);
    private sealed record CarritoEncontrado(int CarritoId, int? ClienteId, string Estado, int? PedidoId);
    private sealed record ValoresClienteInvitado(int TipoDocumentoId, int CondicionIvaId);
    private sealed record DomicilioEntregaResultado(int DomicilioClienteId, string DomicilioEntrega);
    private sealed record PedidoResultado(int PedidoId, int ClienteId, decimal Total, string DomicilioEntrega);
    private sealed record PedidoLinea(string Nombre, decimal Cantidad, decimal PrecioUnitario, decimal Subtotal);
}
