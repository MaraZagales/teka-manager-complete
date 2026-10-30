using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;
    private readonly ILogger<StockController> _logger;

    public StockController(IStockService stockService, ILogger<StockController> logger)
    {
        _stockService = stockService;
        _logger = logger;
    }

    // ── Stock de Productos ─────────────────────────────────────

    /// <summary>Obtiene el stock de todos los productos en todos los depósitos.</summary>
    [HttpGet("productos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStockProducto()
    {
        var stock = await _stockService.GetAllStockProductoAsync();
        return Ok(stock);
    }

    /// <summary>Obtiene el stock de un producto en todos los depósitos.</summary>
    [HttpGet("productos/por-producto/{productoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockProductoByProducto(int productoId)
    {
        var stock = await _stockService.GetStockProductoByProductoAsync(productoId);
        return Ok(stock);
    }

    /// <summary>Obtiene el stock de todos los productos en un depósito.</summary>
    [HttpGet("productos/por-deposito/{depositoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockProductoByDeposito(int depositoId)
    {
        var stock = await _stockService.GetStockProductoByDepositoAsync(depositoId);
        return Ok(stock);
    }

    // ── Stock de Insumos ───────────────────────────────────────

    /// <summary>Obtiene el stock de todos los insumos en todos los depósitos.</summary>
    [HttpGet("insumos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllStockInsumo()
    {
        var stock = await _stockService.GetAllStockInsumoAsync();
        return Ok(stock);
    }

    /// <summary>Obtiene el stock de un insumo en todos los depósitos.</summary>
    [HttpGet("insumos/por-insumo/{insumoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockInsumoByInsumo(int insumoId)
    {
        var stock = await _stockService.GetStockInsumoByInsumoAsync(insumoId);
        return Ok(stock);
    }

    /// <summary>Obtiene el stock de todos los insumos en un depósito.</summary>
    [HttpGet("insumos/por-deposito/{depositoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockInsumoByDeposito(int depositoId)
    {
        var stock = await _stockService.GetStockInsumoByDepositoAsync(depositoId);
        return Ok(stock);
    }
}
