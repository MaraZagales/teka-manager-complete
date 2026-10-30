using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class DomicilioClienteService : IDomicilioClienteService
{
    private readonly TekaDbContext _db;
    private readonly TipoDomicilioService _types;

    public DomicilioClienteService(TekaDbContext db, TipoDomicilioService types)
    {
        _db = db;
        _types = types;
    }

    public async Task<IEnumerable<DomicilioClienteDTO>> GetByClienteAsync(int clienteId)
    {
        var pCliente = new SqlParameter("@ClienteId", clienteId);

        var domicilios = await _db.Database
            .SqlQueryRaw<DomicilioCliente>("EXEC dbo.sp_DomicilioCliente_GetByCliente @ClienteId", pCliente)
            .ToListAsync();

        return domicilios.Select(MapToDTO);
    }

    public async Task<DomicilioClienteDTO?> GetByIdAsync(int id)
    {
        var pId = new SqlParameter("@DomicilioClienteId", id);

        var domicilios = await _db.Database
            .SqlQueryRaw<DomicilioCliente>("EXEC dbo.sp_DomicilioCliente_GetById @DomicilioClienteId", pId)
            .ToListAsync();

        var domicilio = domicilios.FirstOrDefault();
        return domicilio is null ? null : MapToDTO(domicilio);
    }

    public async Task<int> InsertAsync(int clienteId, DomicilioClienteRequest request)
    {
        Validate(request);
        await ValidateClienteActivoAsync(clienteId);
        await ValidateLocationAsync(request.ProvinciaId, request.LocalidadId);
        var tipo = await ResolveTypeAsync(request);

        var pCliente = new SqlParameter("@ClienteId", clienteId);
        var pTipo = new SqlParameter("@TipoDomicilio", tipo.Nombre);
        var pTipoId = new SqlParameter("@TipoDomicilioId", tipo.TipoDomicilioId);
        var pCalle = new SqlParameter("@Calle", request.Calle);
        var pAltura = new SqlParameter("@Altura", request.Altura);
        var pPisoDepto = new SqlParameter("@PisoDepto", (object?)request.PisoDepto ?? DBNull.Value);
        var pBarrio = new SqlParameter("@Barrio", (object?)request.Barrio ?? DBNull.Value);
        var pCodigoPostal = new SqlParameter("@CodigoPostal", (object?)request.CodigoPostal ?? DBNull.Value);
        var pLocalidad = new SqlParameter("@LocalidadId", request.LocalidadId);
        var pProvincia = new SqlParameter("@ProvinciaId", request.ProvinciaId);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_DomicilioCliente_Insert @ClienteId, @TipoDomicilio,@Calle,@Altura,@PisoDepto, @Barrio, @CodigoPostal, @LocalidadId, @ProvinciaId, @TipoDomicilioId",
                pCliente, pTipo, pCalle, pAltura, pPisoDepto, pBarrio, pCodigoPostal, pLocalidad, pProvincia, pTipoId)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateAsync(int id, DomicilioClienteRequest request)
    {
        Validate(request);
        var current = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el domicilio solicitado.");
        await ValidateLocationAsync(request.ProvinciaId, request.LocalidadId);
        var tipo = await ResolveTypeAsync(request, current.TipoDomicilioId);

        var pId = new SqlParameter("@DomicilioClienteId", id);
        var pTipo = new SqlParameter("@TipoDomicilio", tipo.Nombre);
        var pTipoId = new SqlParameter("@TipoDomicilioId", tipo.TipoDomicilioId);
        var pCalle = new SqlParameter("@Calle", request.Calle);
        var pAltura = new SqlParameter("@Altura", request.Altura);
        var pPisoDepto = new SqlParameter("@PisoDepto", (object?)request.PisoDepto ?? DBNull.Value);
        var pBarrio = new SqlParameter("@Barrio", (object?)request.Barrio ?? DBNull.Value);
        var pCodigoPostal = new SqlParameter("@CodigoPostal", (object?)request.CodigoPostal ?? DBNull.Value);
        var pLocalidad = new SqlParameter("@LocalidadId", request.LocalidadId);
        var pProvincia = new SqlParameter("@ProvinciaId", request.ProvinciaId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_DomicilioCliente_Update @DomicilioClienteId, @TipoDomicilio, @Calle, @Altura, @PisoDepto, @Barrio, @CodigoPostal, @LocalidadId, @ProvinciaId, @TipoDomicilioId",
            pId, pTipo, pCalle, pAltura, pPisoDepto,pBarrio,pCodigoPostal,pLocalidad, pProvincia, pTipoId);
    }

    public async Task DeleteAsync(int id)
    {
        var domicilio = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el domicilio solicitado.");
        if (!domicilio.Activo) throw new InvalidOperationException("El domicilio ya se encuentra inactivo.");
        var pId = new SqlParameter("@DomicilioClienteId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_DomicilioCliente_Delete @DomicilioClienteId",
            pId);
    }

    public async Task ActivateAsync(int id)
    {
        var domicilio = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el domicilio solicitado.");
        if (domicilio.Activo) throw new InvalidOperationException("El domicilio ya se encuentra activo.");
        await ValidateClienteActivoAsync(domicilio.ClienteId);
        var tipo = domicilio.TipoDomicilioId is > 0 ? await _types.GetByIdAsync(domicilio.TipoDomicilioId.Value) : null;
        if (tipo is null || !tipo.Activo)
            throw new InvalidOperationException("El tipo de este domicilio está inactivo. Seleccioná un tipo activo antes de reactivarlo.");
        var pId = new SqlParameter("@DomicilioClienteId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_DomicilioCliente_Activar @DomicilioClienteId",
            pId);
    }

    private static void Validate(DomicilioClienteRequest request)
    {
        if (request.TipoDomicilioId is null && string.IsNullOrWhiteSpace(request.TipoDomicilio))
            throw new InvalidOperationException("El tipo de domicilio es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.Calle))
            throw new InvalidOperationException("La calle es obligatoria.");

        if (string.IsNullOrWhiteSpace(request.Altura))
            throw new InvalidOperationException("La altura es obligatoria.");
    }

    private async Task<TEKAManager.Core.DTOs.TipoDomicilioDTO> ResolveTypeAsync(DomicilioClienteRequest request, int? currentId = null)
    {
        var tipo = request.TipoDomicilioId is > 0
            ? await _types.GetByIdAsync(request.TipoDomicilioId.Value)
            : string.IsNullOrWhiteSpace(request.TipoDomicilio) ? null : await _types.GetByNameAsync(request.TipoDomicilio);
        if (tipo is null) throw new InvalidOperationException("Seleccioná un tipo de domicilio configurado.");
        if (!tipo.Activo && tipo.TipoDomicilioId != currentId)
            throw new InvalidOperationException("El tipo de domicilio seleccionado está inactivo.");
        return tipo;
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
            throw new InvalidOperationException("No se puede registrar domicilio para un cliente inactivo.");
    }

    private async Task ValidateLocationAsync(int provinciaId, int localidadId)
    {
        var count = await _db.Database.SqlQueryRaw<int>(
            "SELECT COUNT(1) AS Value FROM dbo.Localidad l INNER JOIN dbo.Provincia p ON p.ProvinciaId=l.ProvinciaId WHERE l.LocalidadId={0} AND l.ProvinciaId={1} AND l.Activo=1 AND p.Activo=1",
            localidadId, provinciaId).SingleAsync();
        if (count == 0) throw new InvalidOperationException("Seleccioná una provincia y localidad válidas.");
    }

    private static DomicilioClienteDTO MapToDTO(DomicilioCliente d) => new()
    {
        DomicilioClienteId = d.DomicilioClienteId,
        ClienteId = d.ClienteId,
        TipoDomicilio = d.TipoDomicilio,
        TipoDomicilioId = d.TipoDomicilioId,
        Direccion = d.Direccion,
        Calle = d.Calle,
        Altura = d.Altura,
        PisoDepto = d.PisoDepto,
        Barrio = d.Barrio,
        CodigoPostal = d.CodigoPostal,
        LocalidadId = d.LocalidadId,
        LocalidadNombre = d.LocalidadNombre,
        ProvinciaId = d.ProvinciaId,
        ProvinciaNombre = d.ProvinciaNombre,
        Activo = d.Activo
    };
}
