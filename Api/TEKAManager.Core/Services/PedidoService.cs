using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class PedidoService : IPedidoService
{
    private readonly TekaDbContext _db;

    public PedidoService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<PedidoDTO>> GetAllAsync()
    {
        var pedidos = await _db.Database
            .SqlQueryRaw<Pedido>("EXEC dbo.sp_Pedido_GetAll")
            .ToListAsync();

        return pedidos.Select(MapToDTO);
    }

    public async Task<PedidoConDetalleDTO?> GetByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_Pedido_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@PedidoId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var pedido = new PedidoConDetalleDTO
        {
            PedidoId = reader.GetInt32(reader.GetOrdinal("PedidoId")),
            FechaPedido = reader.GetDateTime(reader.GetOrdinal("FechaPedido")),
            ClienteId = reader.GetInt32(reader.GetOrdinal("ClienteId")),
            ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
            ClienteApellido = GetNullableString(reader, "ClienteApellido"),
            CanalVentaId = reader.GetInt32(reader.GetOrdinal("CanalVentaId")),
            CanalVentaNombre = reader.GetString(reader.GetOrdinal("CanalVentaNombre")),
            EstadoPedidoId = reader.GetInt32(reader.GetOrdinal("EstadoPedidoId")),
            EstadoPedidoNombre = reader.GetString(reader.GetOrdinal("EstadoPedidoNombre")),
            Total = reader.GetDecimal(reader.GetOrdinal("Total")),
            Observaciones = GetNullableString(reader, "Observaciones")
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            pedido.Detalles.Add(new PedidoDetalleDTO
            {
                DetallePedidoId = reader.GetInt32(reader.GetOrdinal("DetallePedidoId")),
                PedidoId = reader.GetInt32(reader.GetOrdinal("PedidoId")),
                ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
                ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
                ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
                Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
                PrecioUnitario = reader.GetDecimal(reader.GetOrdinal("PrecioUnitario")),
                Subtotal = reader.GetDecimal(reader.GetOrdinal("Subtotal"))
            });
        }

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            pedido.HistorialEstados.Add(new HistorialEstadoPedidoDTO
            {
                HistorialEstadoPedidoId = reader.GetInt32(reader.GetOrdinal("HistorialEstadoPedidoId")),
                PedidoId = reader.GetInt32(reader.GetOrdinal("PedidoId")),
                EstadoPedidoId = reader.GetInt32(reader.GetOrdinal("EstadoPedidoId")),
                EstadoPedidoNombre = reader.GetString(reader.GetOrdinal("EstadoPedidoNombre")),
                FechaCambio = reader.GetDateTime(reader.GetOrdinal("FechaCambio")),
                Observaciones = GetNullableString(reader, "Observaciones")
            });
        }

        return pedido;
    }

    public async Task<int> InsertAsync(PedidoInsertRequest request)
    {
        if (request.Detalles.Count == 0)
            throw new InvalidOperationException("El pedido debe tener al menos un detalle.");

        if (request.Detalles.Any(d => d.Cantidad <= 0))
            throw new InvalidOperationException("Todas las cantidades deben ser mayores a cero.");

        await ValidateClienteActivoAsync(request.ClienteId);
        foreach (var productoId in request.Detalles.Select(d => d.ProductoId).Distinct())
            await ValidateProductoActivoAsync(productoId);

        // La transacción y el descuento de stock pertenecen exclusivamente al SP integral.
        // No volver a agregar detalles ni confirmar el pedido desde la API.
        var detallesJson = System.Text.Json.JsonSerializer.Serialize(
            request.Detalles.Select(d => new { d.ProductoId, d.Cantidad }));
        // Los SP anidados pueden emitir result sets antes del SELECT final del pedido.
        // Consumir todos los resultados y tomar solo el contrato escalar llamado PedidoId.
        var connection = _db.Database.GetDbConnection();
        var closeConnection = connection.State != ConnectionState.Open;
        if (closeConnection)
            await connection.OpenAsync();

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = "dbo.sp_TEKA_PedidoManual_Guardar";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@ClienteId", SqlDbType.Int) { Value = request.ClienteId });
            command.Parameters.Add(new SqlParameter("@CanalVentaId", SqlDbType.Int) { Value = request.CanalVentaId });
            // El pedido directo conserva exactamente el contrato anterior del procedimiento.
            // El parÃ¡metro de origen solo se envÃ­a para una conversiÃ³n comercial explÃ­cita.
            if (request.OportunidadComercialId.HasValue)
                command.Parameters.Add(new SqlParameter("@OportunidadComercialId", SqlDbType.Int) { Value = request.OportunidadComercialId.Value });
            command.Parameters.Add(new SqlParameter("@DetallesJson", SqlDbType.NVarChar, -1) { Value = detallesJson });
            command.Parameters.Add(new SqlParameter("@Observaciones", SqlDbType.VarChar, 500)
            {
                Value = (object?)request.Observaciones ?? DBNull.Value
            });

            int? pedidoId = null;
            await using (var reader = await command.ExecuteReaderAsync())
            {
                do
                {
                    if (reader.FieldCount != 1 ||
                        !string.Equals(reader.GetName(0), "PedidoId", StringComparison.OrdinalIgnoreCase))
                        continue;

                    if (pedidoId.HasValue)
                        throw new DataException("El procedimiento devolvió más de un identificador de pedido.");
                    if (!await reader.ReadAsync() || await reader.IsDBNullAsync(0))
                        throw new DataException("El procedimiento no devolvió el identificador del pedido creado.");

                    var value = reader.GetValue(0);
                    if (value is decimal decimalValue && decimalValue != decimal.Truncate(decimalValue))
                        throw new DataException("El procedimiento devolvió un identificador de pedido fraccionario.");
                    pedidoId = checked(Convert.ToInt32(
                        value,
                        System.Globalization.CultureInfo.InvariantCulture));
                    if (pedidoId <= 0)
                        throw new DataException("El procedimiento devolvió un identificador de pedido inválido.");
                    if (await reader.ReadAsync())
                        throw new DataException("El procedimiento devolvió más de un pedido creado.");
                } while (await reader.NextResultAsync());
            }

            if (!pedidoId.HasValue)
                throw new DataException("El procedimiento no devolvió el identificador del pedido creado.");

            // Verificar el identificador contra la MISMA conexion utilizada para registrar.
            await using var verify = connection.CreateCommand();
            verify.CommandText = "SELECT COUNT_BIG(1) FROM dbo.Pedido WHERE PedidoId = @PedidoId";
            verify.Parameters.Add(new SqlParameter("@PedidoId", SqlDbType.Int) { Value = pedidoId.Value });
            var exists = Convert.ToInt64(await verify.ExecuteScalarAsync()) == 1;
            if (!exists)
                throw new DataException("El pedido fue procesado, pero no pudo verificarse en la base de datos.");

            return pedidoId.Value;
        }
        finally
        {
            if (closeConnection)
                await connection.CloseAsync();
        }
    }

    public async Task AgregarDetalleAsync(int id, PedidoDetalleInsertRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        await ValidateProductoActivoAsync(request.ProductoId);

        var pPedido = new SqlParameter("@PedidoId", id);
        var pProducto = new SqlParameter("@ProductoId", request.ProductoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Pedido_AgregarDetalle @PedidoId, @ProductoId, @Cantidad",
            pPedido, pProducto, pCantidad);
    }

    public async Task ActualizarDetalleAsync(int detalleId, PedidoDetalleUpdateRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        var pDetalle = new SqlParameter("@DetallePedidoId", detalleId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Pedido_ActualizarDetalle @DetallePedidoId, @Cantidad",
            pDetalle, pCantidad);
    }

    public async Task EliminarDetalleAsync(int detalleId)
    {
        var pDetalle = new SqlParameter("@DetallePedidoId", detalleId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Pedido_EliminarDetalle @DetallePedidoId",
            pDetalle);
    }

    public async Task<PedidoSaldoDTO?> GetSaldoAsync(int id)
    {
        // Consulta la fuente de verdad financiera del SQL consolidado.
        // La confirmacion definitiva siempre se valida transaccionalmente en SQL.
        var pedido = await GetByIdAsync(id);
        if (pedido is null) return null;
        var param = new SqlParameter("@PedidoId", id);
        var saldos = await _db.Database
            .SqlQueryRaw<PedidoSaldoDTO>("EXEC dbo.sp_TEKA_Ventas_SaldoPedido @PedidoId", param)
            .ToListAsync();
        return saldos.FirstOrDefault();
    }

    public Task ConfirmarPagadoAsync(int id, PedidoConfirmarPagadoRequest request)
    {
        // El pedido manual ya se confirma y descuenta stock al guardarse.
        // El cobro se confirma exclusivamente por el modulo de Cobros.
        throw new InvalidOperationException(
            "Esta operacion fue reemplazada: registre y confirme el pago desde Cobros. " +
            "No debe volver a confirmarse ni descontarse stock del pedido.");
    }

    public async Task<PedidoAnulacionIntegralResultado> AnularIntegralAsync(
        int pedidoId, PedidoAnulacionIntegralRequest request)
    {
        PedidoAnulacionValidacion.Validar(pedidoId, request, permitirResolverCuenta:true);
        await VerificarContratoAnulacionAsync();
        // Mensaje temprano, sin sustituir las validaciones transaccionales del procedimiento.
        var estados=await _db.Database.SqlQueryRaw<string>("""
            SELECT e.Nombre AS Value FROM dbo.Pedido p JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@Id
            """,new SqlParameter("@Id",pedidoId)).ToListAsync();
        if(estados.Count!=1)throw new InvalidOperationException("Pedido inexistente.");
        if(estados[0] is not("Entregado" or "Cancelado"))
            throw new InvalidOperationException("La anulación integral solo corresponde a ventas pagadas y entregadas. La devolución de señas antes de la entrega está pendiente y fuera de este circuito.");
        if(request.ReintegroRealizado&&request.MedioReintegro=="Transferencia"&&!request.CuentaBancariaId.HasValue)
            request.CuentaBancariaId=await ResolverCuentaReintegroAsync(pedidoId);
        PedidoAnulacionValidacion.Validar(pedidoId,request);

        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_TEKA_Venta_AnularIntegral";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@PedidoId", SqlDbType.Int) { Value = pedidoId });
        command.Parameters.Add(new SqlParameter("@UsuarioId", SqlDbType.Int) { Value = request.UsuarioId });
        command.Parameters.Add(new SqlParameter("@Motivo", SqlDbType.VarChar, 250) { Value = request.Motivo.Trim() });
        command.Parameters.Add(new SqlParameter("@MedioReintegro", SqlDbType.VarChar, 50) { Value = (object?)request.MedioReintegro ?? DBNull.Value });
        command.Parameters.Add(new SqlParameter("@CajaId", SqlDbType.Int) { Value = (object?)request.CajaId ?? DBNull.Value });
        command.Parameters.Add(new SqlParameter("@ReferenciaReintegro", SqlDbType.VarChar, 100) { Value = (object?)request.ReferenciaReintegro?.Trim() ?? DBNull.Value });
        command.Parameters.Add(new SqlParameter("@CuentaBancariaId", SqlDbType.Int) { Value = (object?)request.CuentaBancariaId ?? DBNull.Value });
        command.Parameters.Add(new SqlParameter("@MercaderiaRecibidaApta", SqlDbType.Bit) { Value = request.MercaderiaRecibidaApta });
        command.Parameters.Add(new SqlParameter("@ReintegroRealizado", SqlDbType.Bit) { Value = request.ReintegroRealizado });
        var openedHere = connection.State != ConnectionState.Open;
        try
        {
            if (openedHere) await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) throw new InvalidOperationException("La anulación no devolvió un resultado. Consultá el pedido antes de reintentar.");
            return new PedidoAnulacionIntegralResultado
            {
                PedidoId = reader.GetInt32(reader.GetOrdinal("PedidoId")),
                NotaCreditoId = reader.IsDBNull(reader.GetOrdinal("NotaCreditoId")) ? null : reader.GetInt32(reader.GetOrdinal("NotaCreditoId")),
                NumeroNotaCredito = reader.IsDBNull(reader.GetOrdinal("NumeroNotaCredito")) ? null : reader.GetInt64(reader.GetOrdinal("NumeroNotaCredito")),
                DevolucionVentaIntegralId = reader.IsDBNull(reader.GetOrdinal("DevolucionVentaIntegralId")) ? null : reader.GetInt32(reader.GetOrdinal("DevolucionVentaIntegralId")),
                ImporteReintegrado = reader.GetDecimal(reader.GetOrdinal("ImporteReintegrado")),
                ImporteComprobante = reader.IsDBNull(reader.GetOrdinal("ImporteComprobante")) ? null : reader.GetDecimal(reader.GetOrdinal("ImporteComprobante"))
            };
        }
        finally { if (openedHere) await connection.CloseAsync(); }
    }

    public async Task CancelarAsync(int id, PedidoCancelarRequest request)
    {
        PedidoAnulacionValidacion.ValidarCancelacion(id,request);
        await VerificarContratoCancelacionAsync();
        // Nunca pasa por la operación de reintegro ni por la emisión de documentos.
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Pedido_Cancelar @PedidoId,@Observaciones,@UsuarioId",
            new SqlParameter("@PedidoId",id),new SqlParameter("@Observaciones",request.Observaciones!.Trim()),new SqlParameter("@UsuarioId",request.UsuarioId));
    }

    private Task VerificarContratoAnulacionAsync()=>VerificarContratoOperacionAsync(false);
    private Task VerificarContratoCancelacionAsync()=>VerificarContratoOperacionAsync(true);

    private async Task VerificarContratoOperacionAsync(bool cancelacion)
    {
        // No ejecutar las reglas V1 demasiado amplias. Ambas versiones se publican atómicamente.
        var versions=await _db.Database.SqlQueryRaw<int>("""
            SELECT COUNT(*) AS Value FROM sys.extended_properties
            WHERE class=1 AND major_id=OBJECT_ID(@Procedimiento)
              AND minor_id=0 AND name=@Version AND CONVERT(nvarchar(30),value)='2'
              AND EXISTS(SELECT 1 FROM sys.extended_properties WHERE class=1 AND minor_id=0
                AND major_id=OBJECT_ID('dbo.sp_TEKA_Venta_AnularIntegral') AND name='TEKA_AnulacionVersion' AND CONVERT(nvarchar(30),value)='2')
              AND EXISTS(SELECT 1 FROM sys.extended_properties WHERE class=1 AND minor_id=0
                AND major_id=OBJECT_ID('dbo.sp_Pedido_Cancelar') AND name='TEKA_CancelacionVersion' AND CONVERT(nvarchar(30),value)='2')
              AND COL_LENGTH('dbo.EgresoDevolucionVenta','CajaMovimientoId') IS NOT NULL
              AND COL_LENGTH('dbo.EgresoDevolucionVenta','MovimientoFinancieroId') IS NOT NULL
              AND EXISTS(SELECT 1 FROM sys.parameters WHERE object_id=OBJECT_ID('dbo.sp_TEKA_Venta_AnularIntegral') AND name='@CuentaBancariaId')
              AND EXISTS(SELECT 1 FROM sys.parameters WHERE object_id=OBJECT_ID('dbo.sp_Pedido_Cancelar') AND name='@UsuarioId');
            """,new SqlParameter("@Procedimiento",cancelacion?"dbo.sp_Pedido_Cancelar":"dbo.sp_TEKA_Venta_AnularIntegral"),
                new SqlParameter("@Version",cancelacion?"TEKA_CancelacionVersion":"TEKA_AnulacionVersion")).ToListAsync();
        if(versions.Single()!=1)throw new PedidoAnulacionSchemaException();
    }

    private async Task<int> ResolverCuentaReintegroAsync(int pedidoId)
    {
        // Un reintento conserva el origen bancario ya persistido, aunque la configuración
        // haya cambiado. No actualiza históricos ni intenta completar devoluciones sin libro.
        var previous=await _db.Database.SqlQueryRaw<int>("""
            SELECT e.CuentaBancariaId AS Value
            FROM dbo.DevolucionVentaIntegral d
            JOIN dbo.EgresoDevolucionVenta e ON e.DevolucionVentaIntegralId=d.DevolucionVentaIntegralId
            WHERE d.PedidoId=@PedidoId AND d.MedioReintegro='Transferencia' AND d.ReintegroRealizado=1
              AND e.MovimientoFinancieroId IS NOT NULL AND e.CuentaBancariaId IS NOT NULL
            """,new SqlParameter("@PedidoId",pedidoId)).ToListAsync();
        if(previous.Count==1)return previous[0];
        if(previous.Count>1)throw new InvalidOperationException("Hay más de un origen bancario para el reintegro. Revisá su historial.");
        // El catálogo existente es la configuración: no hay campo de cuenta predeterminada.
        // TOP(2) permite detectar ambigüedad; jamás elegir la primera entre varias cuentas.
        var accounts=await _db.Database.SqlQueryRaw<int>("""
            SELECT TOP(2) CuentaBancariaId AS Value FROM dbo.CuentaBancariaTEKA
            WHERE Activa=1 AND Moneda='ARS' ORDER BY CuentaBancariaId
            """).ToListAsync();
        return PedidoAnulacionValidacion.ElegirCuentaConfigurada(accounts);
    }

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private async Task ValidateClienteActivoAsync(int clienteId)
    {
        var pCliente = new SqlParameter("@ClienteId", clienteId);

        var clientes = await _db.Database
            .SqlQueryRaw<Cliente>("EXEC dbo.sp_Cliente_GetById @ClienteId", pCliente)
            .ToListAsync();

        var cliente = clientes.FirstOrDefault();

        if (cliente is null)
            throw new InvalidOperationException("El cliente indicado no existe.");

        if (!cliente.Activo)
            throw new InvalidOperationException("No se puede crear un pedido para un cliente inactivo.");
    }

    private async Task ValidateProductoActivoAsync(int productoId)
    {
        var productos = await _db.Database
            .SqlQueryRaw<Producto>(
                "EXEC dbo.sp_Producto_GetById @ProductoId",
                new SqlParameter("@ProductoId", productoId))
            .ToListAsync();

        var producto = productos.FirstOrDefault()
            ?? throw new InvalidOperationException($"El producto {productoId} no existe.");

        if (!producto.Activo)
            throw new InvalidOperationException($"No se puede vender el producto inactivo {producto.Nombre}.");
    }

    private async Task ValidateStockProductoAsync(int productoId, int depositoId, decimal cantidad)
    {
        var stocks = await _db.Database
            .SqlQueryRaw<StockProducto>(
                "EXEC dbo.sp_StockProducto_GetByProducto @ProductoId",
                new SqlParameter("@ProductoId", productoId))
            .ToListAsync();

        var disponible = stocks
            .Where(s => s.DepositoId == depositoId)
            .Sum(s => s.CantidadActual);

        if (disponible < cantidad)
            throw new InvalidOperationException("No hay stock suficiente para confirmar el pedido.");
    }

    private static PedidoDTO MapToDTO(Pedido p) => new()
    {
        PedidoId = p.PedidoId,
        FechaPedido = p.FechaPedido,
        ClienteId = p.ClienteId,
        ClienteNombre = p.ClienteNombre,
        ClienteApellido = p.ClienteApellido,
        CanalVentaId = p.CanalVentaId,
        CanalVentaNombre = p.CanalVentaNombre,
        EstadoPedidoId = p.EstadoPedidoId,
        EstadoPedidoNombre = p.EstadoPedidoNombre,
        Total = p.Total,
        Observaciones = p.Observaciones
    };
}
