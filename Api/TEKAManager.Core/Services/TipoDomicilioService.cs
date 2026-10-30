using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public sealed class TipoDomicilioService(TekaDbContext db)
{
    public static string Normalize(string value) => Regex.Replace(value.Trim(), @"\s+", " ");

    public Task<List<TipoDomicilioDTO>> GetAllAsync(bool onlyActive = false) => db.Database
        .SqlQueryRaw<TipoDomicilioDTO>("SELECT TipoDomicilioId, Nombre, Activo FROM dbo.TipoDomicilio WHERE (@OnlyActive = 0 OR Activo = 1) ORDER BY Nombre", new SqlParameter("@OnlyActive", onlyActive))
        .ToListAsync();

    public async Task<TipoDomicilioDTO?> GetByIdAsync(int id) => (await db.Database
        .SqlQueryRaw<TipoDomicilioDTO>("SELECT TipoDomicilioId, Nombre, Activo FROM dbo.TipoDomicilio WHERE TipoDomicilioId = @Id", new SqlParameter("@Id", id))
        .ToListAsync()).FirstOrDefault();

    public async Task<TipoDomicilioDTO?> GetByNameAsync(string name)
    {
        var normalized = Normalize(name);
        return (await GetAllAsync()).FirstOrDefault(item => string.Equals(Normalize(item.Nombre), normalized, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<int> InsertAsync(string name)
    {
        name = ValidName(name);
        if (await GetByNameAsync(name) is not null) throw new InvalidOperationException("Ya existe un tipo de domicilio con ese nombre.");
        var rows = await db.Database.SqlQueryRaw<int>(
            "INSERT dbo.TipoDomicilio (Nombre, Activo) VALUES (@Nombre, 1); SELECT CAST(SCOPE_IDENTITY() AS int) AS Value;",
            new SqlParameter("@Nombre", name)).ToListAsync();
        return rows.Single();
    }

    public async Task UpdateAsync(int id, string name)
    {
        name = ValidName(name);
        if (await GetByIdAsync(id) is null) throw new KeyNotFoundException("No se encontró el tipo de domicilio.");
        var duplicate = await GetByNameAsync(name);
        if (duplicate is not null && duplicate.TipoDomicilioId != id) throw new InvalidOperationException("Ya existe un tipo de domicilio con ese nombre.");
        await db.Database.ExecuteSqlRawAsync("UPDATE dbo.TipoDomicilio SET Nombre = @Nombre WHERE TipoDomicilioId = @Id", new SqlParameter("@Nombre", name), new SqlParameter("@Id", id));
    }

    public async Task SetActiveAsync(int id, bool active)
    {
        var current = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el tipo de domicilio.");
        if (current.Activo == active) throw new InvalidOperationException(active ? "El tipo ya está activo." : "El tipo ya está inactivo.");
        await db.Database.ExecuteSqlRawAsync("UPDATE dbo.TipoDomicilio SET Activo = @Activo WHERE TipoDomicilioId = @Id", new SqlParameter("@Activo", active), new SqlParameter("@Id", id));
    }

    private static string ValidName(string name)
    {
        name = Normalize(name ?? string.Empty);
        if (name.Length is < 1 or > 30) throw new ArgumentException("Ingresá un nombre de hasta 30 caracteres.");
        return name;
    }
}
