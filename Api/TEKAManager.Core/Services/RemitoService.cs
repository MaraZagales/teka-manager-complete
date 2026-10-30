using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class RemitoService : IRemitoService
{
    private readonly TekaDbContext _db;
    private readonly IPedidoService _pedidoService;

    public RemitoService(TekaDbContext db, IPedidoService pedidoService)
    {
        _db = db;
        _pedidoService = pedidoService;
    }

    public async Task<IEnumerable<RemitoDTO>> GetAllAsync()
    {
        var remitos = await _db.Database
            .SqlQueryRaw<Remito>("EXEC dbo.sp_Remito_GetAll")
            .ToListAsync();

        return remitos.Select(MapToDTO);
    }

    public async Task<RemitoConDetalleDTO?> GetByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_Remito_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@RemitoId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var remito = new RemitoConDetalleDTO
        {
            RemitoId = reader.GetInt32(reader.GetOrdinal("RemitoId")),
            PedidoId = reader.GetInt32(reader.GetOrdinal("PedidoId")),
            ClienteId = reader.GetInt32(reader.GetOrdinal("ClienteId")),
            ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
            ClienteApellido = GetNullableString(reader, "ClienteApellido"),
            FechaRemito = reader.GetDateTime(reader.GetOrdinal("FechaRemito")),
            NumeroRemito = GetNullableString(reader, "NumeroRemito"),
            DomicilioEntrega = GetNullableString(reader, "DomicilioEntrega"),
            Anulado = reader.GetBoolean(reader.GetOrdinal("Anulado")),
            MotivoAnulacion = GetNullableString(reader, "MotivoAnulacion"),
            FechaAnulacion = GetNullableDateTime(reader, "FechaAnulacion"),
            UsuarioAnulacion = GetNullableString(reader, "UsuarioAnulacion"),
            Entregado = reader.GetBoolean(reader.GetOrdinal("Entregado")),
            FechaEntrega = GetNullableDateTime(reader, "FechaEntrega"),
            Observaciones = GetNullableString(reader, "Observaciones")
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            remito.Detalles.Add(new DetalleRemitoDTO
            {
                DetalleRemitoId = reader.GetInt32(reader.GetOrdinal("DetalleRemitoId")),
                RemitoId = reader.GetInt32(reader.GetOrdinal("RemitoId")),
                ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
                ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
                ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
                Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad"))
            });
        }

        return remito;
    }

    public async Task<int> InsertDesdePedidoAsync(RemitoDesdePedidoRequest request)
    {
        var pedido = await ValidatePedidoExistenteConDetalleAsync(request.PedidoId);

        if (!string.Equals(pedido.EstadoPedidoNombre, "Confirmado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Solo se puede emitir un remito para un pedido confirmado.");

        // B1 comprueba nuevamente los cobros confirmados dentro de la transaccion SQL.
        // La API no altera stock ni crea comprobantes al emitir el remito.

        var pPedido = new SqlParameter("@PedidoId", request.PedidoId);
        var pNumero = new SqlParameter("@NumeroRemito", (object?)request.NumeroRemito ?? DBNull.Value);
        var pDomicilio = new SqlParameter("@DomicilioEntrega", (object?)request.DomicilioEntrega ?? DBNull.Value);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_Remito_InsertDesdePedido @PedidoId, @NumeroRemito, @DomicilioEntrega, @Observaciones",
                pPedido, pNumero, pDomicilio, pObservaciones)
            .ToListAsync();

        return result.FirstOrDefault();
    }

    public async Task EditarAsync(int id, RemitoEditarRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DomicilioEntrega))
            throw new InvalidOperationException("El domicilio es obligatorio.");
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Remito_Editar @RemitoId, @DomicilioEntrega, @Observaciones",
            new SqlParameter("@RemitoId", id),
            new SqlParameter("@DomicilioEntrega", request.DomicilioEntrega.Trim()),
            new SqlParameter("@Observaciones", (object?)request.Observaciones?.Trim() ?? DBNull.Value));
    }

    public async Task AnularAsync(int id, RemitoAnularRequest request, string? usuario)
    {
        if (string.IsNullOrWhiteSpace(request.Motivo) || request.Motivo.Trim().Length < 3)
            throw new InvalidOperationException("Indicá un motivo de al menos tres caracteres.");
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Remito_Anular @RemitoId, @Motivo, @Usuario",
            new SqlParameter("@RemitoId", id), new SqlParameter("@Motivo", request.Motivo.Trim()),
            new SqlParameter("@Usuario", (object?)usuario ?? DBNull.Value));
    }

    public async Task MarcarEntregadoAsync(int id, RemitoMarcarEntregadoRequest request)
    {
        var remito = await GetByIdAsync(id);

        if (remito is null)
            throw new InvalidOperationException("El remito indicado no existe.");

        if (remito.Entregado)
            throw new InvalidOperationException("El remito ya fue marcado como entregado.");

        var pedido = await _pedidoService.GetByIdAsync(remito.PedidoId);

        if (pedido is null)
            throw new InvalidOperationException("El pedido asociado al remito no existe.");

        if (!string.Equals(pedido.EstadoPedidoNombre, "Listo para Entrega", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("No se puede marcar entregado un remito cuyo pedido no está listo para entrega.");

        var pRemito = new SqlParameter("@RemitoId", id);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Remito_MarcarEntregado @RemitoId, @Observaciones",
            pRemito, pObservaciones);
    }

    private async Task<PedidoConDetalleDTO> ValidatePedidoExistenteConDetalleAsync(int pedidoId)
    {
        var pedido = await _pedidoService.GetByIdAsync(pedidoId);

        if (pedido is null)
            throw new InvalidOperationException("El pedido indicado no existe.");

        if (pedido.Detalles.Count == 0)
            throw new InvalidOperationException("No se puede emitir remito de un pedido sin detalles.");

        return pedido;
    }

    private static RemitoDTO MapToDTO(Remito r) => new()
    {
        RemitoId = r.RemitoId,
        PedidoId = r.PedidoId,
        ClienteId = r.ClienteId,
        ClienteNombre = r.ClienteNombre,
        ClienteApellido = r.ClienteApellido,
        FechaRemito = r.FechaRemito,
        NumeroRemito = r.NumeroRemito,
        DomicilioEntrega = r.DomicilioEntrega,
        Anulado = r.Anulado,
        MotivoAnulacion = r.MotivoAnulacion,
        FechaAnulacion = r.FechaAnulacion,
        UsuarioAnulacion = r.UsuarioAnulacion,
        Entregado = r.Entregado,
        FechaEntrega = r.FechaEntrega,
        Observaciones = r.Observaciones
    };

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }
}
