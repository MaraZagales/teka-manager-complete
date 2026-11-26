using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

/// <summary>
/// Catálogos públicos mínimos utilizados para cargar un domicilio de entrega.
/// No expone clientes, domicilios ni información comercial interna.
/// </summary>
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("public-commerce")]
[Route("api/ecommerce/ubicaciones")]
public sealed class EcommerceUbicacionesController(TekaDbContext db) : ControllerBase
{
    [HttpGet("provincias")]
    public async Task<IActionResult> ObtenerProvincias(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT ProvinciaId, Nombre
            FROM dbo.Provincia
            WHERE Activo = 1
            ORDER BY Nombre;
            """;

        return Ok(await ConsultarAsync(sql, null, cancellationToken));
    }

    [HttpGet("localidades")]
    public async Task<IActionResult> ObtenerLocalidades(
        [FromQuery] int provinciaId,
        CancellationToken cancellationToken)
    {
        if (provinciaId <= 0)
            return BadRequest(new { mensaje = "Seleccioná una provincia válida." });

        const string sql = """
            SELECT LocalidadId, Nombre
            FROM dbo.Localidad
            WHERE Activo = 1 AND ProvinciaId = @ProvinciaId
            ORDER BY Nombre;
            """;

        return Ok(await ConsultarAsync(sql, provinciaId, cancellationToken));
    }

    private async Task<List<UbicacionPublica>> ConsultarAsync(
        string sql,
        int? provinciaId,
        CancellationToken cancellationToken)
    {
        var connection = (SqlConnection)db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        var resultado = new List<UbicacionPublica>();
        await using var command = new SqlCommand(sql, connection);
        if (provinciaId.HasValue)
            command.Parameters.Add("@ProvinciaId", SqlDbType.Int).Value = provinciaId.Value;

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
            resultado.Add(new UbicacionPublica(reader.GetInt32(0), reader.GetString(1)));

        return resultado;
    }

    public sealed record UbicacionPublica(int Id, string Descripcion);
}
