using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record ClientePedidoRecienteDto(int PedidoId, DateTime FechaPedido, string EstadoPedidoNombre,
    decimal Total, decimal? Saldo);
public sealed record ClienteCuentaResumenDto(decimal Debe, decimal Haber, decimal Saldo,
    IReadOnlyList<ClienteCuentaMovimientoDto> UltimosMovimientos,
    IReadOnlyList<ClienteCuentaConceptoDto> Desglose);
public sealed record ClienteCuentaConceptoDto(int TipoMovimientoCuentaCorrienteId, string Nombre,
    int Signo, decimal Importe);
public sealed record ClienteCuentaMovimientoDto(int MovimientoCuentaCorrienteClienteId, DateTime FechaMovimiento,
    int TipoMovimientoCuentaCorrienteId, string TipoMovimientoNombre, int? PedidoId, int? ComprobanteId,
    int? CobroId, decimal Debe, decimal Haber, decimal Saldo, string? Observaciones);
public sealed record ClienteCuentaPaginaDto(int Total, int Pagina, int Tamano, decimal Debe, decimal Haber, decimal Saldo,
    IReadOnlyList<ClienteCuentaMovimientoDto> Movimientos);

/// <summary>Consulta el libro comercial existente sin registrar movimientos ni recalcular pedidos en el cliente.</summary>
public sealed class ClienteFichaConsultaService(TekaDbContext db, IPedidoService pedidos)
{
    private readonly string _connectionString = db.Database.GetConnectionString()
        ?? throw new InvalidOperationException("No hay conexión de datos configurada.");

    public async Task<IReadOnlyList<ClientePedidoRecienteDto>> PedidosRecientesAsync(int clienteId, CancellationToken ct)
    {
        var result = new List<ClientePedidoRecienteDto>();
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        await using (var command = new SqlCommand(@"
            SELECT TOP (5) p.PedidoId, p.FechaPedido, ep.Nombre, p.Total
            FROM dbo.Pedido p JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId
            WHERE p.ClienteId=@ClienteId ORDER BY p.FechaPedido DESC,p.PedidoId DESC", connection))
        {
            command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct)) result.Add(new ClientePedidoRecienteDto(
                reader.GetInt32(0), reader.GetDateTime(1), reader.GetString(2), reader.GetDecimal(3), null));
        }
        // Mismo procedimiento de saldo que Ventas. Se limita a cinco pedidos.
        for (var i = 0; i < result.Count; i++)
        {
            var order = result[i];
            var balance = await pedidos.GetSaldoAsync(order.PedidoId);
            result[i] = order with { Saldo = balance?.Saldo };
        }
        return result;
    }

    public async Task<ClienteCuentaResumenDto> ResumenAsync(int clienteId, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        var (debe, haber) = await TotalesAsync(connection, clienteId, ct);
        var latest = await LeerMovimientosAsync(connection, clienteId, null, null, null, 1, 5, ct);
        var breakdown = new List<ClienteCuentaConceptoDto>();
        await using (var command = new SqlCommand(@"
            SELECT t.TipoMovimientoCuentaCorrienteId,t.Nombre,t.Signo,SUM(m.Importe)
            FROM dbo.MovimientoCuentaCorrienteCliente m
            JOIN dbo.TipoMovimientoCuentaCorriente t ON t.TipoMovimientoCuentaCorrienteId=m.TipoMovimientoCuentaCorrienteId
            WHERE m.ClienteId=@ClienteId
            GROUP BY t.TipoMovimientoCuentaCorrienteId,t.Nombre,t.Signo
            ORDER BY t.Signo DESC,t.Nombre", connection))
        {
            command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct)) breakdown.Add(new ClienteCuentaConceptoDto(
                reader.GetInt32(0), reader.GetString(1), reader.GetInt16(2), reader.GetDecimal(3)));
        }
        return new ClienteCuentaResumenDto(debe, haber, debe - haber, latest, breakdown);
    }

