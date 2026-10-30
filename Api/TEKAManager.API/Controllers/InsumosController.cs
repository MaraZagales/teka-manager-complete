using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class InsumosController : ControllerBase
{
    private readonly IInsumoService _insumoService;
    private readonly ILogger<InsumosController> _logger;

    public InsumosController(IInsumoService insumoService, ILogger<InsumosController> logger)
    {
        _insumoService = insumoService;
        _logger = logger;
    }

    /// <summary>Obtiene todos los insumos.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var insumos = await _insumoService.GetAllAsync();
        return Ok(insumos);
    }

    /// <summary>Obtiene un insumo por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var insumo = await _insumoService.GetByIdAsync(id);
        if (insumo is null)
            return NotFound(new { mensaje = $"Insumo con ID {id} no encontrado." });

        return Ok(insumo);
    }

    /// <summary>Crea un nuevo insumo.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Insert([FromBody] InsumoInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _insumoService.InsertAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { insumoId = id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al insertar insumo.");
            return StatusCode(500, new { mensaje = "Error interno al crear el insumo." });
        }
    }

    /// <summary>Actualiza un insumo existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(int id, [FromBody] InsumoUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _insumoService.UpdateAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar insumo {Id}.", id);
            return StatusCode(500, new { mensaje = "Error interno al actualizar el insumo." });
        }
    }

    /// <summary>Baja lógica de un insumo (inactivación).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, [FromBody] InsumoDeleteRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _insumoService.DeleteAsync(id, request);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar insumo {Id}.", id);
            return StatusCode(500, new { mensaje = "Error interno al inactivar el insumo." });
        }
    }


/// <summary>Reactiva un insumo inactivo.</summary>
[HttpPost("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            await _insumoService.ActivateAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al activar insumo {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = "Error interno al activar el insumo.",
                detalle = ex.InnerException?.Message
            });
        }
    }

}