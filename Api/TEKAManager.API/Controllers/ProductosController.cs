using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(
        IProductoService productoService,
        ILogger<ProductosController> logger)
    {
        _productoService = productoService;
        _logger = logger;
    }

    /// <summary>Obtiene todos los productos.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var productos = await _productoService.GetAllAsync();
        return Ok(productos);
    }

    /// <summary>Obtiene un producto por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await _productoService.GetByIdAsync(id);

        if (producto is null)
        {
            return NotFound(new
            {
                mensaje = $"Producto con ID {id} no encontrado."
            });
        }

        return Ok(producto);
    }

    /// <summary>Crea un nuevo producto.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Insert([FromBody] ProductoInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _productoService.InsertAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id },
                new { productoId = id }
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                mensaje = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al insertar producto.");

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    /// <summary>Actualiza un producto existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _productoService.UpdateAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                mensaje = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar producto {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    /// <summary>Baja lógica de un producto (inactivación).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(int id, [FromBody] ProductoDeleteRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _productoService.DeleteAsync(id, request);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar producto {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }


/// <summary>Reactiva un producto inactivo.</summary>
[HttpPost("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Activate(int id)
    {
        try
        {
            await _productoService.ActivateAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al activar producto {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = "Error interno al activar el producto.",
                detalle = ex.InnerException?.Message
            });
        }
    }

}