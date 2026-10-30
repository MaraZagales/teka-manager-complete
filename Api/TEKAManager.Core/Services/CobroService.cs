using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class CobroService : ICobroService
{
    private readonly TekaDbContext _db;
    private readonly IPedidoService _pedidoService;

    public CobroService(TekaDbContext db, IPedidoService pedidoService)
    {
        _db = db;
        _pedidoService = pedidoService;
    }

    public async Task<IEnumerable<CobroDTO>> GetAllAsync()
    {
        var cobros = await _db.Database
            .SqlQueryRaw<CobroResumen>("EXEC dbo.sp_Cobro_GetAll")
            .ToListAsync();

        return cobros.Select(MapToDTO);
    }

    public async Task<CobroConAplicacionesDTO?> GetByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_Cobro_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@CobroId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var cobro = new CobroConAplicacionesDTO
        {
            CobroId = reader.GetInt32(reader.GetOrdinal("CobroId")),
            ClienteId = reader.GetInt32(reader.GetOrdinal("ClienteId")),
            ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
            ClienteApellido = GetNullableString(reader, "ClienteApellido"),
            PedidoId = GetNullableInt(reader, "PedidoId"),
            CajaId = GetNullableInt(reader, "CajaId"),
            CajaNombre = GetNullableString(reader, "CajaNombre"),
            MedioCobroId = reader.GetInt32(reader.GetOrdinal("MedioCobroId")),
            MedioCobroNombre = reader.GetString(reader.GetOrdinal("MedioCobroNombre")),
            RequiereReferencia = reader.GetBoolean(reader.GetOrdinal("RequiereReferencia")),
            EstadoCobroId = reader.GetInt32(reader.GetOrdinal("EstadoCobroId")),
            EstadoCobroNombre = reader.GetString(reader.GetOrdinal("EstadoCobroNombre")),
            FechaCobro = reader.GetDateTime(reader.GetOrdinal("FechaCobro")),
            ImporteBase = reader.GetDecimal(reader.GetOrdinal("ImporteBase")),
            PorcentajeAplicado = reader.GetDecimal(reader.GetOrdinal("PorcentajeAplicado")),
            ImporteAjuste = reader.GetDecimal(reader.GetOrdinal("ImporteAjuste")),
            ImporteFinal = reader.GetDecimal(reader.GetOrdinal("ImporteFinal")),
            ReferenciaExterna = GetNullableString(reader, "ReferenciaExterna"),
            Observaciones = GetNullableString(reader, "Observaciones")
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            cobro.Aplicaciones.Add(new AplicacionCobroDTO
            {
                AplicacionCobroId = reader.GetInt32(reader.GetOrdinal("AplicacionCobroId")),
                CobroId = reader.GetInt32(reader.GetOrdinal("CobroId")),
                ComprobanteId = reader.GetInt32(reader.GetOrdinal("ComprobanteId")),
                NumeroComprobante = GetNullableLong(reader, "NumeroComprobante"),
                FechaComprobante = GetNullableDateTime(reader, "FechaComprobante"),
                ImporteTotal = GetNullableDecimal(reader, "ImporteTotal"),
                ImporteAplicado = reader.GetDecimal(reader.GetOrdinal("ImporteAplicado"))
            });
        }

        return cobro;
    }

    public async Task<int> RegistrarAsync(CobroRegistrarRequest request)
    {
        ValidarImportes(request.ImporteBase,request.PorcentajeRecargoTarjeta);
        await ValidateClienteActivoAsync(request.ClienteId);
        var medio = await ValidateMedioCobroAsync(request.MedioCobroId, request.ReferenciaExterna);
        await ValidarCajaDelMedioAsync(medio.Descripcion,request.CajaId);
        var importeBase = await ResolveImporteBaseAsync(request);

        if (importeBase <= 0)
            throw new InvalidOperationException("El importe base debe ser mayor a cero.");

        if (request.PorcentajeRecargoTarjeta < 0 || request.PorcentajeRecargoTarjeta > 100)
            throw new InvalidOperationException("El porcentaje de recargo debe estar entre 0 y 100%.");

        if (!string.Equals(medio.Descripcion, "Tarjeta Credito", StringComparison.OrdinalIgnoreCase)
            && request.PorcentajeRecargoTarjeta != 0)
        {
            throw new InvalidOperationException("El recargo solo puede aplicarse a pagos con tarjeta de credito.");
        }

        var pCliente = new SqlParameter("@ClienteId", request.ClienteId);
        var pPedido = new SqlParameter("@PedidoId", (object?)request.PedidoId ?? DBNull.Value);
        var pCaja = new SqlParameter("@CajaId", (object?)request.CajaId ?? DBNull.Value);
        var pMedio = new SqlParameter("@MedioCobroId", request.MedioCobroId);
        var pImporte = new SqlParameter("@ImporteBase", importeBase);
        var pRecargo = new SqlParameter("@PorcentajeRecargoTarjeta", request.PorcentajeRecargoTarjeta);
        var pReferencia = new SqlParameter("@ReferenciaExterna", (object?)request.ReferenciaExterna ?? DBNull.Value);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_Cobro_Registrar @ClienteId, @PedidoId, @CajaId, @MedioCobroId, @ImporteBase, @PorcentajeRecargoTarjeta, @ReferenciaExterna, @Observaciones",
                pCliente, pPedido, pCaja, pMedio, pImporte, pRecargo, pReferencia, pObservaciones)
            .ToListAsync();

        return result.FirstOrDefault();
    }

    public async Task ConfirmarAsync(int id, CobroConfirmarRequest request, int usuarioId)
    {
        if(id<=0||usuarioId<=0||request.CuentaBancariaId is <=0)throw new InvalidOperationException("Cobro, cuenta o responsable autenticado inválidos.");
        if((request.Observaciones?.Length??0)>250)throw new InvalidOperationException("Las observaciones admiten hasta 250 caracteres.");
        var cobro=await GetByIdAsync(id)??throw new InvalidOperationException("El cobro no existe.");
        if(cobro.MedioCobroNombre=="Efectivo"&&request.CuentaBancariaId.HasValue)throw new InvalidOperationException("El efectivo no utiliza cuenta bancaria.");
        if(cobro.EstadoCobroNombre=="Confirmado")
        {
            // Reintento de confirmación: no registrar otro ingreso ni reconstruir históricos faltantes.
            var valid=await _db.Database.SqlQueryRaw<int>("""
                SELECT CASE WHEN
                  (SELECT COUNT(*) FROM dbo.CajaMovimiento WHERE CobroId=@Id)+
                  (SELECT COUNT(*) FROM dbo.MovimientoFinanciero WHERE CobroId=@Id)=1
                  AND (EXISTS(SELECT 1 FROM dbo.CajaMovimiento cm JOIN dbo.CajaSesion s ON s.CajaSesionId=cm.CajaSesionId
                        WHERE cm.CobroId=@Id AND @Medio='Efectivo' AND cm.Tipo='IngresoCobro' AND cm.Importe=@Importe AND s.CajaId=@Caja)
                    OR EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero mf WHERE mf.CobroId=@Id AND @Medio<>'Efectivo'
                        AND mf.OrigenTipo='Cobro' AND mf.OrigenId=@Id AND mf.Tipo='Ingreso' AND mf.Estado='Registrado' AND mf.Importe=@Importe
                        AND mf.Medio=CASE WHEN @Medio IN('Transferencia','Transferencia Bancaria') THEN 'Transferencia'
                          WHEN @Medio IN('Tarjeta Credito','Tarjeta Crédito','Tarjeta Debito','Tarjeta Débito') THEN 'Tarjeta'
                          WHEN @Medio='Cheque' THEN 'Cheque' WHEN @Medio IN('Deposito','Depósito') THEN 'Deposito'
                          WHEN @Medio IN('Pasarela','Mercado Pago') THEN 'Pasarela' ELSE NULL END
                        AND (@Cuenta IS NULL OR mf.CuentaBancariaId=@Cuenta)))
                  THEN 1 ELSE 0 END AS Value
                """,new SqlParameter("@Id",id),new SqlParameter("@Medio",cobro.MedioCobroNombre),
                new SqlParameter("@Importe",cobro.ImporteFinal),new SqlParameter("@Caja",(object?)cobro.CajaId??DBNull.Value),
                new SqlParameter("@Cuenta",(object?)request.CuentaBancariaId??DBNull.Value)).ToListAsync();
            if(valid.Single()!=1)throw new InvalidOperationException("El cobro ya está confirmado, pero sus libros requieren conciliación. No se generó otro ingreso.");
            return;
        }
        if(cobro.EstadoCobroNombre!="Pendiente")throw new InvalidOperationException("Solo se puede confirmar un cobro pendiente.");
        var medio=await ValidateMedioCobroAsync(cobro.MedioCobroId,cobro.ReferenciaExterna);
        await ValidarCajaDelMedioAsync(medio.Descripcion,cobro.CajaId,true);
        var pCobro = new SqlParameter("@CobroId", id);
        var pUsuario = new SqlParameter("@UsuarioId", usuarioId);
        var pDeposito = new SqlParameter("@DepositoId", (object?)request.DepositoId ?? DBNull.Value);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        if(request.CuentaBancariaId.HasValue)
        {
            var supports=await _db.Database.SqlQueryRaw<int>("SELECT COUNT(*) AS Value FROM sys.parameters WHERE object_id=OBJECT_ID('dbo.sp_Cobro_Confirmar') AND name='@CuentaBancariaId'").ToListAsync();
            if(supports.Single()!=1)throw new CobroIntegracionSchemaException();
            await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Cobro_Confirmar @CobroId,@DepositoId,@Observaciones,@UsuarioId,@CuentaBancariaId",
                pCobro,pDeposito,pObservaciones,pUsuario,new SqlParameter("@CuentaBancariaId",request.CuentaBancariaId));
        }
        else await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cobro_Confirmar @CobroId, @DepositoId, @Observaciones, @UsuarioId",pCobro,pDeposito,pObservaciones,pUsuario);
    }

    public async Task ActualizarPendienteAsync(int id, CobroActualizarPendienteRequest request, int usuarioId)
    {
        if(id<=0||usuarioId<=0)throw new InvalidOperationException("Cobro y responsable autenticado son obligatorios.");
        ValidarImportes(request.ImporteBase,request.PorcentajeRecargoTarjeta);
        if (request.ImporteBase <= 0)
            throw new InvalidOperationException("El importe del cobro debe ser mayor a cero.");
        if (request.PorcentajeRecargoTarjeta < 0 || request.PorcentajeRecargoTarjeta > 100)
            throw new InvalidOperationException("El recargo debe estar entre 0 y 100%.");

        var medio = await ValidateMedioCobroAsync(request.MedioCobroId, request.ReferenciaExterna);
        await ValidarCajaDelMedioAsync(medio.Descripcion,request.CajaId);
        if (!string.Equals(medio.Descripcion, "Tarjeta Credito", StringComparison.OrdinalIgnoreCase)
            && request.PorcentajeRecargoTarjeta != 0)
            throw new InvalidOperationException("El recargo solo corresponde a tarjeta de crédito.");

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cobro_ActualizarPendiente @CobroId,@CajaId,@MedioCobroId,@ImporteBase,@PorcentajeRecargoTarjeta,@ReferenciaExterna,@Observaciones,@UsuarioId",
            new SqlParameter("@CobroId", id),
            new SqlParameter("@CajaId", (object?)request.CajaId ?? DBNull.Value),
            new SqlParameter("@MedioCobroId", request.MedioCobroId),
            new SqlParameter("@ImporteBase", request.ImporteBase),
            new SqlParameter("@PorcentajeRecargoTarjeta", request.PorcentajeRecargoTarjeta),
            new SqlParameter("@ReferenciaExterna", (object?)request.ReferenciaExterna ?? DBNull.Value),
            new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value),
            new SqlParameter("@UsuarioId", usuarioId));
    }

    public async Task AnularAsync(int id, CobroAnularRequest request)
    {
        var pCobro = new SqlParameter("@CobroId", id);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cobro_Anular @CobroId, @Observaciones",
            pCobro, pObservaciones);
    }

    public async Task AplicarAsync(int id, AplicacionCobroRequest request)
    {
        if (request.ImporteAplicado <= 0)
            throw new InvalidOperationException("El importe aplicado debe ser mayor a cero.");

        var cobro = await GetByIdAsync(id)
            ?? throw new InvalidOperationException("El cobro indicado no existe.");

        if (!string.Equals(cobro.EstadoCobroNombre, "Confirmado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Solo se pueden aplicar cobros confirmados.");

        if (cobro.Aplicaciones.Sum(a => a.ImporteAplicado) + request.ImporteAplicado > cobro.ImporteFinal)
            throw new InvalidOperationException("La suma aplicada supera el importe final del cobro.");

        var pCobro = new SqlParameter("@CobroId", id);
        var pComprobante = new SqlParameter("@ComprobanteId", request.ComprobanteId);
        var pImporte = new SqlParameter("@ImporteAplicado", request.ImporteAplicado);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_AplicacionCobro_Aplicar @CobroId, @ComprobanteId, @ImporteAplicado",
            pCobro, pComprobante, pImporte);
    }

    public async Task<IEnumerable<AplicacionCobroDTO>> GetAplicacionesByCobroAsync(int id)
    {
        var pCobro = new SqlParameter("@CobroId", id);

        var aplicaciones = await _db.Database
            .SqlQueryRaw<AplicacionCobroPorCobro>(
                "EXEC dbo.sp_AplicacionCobro_GetByCobro @CobroId",
                pCobro)
            .ToListAsync();

        return aplicaciones.Select(MapToDTO);
    }

    public async Task<IEnumerable<MovimientoCuentaCorrienteClienteDTO>> GetCuentaCorrienteAsync(int? clienteId)
    {
        List<MovimientoCuentaCorrienteCliente> movimientos;

        if (clienteId.HasValue)
        {
            var pCliente = new SqlParameter("@ClienteId", clienteId.Value);

            movimientos = await _db.Database
                .SqlQueryRaw<MovimientoCuentaCorrienteCliente>(
                    "EXEC dbo.sp_MovimientoCuentaCorrienteCliente_GetByCliente @ClienteId",
                    pCliente)
                .ToListAsync();
        }
        else
        {
            movimientos = await _db.Database
                .SqlQueryRaw<MovimientoCuentaCorrienteCliente>("EXEC dbo.sp_MovimientoCuentaCorrienteCliente_GetAll")
                .ToListAsync();
        }

        return movimientos.Select(MapToDTO);
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
            throw new InvalidOperationException("No se puede registrar un cobro para un cliente inactivo.");
    }

    private static void ValidarImportes(decimal importe,decimal porcentaje)
    {
        if(importe<=0||importe>9999999999999999.99m||decimal.Round(importe,2)!=importe)
            throw new InvalidOperationException("Ingresá un importe positivo con hasta dos decimales.");
        if(porcentaje<0||porcentaje>100||decimal.Round(porcentaje,2)!=porcentaje)
            throw new InvalidOperationException("El recargo admite de 0 a 100 y hasta dos decimales.");
    }

    private async Task ValidarCajaDelMedioAsync(string medio,int? caja,bool requiereSesion=false)
    {
        if(!string.Equals(medio,"Efectivo",StringComparison.OrdinalIgnoreCase))
        {
            if(caja.HasValue)throw new InvalidOperationException("Los cobros electrónicos no utilizan caja física. Quitá la caja seleccionada.");
            return;
        }
        var rows=await _db.Database.SqlQueryRaw<int>("""
            SELECT COUNT(*) AS Value FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId
            WHERE c.Activo=1 AND cfg.EsFisica=1 AND c.CajaId=@Caja
              AND (SELECT COUNT(*) FROM dbo.Caja c2 JOIN dbo.CajaConfiguracion f2 ON f2.CajaId=c2.CajaId WHERE c2.Activo=1 AND f2.EsFisica=1)=1
              AND (@RequiereSesion=0 OR (SELECT COUNT(*) FROM dbo.CajaSesion s WHERE s.CajaId=c.CajaId AND s.Estado='Abierta')=1)
            """,new SqlParameter("@Caja",(object?)caja??DBNull.Value),new SqlParameter("@RequiereSesion",requiereSesion)).ToListAsync();
        if(rows.Single()!=1)throw new InvalidOperationException(requiereSesion
            ?"El efectivo requiere Caja Principal con una sesión abierta. No se confirmó el cobro."
            :"Seleccioná la única Caja Principal física activa para el cobro en efectivo.");
    }

    private async Task<decimal> ResolveImporteBaseAsync(CobroRegistrarRequest request)
    {
        if (!request.PedidoId.HasValue)
            return request.ImporteBase;

        var pedido = await _pedidoService.GetByIdAsync(request.PedidoId.Value)
            ?? throw new InvalidOperationException("El pedido asociado al cobro no existe.");

        if (pedido.ClienteId != request.ClienteId)
            throw new InvalidOperationException("El pedido asociado no pertenece al cliente indicado.");

        if (pedido.Detalles.Count == 0)
            throw new InvalidOperationException("No se puede registrar un cobro para un pedido sin detalles.");

        // SQL es la autoridad final sobre el saldo y los cobros pendientes.
        // Esta validacion previa solo evita llamadas innecesarias y mensajes confusos.
        var estadosPermitidos = new[] { "Pendiente", "Confirmado", "En Produccion", "Listo para Entrega" };
        if (!estadosPermitidos.Contains(pedido.EstadoPedidoNombre, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("El estado actual del pedido no admite nuevos cobros.");

        return request.ImporteBase;
    }

    private async Task<MedioCobroLookupDTO> ValidateMedioCobroAsync(int medioCobroId, string? referencia)
    {
        var medios = await _db.Database
            .SqlQueryRaw<MedioCobroLookupDTO>("EXEC dbo.sp_MedioCobro_GetLookup")
            .ToListAsync();

        var medio = medios.FirstOrDefault(m => m.Id == medioCobroId);

        if (medio is null)
            throw new InvalidOperationException("El medio de cobro indicado no existe o no esta activo.");

        if (medio.RequiereReferencia && string.IsNullOrWhiteSpace(referencia))
            throw new InvalidOperationException("El medio de cobro requiere referencia externa.");

        return medio;
    }

    private async Task<bool> CobroTienePedidoAsync(int cobroId)
    {
        var cobro = await GetByIdAsync(cobroId);
        return cobro?.PedidoId is not null;
    }

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static int? GetNullableInt(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
    }

    private static long? GetNullableLong(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt64(ordinal);
    }

    private static decimal? GetNullableDecimal(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
    }

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }

    private static CobroDTO MapToDTO(Cobro c) => new()
    {
        CobroId = c.CobroId,
        ClienteId = c.ClienteId,
        ClienteNombre = c.ClienteNombre,
        ClienteApellido = c.ClienteApellido,
        PedidoId = c.PedidoId,
        CajaId = c.CajaId,
        CajaNombre = c.CajaNombre,
        MedioCobroId = c.MedioCobroId,
        MedioCobroNombre = c.MedioCobroNombre,
        RequiereReferencia = c.RequiereReferencia,
        EstadoCobroId = c.EstadoCobroId,
        EstadoCobroNombre = c.EstadoCobroNombre,
        FechaCobro = c.FechaCobro,
        ImporteBase = c.ImporteBase,
        PorcentajeAplicado = c.PorcentajeAplicado,
        ImporteAjuste = c.ImporteAjuste,
        ImporteFinal = c.ImporteFinal,
        ReferenciaExterna = c.ReferenciaExterna,
        Observaciones = c.Observaciones
    };

    private static CobroDTO MapToDTO(CobroResumen c) => new()
    {
        CobroId = c.CobroId,
        ClienteId = c.ClienteId,
        ClienteNombre = c.ClienteNombre,
        ClienteApellido = c.ClienteApellido,
        PedidoId = c.PedidoId,
        CajaId = c.CajaId,
        CajaNombre = c.CajaNombre,
        MedioCobroId = c.MedioCobroId,
        MedioCobroNombre = c.MedioCobroNombre,
        RequiereReferencia = false,
        EstadoCobroId = c.EstadoCobroId,
        EstadoCobroNombre = c.EstadoCobroNombre,
        FechaCobro = c.FechaCobro,
        ImporteBase = c.ImporteBase,
        PorcentajeAplicado = c.PorcentajeAplicado,
        ImporteAjuste = c.ImporteAjuste,
        ImporteFinal = c.ImporteFinal,
        ReferenciaExterna = c.ReferenciaExterna,
        Observaciones = c.Observaciones
    };

    private static AplicacionCobroDTO MapToDTO(AplicacionCobro a) => new()
    {
        AplicacionCobroId = a.AplicacionCobroId,
        CobroId = a.CobroId,
        FechaCobro = a.FechaCobro,
        ImporteFinal = a.ImporteFinal,
        ComprobanteId = a.ComprobanteId,
        NumeroComprobante = a.NumeroComprobante,
        FechaComprobante = a.FechaComprobante,
        ImporteTotal = a.ImporteTotal,
        ImporteAplicado = a.ImporteAplicado
    };

    private static AplicacionCobroDTO MapToDTO(AplicacionCobroPorCobro a) => new()
    {
        AplicacionCobroId = a.AplicacionCobroId,
        CobroId = a.CobroId,
        ComprobanteId = a.ComprobanteId,
        NumeroComprobante = a.NumeroComprobante,
        FechaComprobante = a.FechaComprobante,
        ImporteTotal = a.ImporteTotal,
        ImporteAplicado = a.ImporteAplicado
    };

    private static MovimientoCuentaCorrienteClienteDTO MapToDTO(MovimientoCuentaCorrienteCliente m) => new()
    {
        MovimientoCuentaCorrienteClienteId = m.MovimientoCuentaCorrienteClienteId,
        ClienteId = m.ClienteId,
        ClienteNombre = m.ClienteNombre,
        ClienteApellido = m.ClienteApellido,
        TipoMovimientoCuentaCorrienteId = m.TipoMovimientoCuentaCorrienteId,
        TipoMovimientoNombre = m.TipoMovimientoNombre,
        Signo = m.Signo,
        FechaMovimiento = m.FechaMovimiento,
        PedidoId = m.PedidoId,
        ComprobanteId = m.ComprobanteId,
        CobroId = m.CobroId,
        Importe = m.Importe,
        Observaciones = m.Observaciones
    };
}

public sealed class CobroIntegracionSchemaException():InvalidOperationException(
    "La confirmación con cuenta bancaria requiere aplicar Caja_INTEGRIDAD_COBROS_PENDIENTE_APROBACION.sql. No se confirmó el cobro.");