    private static async Task<(decimal Debe, decimal Haber)> TotalesAsync(SqlConnection connection, int clienteId, CancellationToken ct)
    {
        await using (var command = new SqlCommand(@"
            SELECT COALESCE(SUM(CASE WHEN t.Signo=1 THEN m.Importe ELSE 0 END),0),
                   COALESCE(SUM(CASE WHEN t.Signo=-1 THEN m.Importe ELSE 0 END),0)
            FROM dbo.MovimientoCuentaCorrienteCliente m
            JOIN dbo.TipoMovimientoCuentaCorriente t ON t.TipoMovimientoCuentaCorrienteId=m.TipoMovimientoCuentaCorrienteId
            WHERE m.ClienteId=@ClienteId", connection))
        {
            command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
            await using var reader = await command.ExecuteReaderAsync(ct);
            await reader.ReadAsync(ct);
            return (reader.GetDecimal(0), reader.GetDecimal(1));
        }
    }

    public async Task<ClienteCuentaPaginaDto> MovimientosAsync(int clienteId, DateTime? desde,
        DateTime? hasta, int? tipoId, int pagina, int tamano, CancellationToken ct)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        var filter = @"m.ClienteId=@ClienteId AND (@Desde IS NULL OR m.FechaMovimiento>=@Desde)
            AND (@Hasta IS NULL OR m.FechaMovimiento<DATEADD(day,1,@Hasta))
            AND (@TipoId IS NULL OR m.TipoMovimientoCuentaCorrienteId=@TipoId)";
        int total;
        await using (var command = new SqlCommand($@"SELECT COUNT(*) FROM dbo.MovimientoCuentaCorrienteCliente m WHERE {filter}", connection))
        {
            AddFilters(command, clienteId, desde, hasta, tipoId);
            total = Convert.ToInt32(await command.ExecuteScalarAsync(ct));
        }
        var rows = await LeerMovimientosAsync(connection, clienteId, desde, hasta, tipoId, pagina, tamano, ct);
        var (debe, haber) = await TotalesAsync(connection, clienteId, ct);
        return new ClienteCuentaPaginaDto(total, pagina, tamano, debe, haber, debe - haber, rows);
    }

    private static async Task<IReadOnlyList<ClienteCuentaMovimientoDto>> LeerMovimientosAsync(SqlConnection connection,
        int clienteId, DateTime? desde, DateTime? hasta, int? tipoId, int pagina, int tamano, CancellationToken ct)
    {
        // El saldo acumulado se calcula sobre el libro completo antes de filtrar y paginar.
        const string sql = @"
            WITH Libro AS (
                SELECT m.MovimientoCuentaCorrienteClienteId,m.FechaMovimiento,m.TipoMovimientoCuentaCorrienteId,
                    t.Nombre AS TipoMovimientoNombre,m.PedidoId,m.ComprobanteId,m.CobroId,m.Observaciones,
                    CASE WHEN t.Signo=1 THEN m.Importe ELSE CONVERT(decimal(18,2),0) END AS Debe,
                    CASE WHEN t.Signo=-1 THEN m.Importe ELSE CONVERT(decimal(18,2),0) END AS Haber,
                    SUM(CONVERT(decimal(19,2),t.Signo*m.Importe)) OVER
                        (ORDER BY m.FechaMovimiento,m.MovimientoCuentaCorrienteClienteId ROWS UNBOUNDED PRECEDING) AS Saldo
                FROM dbo.MovimientoCuentaCorrienteCliente m
                JOIN dbo.TipoMovimientoCuentaCorriente t ON t.TipoMovimientoCuentaCorrienteId=m.TipoMovimientoCuentaCorrienteId
                WHERE m.ClienteId=@ClienteId
            )
            SELECT MovimientoCuentaCorrienteClienteId,FechaMovimiento,TipoMovimientoCuentaCorrienteId,
                TipoMovimientoNombre,PedidoId,ComprobanteId,CobroId,Debe,Haber,Saldo,Observaciones
            FROM Libro WHERE (@Desde IS NULL OR FechaMovimiento>=@Desde)
                AND (@Hasta IS NULL OR FechaMovimiento<DATEADD(day,1,@Hasta))
                AND (@TipoId IS NULL OR TipoMovimientoCuentaCorrienteId=@TipoId)
            ORDER BY FechaMovimiento DESC,MovimientoCuentaCorrienteClienteId DESC
            OFFSET @Offset ROWS FETCH NEXT @Tamano ROWS ONLY";
        var result = new List<ClienteCuentaMovimientoDto>();
        await using var command = new SqlCommand(sql, connection);
        AddFilters(command, clienteId, desde, hasta, tipoId);
        command.Parameters.Add("@Offset", SqlDbType.Int).Value = (pagina - 1) * tamano;
        command.Parameters.Add("@Tamano", SqlDbType.Int).Value = tamano;
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(new ClienteCuentaMovimientoDto(
            reader.GetInt32(0), reader.GetDateTime(1), reader.GetInt32(2), reader.GetString(3),
            reader.IsDBNull(4) ? null : reader.GetInt32(4), reader.IsDBNull(5) ? null : reader.GetInt32(5),
            reader.IsDBNull(6) ? null : reader.GetInt32(6), reader.GetDecimal(7), reader.GetDecimal(8),
            reader.GetDecimal(9), reader.IsDBNull(10) ? null : reader.GetString(10)));
        return result;
    }

    private static void AddFilters(SqlCommand command, int clientId, DateTime? from, DateTime? to, int? typeId)
    {
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clientId;
        command.Parameters.Add("@Desde", SqlDbType.DateTime).Value = (object?)from ?? DBNull.Value;
        command.Parameters.Add("@Hasta", SqlDbType.DateTime).Value = (object?)to ?? DBNull.Value;
        command.Parameters.Add("@TipoId", SqlDbType.Int).Value = (object?)typeId ?? DBNull.Value;
    }
}
