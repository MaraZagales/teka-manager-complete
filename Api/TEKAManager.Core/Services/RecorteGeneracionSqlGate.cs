using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

/// <summary>Bloqueo de sesión compartido por todas las instancias de la API.</summary>
public sealed class RecorteGeneracionSqlGate(TekaDbContext db) : IRecorteGeneracionGate
{
    public async Task<IAsyncDisposable> EntrarAsync(Guid solicitudUid, CancellationToken ct = default)
    {
        if (solicitudUid == Guid.Empty) throw new ArgumentException("Solicitud inválida.");
        var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        try
        {
            await using var command = new SqlCommand("dbo.sp_getapplock", connection)
            { CommandType = CommandType.StoredProcedure };
            var resource = "TEKA:RecorteGeneracion:" + solicitudUid.ToString("N");
            command.Parameters.Add("@Resource", SqlDbType.NVarChar, 255).Value = resource;
            command.Parameters.Add("@LockMode", SqlDbType.VarChar, 32).Value = "Exclusive";
            command.Parameters.Add("@LockOwner", SqlDbType.VarChar, 32).Value = "Session";
            command.Parameters.Add("@LockTimeout", SqlDbType.Int).Value = 0;
            var result = command.Parameters.Add("@RETURN_VALUE", SqlDbType.Int);
            result.Direction = ParameterDirection.ReturnValue;
            await command.ExecuteNonQueryAsync(ct);
            if (Convert.ToInt32(result.Value) < 0)
                throw new RecorteGeneracionEnCursoException();
            return new Releaser(connection, resource);
        }
        catch
        {
            await connection.DisposeAsync();
            throw;
        }
    }

    private sealed class Releaser(SqlConnection connection, string resource) : IAsyncDisposable
    {
        public async ValueTask DisposeAsync()
        {
            try
            {
                await using var command = new SqlCommand("dbo.sp_releaseapplock", connection)
                { CommandType = CommandType.StoredProcedure };
                command.Parameters.Add("@Resource", SqlDbType.NVarChar, 255).Value = resource;
                command.Parameters.Add("@LockOwner", SqlDbType.VarChar, 32).Value = "Session";
                await command.ExecuteNonQueryAsync();
            }
            finally { await connection.DisposeAsync(); }
        }
    }
}
