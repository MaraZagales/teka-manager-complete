using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Services;

/// <summary>Ejecuta exclusivamente los procedimientos SQL de Caja. No altera Cobros.</summary>
public sealed partial class CajaSqlService(TekaDbContext db)
{
    public async Task<List<Dictionary<string, object?>>> EjecutarAsync(string procedimiento,
        IReadOnlyDictionary<string, object?> parametros, CancellationToken ct)
    {
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await using var command = new SqlCommand(procedimiento, connection)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = 30
        };
        foreach (var (nombre, valor) in parametros)
            command.Parameters.AddWithValue("@" + nombre, valor ?? DBNull.Value);
        await connection.OpenAsync(ct);
        await using var reader = await command.ExecuteReaderAsync(ct);
        var filas = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync(ct))
        {
            var fila = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < reader.FieldCount; i++)
                fila[reader.GetName(i)] = await reader.IsDBNullAsync(i, ct) ? null : reader.GetValue(i);
            filas.Add(fila);
        }
        return filas;
    }
}
