using System.Data;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class InteresComercialService(TekaDbContext db) : IInteresComercialService
{
    public async Task<IEnumerable<InteresComercialDTO>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_GetAll";
        command.CommandType = CommandType.StoredProcedure;
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        var result = new List<InteresComercialDTO>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) result.Add(Map(reader));
        return result;
    }

    public async Task<InteresComercialDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_GetById";
        command.CommandType = CommandType.StoredProcedure;
        Add(command, "@InteresComercialId", id);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<int> InsertAsync(InteresComercialInsertRequest request, CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_Insert";
        command.CommandType = CommandType.StoredProcedure;
        Add(command, "@ClienteId", request.ClienteId);
        Add(command, "@ClienteNombre", request.ClienteNombre);
        Add(command, "@ClienteApellido", request.ClienteApellido);
        Add(command, "@Telefono", request.Telefono);
        Add(command, "@Email", request.Email);
        Add(command, "@CanalVentaId", request.CanalVentaId);
        Add(command, "@TipoOrigen", request.TipoOrigen);
        Add(command, "@ReferenciaOrigen", request.ReferenciaOrigen);
        Add(command, "@Descripcion", request.Descripcion);
        Add(command, "@MontoPotencial", request.MontoPotencial);
        Add(command, "@UsuarioResponsableId", request.UsuarioResponsableId);
        Add(command, "@MotivoConsultaId", request.MotivoConsultaId);
        Add(command, "@ProductoConsultadoId", request.ProductoConsultadoId);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task UpdateAsync(int id, InteresComercialUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_Update";
        command.CommandType = CommandType.StoredProcedure;
        Add(command, "@InteresComercialId", id);
        Add(command, "@ClienteId", request.ClienteId);
        Add(command, "@ClienteNombre", Clean(request.ClienteNombre));
        Add(command, "@ClienteApellido", Clean(request.ClienteApellido));
        Add(command, "@Telefono", Clean(request.Telefono));
        Add(command, "@Email", Clean(request.Email)?.ToLowerInvariant());
        Add(command, "@CanalVentaId", request.CanalVentaId);
        Add(command, "@TipoOrigen", request.TipoOrigen);
        Add(command, "@ReferenciaOrigen", Clean(request.ReferenciaOrigen));
        Add(command, "@Descripcion", request.Descripcion.Trim());
        Add(command, "@MontoPotencial", request.MontoPotencial);
        Add(command, "@MotivoConsultaId", request.MotivoConsultaId);
        Add(command, "@ProductoConsultadoId", request.ProductoConsultadoId);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<ConsultaPublicaResultadoDTO> RegistrarConsultaPublicaAsync(ConsultaPublicaRequest request, CancellationToken cancellationToken = default)
    {
        if (request.SolicitudId == Guid.Empty) throw new InvalidOperationException("SolicitudId debe ser un UUID no vacío.");
        if (string.IsNullOrWhiteSpace(request.Email) && string.IsNullOrWhiteSpace(request.Telefono))
            throw new InvalidOperationException("Debe indicar al menos un correo o teléfono.");

        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_RegistrarConsultaPublica";
        command.CommandType = CommandType.StoredProcedure;
        Add(command, "@SolicitudId", request.SolicitudId);
        Add(command, "@Nombre", request.Nombre.Trim());
        Add(command, "@Apellido", Clean(request.Apellido));
        Add(command, "@Telefono", Clean(request.Telefono));
        Add(command, "@Email", Clean(request.Email)?.ToLowerInvariant());
        Add(command, "@Mensaje", request.Mensaje.Trim());
        Add(command, "@ProductoId", request.ProductoId);
        Add(command, "@MotivoConsultaId", request.MotivoConsultaId);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) throw new InvalidOperationException("La consulta no pudo registrarse.");
        return new ConsultaPublicaResultadoDTO
        {
            InteresComercialId = reader.GetInt32(reader.GetOrdinal("InteresComercialId")),
            Duplicada = reader.GetBoolean(reader.GetOrdinal("Duplicada"))
        };
    }

    public Task TomarAsync(int id, int usuarioId) => db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_InteresComercial_Tomar @p0,@p1", id, usuarioId);
    public Task VincularClienteAsync(int id, int clienteId, int usuarioId) =>
        db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_InteresComercial_VincularCliente @p0,@p1,@p2", id, clienteId, usuarioId);
    public Task DescartarAsync(int id, string motivo) => db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_InteresComercial_Descartar @p0,@p1", id, motivo);

    public async Task<int> CalificarAsync(int id, InteresCalificarRequest request)
    {
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_InteresComercial_Calificar";
        command.CommandType = CommandType.StoredProcedure;
        Add(command, "@InteresComercialId", id);
        Add(command, "@UsuarioResponsableId", request.UsuarioResponsableId);
        Add(command, "@Interes", request.Interes);
        Add(command, "@ProximaAccion", request.ProximaAccion);
        Add(command, "@FechaProximaAccion", request.FechaProximaAccion?.Date);
        Add(command, "@Observaciones", request.Observaciones);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        return Convert.ToInt32(await command.ExecuteScalarAsync());
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static void Add(IDbCommand command, string name, object? value) { var parameter = command.CreateParameter(); parameter.ParameterName = name; parameter.Value = value ?? DBNull.Value; command.Parameters.Add(parameter); }
    private static string? String(IDataRecord r, string name) => r.IsDBNull(r.GetOrdinal(name)) ? null : r.GetString(r.GetOrdinal(name));
    private static int? Int(IDataRecord r, string name) => r.IsDBNull(r.GetOrdinal(name)) ? null : r.GetInt32(r.GetOrdinal(name));
    private static DateTime? Date(IDataRecord r, string name) => r.IsDBNull(r.GetOrdinal(name)) ? null : r.GetDateTime(r.GetOrdinal(name));
    private static InteresComercialDTO Map(IDataRecord r) => new()
    {
        InteresComercialId = r.GetInt32(r.GetOrdinal("InteresComercialId")), ClienteId = Int(r, "ClienteId"),
        MotivoConsultaId = Int(r, "MotivoConsultaId"), MotivoConsultaNombre = String(r, "MotivoConsultaNombre"),
        ProductoConsultadoId = Int(r, "ProductoConsultadoId"), TipoPendiente = String(r, "TipoPendiente"),
        ClienteNombre = String(r, "ClienteNombre"), ClienteApellido = String(r, "ClienteApellido"), Telefono = String(r, "Telefono"), Email = String(r, "Email"),
        CanalVentaId = r.GetInt32(r.GetOrdinal("CanalVentaId")), CanalVentaNombre = r.GetString(r.GetOrdinal("CanalVentaNombre")),
        EstadoInteresComercialId = r.GetInt32(r.GetOrdinal("EstadoInteresComercialId")), EstadoNombre = r.GetString(r.GetOrdinal("EstadoNombre")),
        TipoOrigen = r.GetString(r.GetOrdinal("TipoOrigen")), ReferenciaOrigen = String(r, "ReferenciaOrigen"), CarritoId = Int(r, "CarritoId"),
        Descripcion = r.GetString(r.GetOrdinal("Descripcion")), MontoPotencial = r.GetDecimal(r.GetOrdinal("MontoPotencial")),
        UsuarioResponsableId = Int(r, "UsuarioResponsableId"), ResponsableNombre = String(r, "ResponsableNombre"), OportunidadComercialId = Int(r, "OportunidadComercialId"),
        FechaAlta = r.GetDateTime(r.GetOrdinal("FechaAlta")), FechaUltimaActividad = r.GetDateTime(r.GetOrdinal("FechaUltimaActividad")),
        FechaAtencion = Date(r, "FechaAtencion"), FechaCierre = Date(r, "FechaCierre"), MotivoDescarte = String(r, "MotivoDescarte"), Activo = r.GetBoolean(r.GetOrdinal("Activo"))
    };
}

public class CarritoService(TekaDbContext db) : ICarritoService
{
    public async Task<CarritoDTO> ObtenerOCrearAsync(CarritoObtenerOCrearRequest request)
    {
        if (request.ClienteId is null && request.IdentificadorSesion is null) throw new InvalidOperationException("Debe indicarse ClienteId o IdentificadorSesion.");
        var connection = db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Carrito_ObtenerOCrear"; command.CommandType = CommandType.StoredProcedure;
        Add(command, "@ClienteId", request.ClienteId); Add(command, "@IdentificadorSesion", request.IdentificadorSesion);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        await using var reader = await command.ExecuteReaderAsync(); await reader.ReadAsync(); var id = reader.GetInt32(reader.GetOrdinal("CarritoId"));
        await reader.DisposeAsync(); return (await GetByIdAsync(id))!;
    }

    public async Task<CarritoDTO?> GetByIdAsync(int id)
    {
        var connection = db.Database.GetDbConnection(); await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Carrito_GetById"; command.CommandType = CommandType.StoredProcedure; Add(command, "@CarritoId", id);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(); await using var r = await command.ExecuteReaderAsync(); if (!await r.ReadAsync()) return null;
        var result = new CarritoDTO { CarritoId = r.GetInt32(r.GetOrdinal("CarritoId")), ClienteId = Int(r, "ClienteId"), IdentificadorSesion = r.GetGuid(r.GetOrdinal("IdentificadorSesion")), Estado = r.GetString(r.GetOrdinal("Estado")), FechaCreacion = r.GetDateTime(r.GetOrdinal("FechaCreacion")), FechaUltimaActividad = r.GetDateTime(r.GetOrdinal("FechaUltimaActividad")), FechaAbandono = Date(r, "FechaAbandono"), FechaConversion = Date(r, "FechaConversion"), PedidoIdConvertido = Int(r, "PedidoIdConvertido"), FechaInicioCheckout = Date(r, "FechaInicioCheckout"), FechaUltimaActividadCheckout = Date(r, "FechaUltimaActividadCheckout"), CheckoutCompletadoFecha = Date(r, "CheckoutCompletadoFecha"), TotalReferencia = r.GetDecimal(r.GetOrdinal("TotalReferencia")) };
        await r.NextResultAsync(); while (await r.ReadAsync()) result.Items.Add(new() { DetalleCarritoId = r.GetInt32(r.GetOrdinal("DetalleCarritoId")), ProductoId = r.GetInt32(r.GetOrdinal("ProductoId")), ProductoNombre = r.GetString(r.GetOrdinal("ProductoNombre")), Cantidad = r.GetDecimal(r.GetOrdinal("Cantidad")), PrecioReferencia = r.IsDBNull(r.GetOrdinal("PrecioReferencia")) ? null : r.GetDecimal(r.GetOrdinal("PrecioReferencia")), FechaActualizacion = r.GetDateTime(r.GetOrdinal("FechaActualizacion")) });
        return result;
    }

    public Task GuardarItemAsync(int id, CarritoItemRequest request) => db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Carrito_GuardarItem @p0,@p1,@p2", id, request.ProductoId, request.Cantidad);
    public Task EliminarItemAsync(int id, int productoId) => db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Carrito_EliminarItem @p0,@p1", id, productoId);
    public Task AsignarClienteAsync(int id, int clienteId) => db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Carrito_AsignarCliente @p0,@p1", id, clienteId);

    public Task IniciarCheckoutAsync(int id, CheckoutSeguimientoRequest request, int? clienteAutenticadoId, CancellationToken cancellationToken = default) =>
        ExecuteAsync("dbo.sp_Carrito_IniciarCheckout", cancellationToken, ("@CarritoId", id), ("@IdentificadorSesion", request.IdentificadorSesion), ("@ClienteAutenticadoId", clienteAutenticadoId), ("@Nombre", request.Nombre), ("@Apellido", request.Apellido), ("@Telefono", request.Telefono), ("@Email", request.Email), ("@ConsentimientoContacto", request.ConsentimientoContacto));

    public Task RegistrarActividadCheckoutAsync(int id, Guid identificadorSesion, int? clienteAutenticadoId, CancellationToken cancellationToken = default) =>
        ExecuteAsync("dbo.sp_Carrito_RegistrarActividadCheckout", cancellationToken, ("@CarritoId", id), ("@IdentificadorSesion", identificadorSesion), ("@ClienteAutenticadoId", clienteAutenticadoId));

    public async Task<int> ProcesarAbandonadosAsync(int horasCarrito, int horasCheckout, CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection(); await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Carrito_ProcesarAbandonados"; command.CommandType = CommandType.StoredProcedure;
        Add(command, "@HorasInactividadCarrito", horasCarrito); Add(command, "@HorasInactividadCheckout", horasCheckout);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        var value = await command.ExecuteScalarAsync(cancellationToken); return value is null ? 0 : Convert.ToInt32(value);
    }

    public async Task<CheckoutCarritoDTO> CheckoutAsync(int id, string? observaciones)
    {
        var connection = db.Database.GetDbConnection(); await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Carrito_ConvertirEnPedido"; command.CommandType = CommandType.StoredProcedure; Add(command, "@CarritoId", id); Add(command, "@Observaciones", observaciones);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(); await using var r = await command.ExecuteReaderAsync(); await r.ReadAsync();
        return new() { PedidoId = r.GetInt32(r.GetOrdinal("PedidoId")), ClienteId = r.GetInt32(r.GetOrdinal("ClienteId")), Total = r.GetDecimal(r.GetOrdinal("Total")) };
    }

    private async Task ExecuteAsync(string procedure, CancellationToken cancellationToken, params (string Name, object? Value)[] parameters)
    {
        var connection = db.Database.GetDbConnection(); await using var command = connection.CreateCommand(); command.CommandText = procedure; command.CommandType = CommandType.StoredProcedure;
        foreach (var parameter in parameters) Add(command, parameter.Name, parameter.Value);
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken); await command.ExecuteNonQueryAsync(cancellationToken);
    }
    private static void Add(IDbCommand command, string name, object? value) { var parameter = command.CreateParameter(); parameter.ParameterName = name; parameter.Value = value ?? DBNull.Value; command.Parameters.Add(parameter); }
    private static int? Int(IDataRecord r, string name) => r.IsDBNull(r.GetOrdinal(name)) ? null : r.GetInt32(r.GetOrdinal(name));
    private static DateTime? Date(IDataRecord r, string name) => r.IsDBNull(r.GetOrdinal(name)) ? null : r.GetDateTime(r.GetOrdinal(name));
}
