using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace TEKAManager.API.Services;

public sealed partial class CajaSqlService
{
    // Solo lecturas: conserva la separación CajaMovimiento / MovimientoFinanciero del SP instalado.
    public async Task<JsonElement> ConsultarCajaJsonAsync(string query, Dictionary<string, object?> parameters, CancellationToken ct)
    {
        if(query.Contains("/*CajaConcepto*/",StringComparison.Ordinal)&&await ConceptosDisponiblesAsync(ct))
            query=query.Replace("/*CajaConcepto*/CAST(NULL AS int) CajaConceptoId,CAST(NULL AS nvarchar(120)) ConceptoClasificado","cm.CajaConceptoId,(SELECT Nombre FROM dbo.CajaConcepto WHERE CajaConceptoId=cm.CajaConceptoId) ConceptoClasificado",StringComparison.Ordinal);
        if(query.Contains("/*DevolucionCajaJoin*/",StringComparison.Ordinal))
        {
            var schema=await ConsultarCajaJsonAsync("SELECT (SELECT CAST(CASE WHEN COL_LENGTH('dbo.EgresoDevolucionVenta','CajaMovimientoId') IS NOT NULL THEN 1 ELSE 0 END AS bit) Disponible FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)",[],ct);
            if(schema.GetProperty("Disponible").GetBoolean())
                query=query.Replace("/*DevolucionCajaJoin*/","LEFT JOIN dbo.EgresoDevolucionVenta edc ON edc.CajaMovimientoId=cm.CajaMovimientoId",StringComparison.Ordinal)
                    .Replace("/*DevolucionCajaOrigen*/CASE WHEN cm.Tipo='IngresoCobro' THEN 'Cobro' ELSE 'Caja' END","CASE WHEN edc.EgresoDevolucionVentaId IS NOT NULL THEN 'Devolucion' WHEN cm.Tipo='IngresoCobro' THEN 'Cobro' ELSE 'Caja' END",StringComparison.Ordinal)
                    .Replace("/*DevolucionCajaId*/CONVERT(bigint,COALESCE(cm.CobroId,cm.CajaMovimientoId))","CONVERT(bigint,COALESCE(edc.DevolucionVentaIntegralId,cm.CobroId,cm.CajaMovimientoId))",StringComparison.Ordinal);
        }
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var command = new SqlCommand(query, connection) { CommandTimeout = 30 };
        foreach (var (key, value) in parameters) command.Parameters.AddWithValue("@" + key, value ?? DBNull.Value);
        var raw = await command.ExecuteScalarAsync(ct);
        using var document = JsonDocument.Parse(raw is string json && !string.IsNullOrWhiteSpace(json) ? json : "null");
        return document.RootElement.Clone();
    }

    internal const string LibroCajaSql = """
        WITH LibroBase AS (
          SELECT 'Caja' Fuente,cm.CajaMovimientoId MovimientoId,cm.Fecha,cm.Fecha FechaRegistro,
            CASE WHEN cm.Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN 'Ingreso' ELSE 'Egreso' END Tipo,
            cm.Tipo TipoCaja,'Efectivo' Medio,cm.Importe,'Registrado' Estado,cm.Concepto,
            /*DevolucionCajaOrigen*/CASE WHEN cm.Tipo='IngresoCobro' THEN 'Cobro' ELSE 'Caja' END OrigenTipo,
            CAST(NULL AS int) CanalVentaId,CAST(NULL AS int) CuentaBancariaId,cm.Referencia,cm.Observaciones,
            cm.UsuarioId,cm.CajaSesionId,
            /*DevolucionCajaId*/CONVERT(bigint,COALESCE(cm.CobroId,cm.CajaMovimientoId)) OrigenId,cm.CobroId,
            c.Nombre Caja,CAST(NULL AS nvarchar(250)) Cuenta,
            /*CajaConcepto*/CAST(NULL AS int) CajaConceptoId,CAST(NULL AS nvarchar(120)) ConceptoClasificado
          FROM dbo.CajaMovimiento cm
          JOIN dbo.CajaSesion s ON s.CajaSesionId=cm.CajaSesionId
          JOIN dbo.Caja c ON c.CajaId=s.CajaId
          /*DevolucionCajaJoin*/
          UNION ALL
          SELECT 'Financiero',mf.MovimientoFinancieroId,mf.FechaOperacion,mf.FechaRegistro,mf.Tipo,NULL,mf.Medio,
            mf.Importe,mf.Estado,mf.Concepto,mf.OrigenTipo,mf.CanalVentaId,mf.CuentaBancariaId,
            mf.ReferenciaExterna,mf.Observaciones,mf.UsuarioRegistroId,NULL,mf.OrigenId,mf.CobroId,NULL,
            CASE WHEN cb.CuentaBancariaId IS NULL THEN NULL ELSE CONCAT(cb.Nombre,' · ',cb.Banco) END,NULL,NULL
          FROM dbo.MovimientoFinanciero mf
          LEFT JOIN dbo.CuentaBancariaTEKA cb ON cb.CuentaBancariaId=mf.CuentaBancariaId
        ), LibroControl AS (
          -- Cuenta representaciones efectivas, no antecedentes anulados. Se conservan TODAS
          -- las filas para historial; Estado y respaldo del origen siguen validándose en Libro.
          SELECT b.*,CASE WHEN b.CobroId IS NULL THEN 0 ELSE SUM(CASE WHEN b.Estado='Registrado' THEN 1 ELSE 0 END) OVER(PARTITION BY b.CobroId) END VinculosCobro,
            CASE WHEN b.OrigenTipo IN('Cobro','Devolucion','OrdenPagoProveedor') THEN SUM(CASE WHEN b.Estado='Registrado' THEN 1 ELSE 0 END) OVER(PARTITION BY b.OrigenTipo,b.OrigenId) ELSE 0 END VinculosOrigen
          FROM LibroBase b
        ), Libro AS (
          SELECT l.Fuente,l.MovimientoId,l.Fecha,l.FechaRegistro,l.Tipo,l.TipoCaja,l.Medio,l.Importe,l.Estado,l.Concepto,l.OrigenTipo,
            COALESCE(l.CanalVentaId,p.CanalVentaId) CanalVentaId,l.CuentaBancariaId,
            COALESCE(NULLIF(l.Referencia,''),co.ReferenciaExterna,op.Referencia) Referencia,l.Observaciones,
            l.UsuarioId,l.CajaSesionId,l.OrigenId,l.CobroId,COALESCE(co.PedidoId,dv.PedidoId) PedidoId,cv.Nombre Canal,l.Cuenta,l.Caja,l.CajaConceptoId,l.ConceptoClasificado,
            CASE WHEN dv.DevolucionVentaIntegralId IS NOT NULL THEN CONCAT(N'Devolución de pedido N.º ',dv.PedidoId,N' · reintegro N.º ',dv.DevolucionVentaIntegralId,
                CASE WHEN ncd.ComprobanteId IS NOT NULL THEN CONCAT(N' · Nota de crédito ',ncd.PuntoVenta,N'-',ncd.NumeroComprobante) ELSE N'' END)
              WHEN co.CobroId IS NOT NULL THEN CONCAT(N'Cobro N.º ',co.CobroId)
              WHEN op.OrdenPagoProveedorId IS NOT NULL THEN CONCAT(N'Orden de pago N.º ',op.OrdenPagoProveedorId)
              WHEN l.Fuente='Caja' THEN CONCAT(N'Movimiento de caja N.º ',l.MovimientoId)
              ELSE NULL END DocumentoOrigen,
            COALESCE(ec.Nombre,op.Estado,CASE WHEN dv.ReintegroRealizado=1 THEN 'Reintegrado' END) EstadoOrigen,mc.Nombre MedioOrigen,
            CAST(CASE WHEN exclusion.Motivo IS NULL THEN 1 ELSE 0 END AS bit) Realizado,
            exclusion.Motivo MotivoExclusion,
            CAST(CASE WHEN l.Medio IN('Transferencia','Deposito') AND l.CuentaBancariaId IS NULL THEN 1 ELSE 0 END AS bit) CuentaBancariaPendiente,
            CAST(CASE WHEN l.OrigenTipo IN('Otro','AjusteAutorizado') OR (l.OrigenTipo='Caja' AND l.CobroId IS NULL) THEN NULL ELSE 0 END AS bit) EsOperacionInterna
          FROM LibroControl l
          LEFT JOIN dbo.Cobro co ON co.CobroId=l.CobroId
          LEFT JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=co.EstadoCobroId
          LEFT JOIN dbo.MedioCobro mc ON mc.MedioCobroId=co.MedioCobroId
          LEFT JOIN dbo.DevolucionVentaIntegral dv ON l.OrigenTipo='Devolucion' AND dv.DevolucionVentaIntegralId=l.OrigenId
          LEFT JOIN dbo.Comprobante ncd ON ncd.ComprobanteId=dv.NotaCreditoId
          LEFT JOIN dbo.Pedido p ON p.PedidoId=COALESCE(co.PedidoId,dv.PedidoId)
          LEFT JOIN dbo.CanalVenta cv ON cv.CanalVentaId=COALESCE(l.CanalVentaId,p.CanalVentaId)
          LEFT JOIN dbo.OrdenPagoProveedor op ON l.OrigenTipo='OrdenPagoProveedor' AND op.OrdenPagoProveedorId=l.OrigenId
          CROSS APPLY(SELECT CASE WHEN mc.Nombre='Efectivo' THEN 'Efectivo'
            WHEN mc.Nombre IN('Transferencia','Transferencia Bancaria') THEN 'Transferencia'
            WHEN mc.Nombre IN('Tarjeta Credito','Tarjeta Crédito','Tarjeta Debito','Tarjeta Débito') THEN 'Tarjeta'
            WHEN mc.Nombre='Cheque' THEN 'Cheque' WHEN mc.Nombre IN('Deposito','Depósito') THEN 'Deposito'
            WHEN mc.Nombre IN('Pasarela','Mercado Pago') THEN 'Pasarela' ELSE NULL END Medio) equivalencia
          CROSS APPLY (SELECT CASE
            WHEN l.Estado<>'Registrado' THEN N'Movimiento no realizado o anulado'
            WHEN l.VinculosOrigen>1 OR (l.CobroId IS NOT NULL AND l.VinculosCobro>1) THEN N'Operación representada más de una vez; requiere conciliación'
            WHEN l.OrigenTipo='Cobro' AND co.CobroId IS NULL THEN N'Falta el cobro de origen'
            WHEN co.CobroId IS NOT NULL AND (ec.Nombre<>'Confirmado' OR l.Tipo<>'Ingreso' OR l.Importe<>co.ImporteFinal
              OR equivalencia.Medio IS NULL OR l.Medio<>equivalencia.Medio)
              THEN N'El libro no coincide con el cobro confirmado'
            WHEN l.OrigenTipo='OrdenPagoProveedor' AND (op.OrdenPagoProveedorId IS NULL OR op.Estado<>'Confirmada') THEN N'Pago a proveedor no confirmado'
            WHEN l.OrigenTipo='Devolucion' AND (dv.DevolucionVentaIntegralId IS NULL OR dv.ReintegroRealizado<>1 OR l.Tipo<>'Egreso' OR l.Importe<>dv.ImporteReintegrado
              OR l.Medio<>CASE WHEN dv.MedioReintegro='Plataforma' THEN 'Pasarela' ELSE dv.MedioReintegro END)
              THEN N'Reintegro sin respaldo coincidente'
            ELSE NULL END Motivo) exclusion
        )
        """;

    public const string ListaFinancieraSql = LibroCajaSql + """
        SELECT * INTO #Filtrados FROM Libro
        WHERE (@Desde IS NULL OR Fecha>=@Desde) AND (@Hasta IS NULL OR Fecha<DATEADD(day,1,CONVERT(datetime2,@Hasta)))
          AND (@Tipo IS NULL OR Tipo=@Tipo) AND (@Medio IS NULL OR Medio=@Medio)
          AND (@Estado IS NULL OR Estado=@Estado) AND (@Origen IS NULL OR OrigenTipo=@Origen)
          AND (@Canal IS NULL OR CanalVentaId=@Canal) AND (@Cuenta IS NULL OR CuentaBancariaId=@Cuenta)
          AND (@Concepto IS NULL OR CHARINDEX(@Concepto,Concepto)>0 OR CHARINDEX(@Concepto,ConceptoClasificado)>0)
          AND (@Buscar IS NULL OR CHARINDEX(@Buscar,CONCAT(Concepto,' ',ConceptoClasificado,' ',Referencia,' ',DocumentoOrigen,' ',Caja,' ',Cuenta,' ',Fuente,' ',MovimientoId))>0);
        SELECT (SELECT (SELECT COUNT_BIG(*) FROM #Filtrados) Total,
          JSON_QUERY(COALESCE((SELECT * FROM #Filtrados ORDER BY Fecha DESC,Fuente,MovimientoId DESC
            OFFSET (CONVERT(bigint,@Pagina)-1)*@Tamano ROWS FETCH NEXT @Tamano ROWS ONLY FOR JSON PATH,INCLUDE_NULL_VALUES),'[]')) Filas,
          JSON_QUERY(COALESCE((SELECT Medio,COUNT_BIG(*) Cantidad,
            SUM(CASE WHEN Tipo='Ingreso' THEN Importe ELSE 0 END) Ingresos,
            SUM(CASE WHEN Tipo='Egreso' THEN Importe ELSE 0 END) Egresos
            FROM #Filtrados WHERE Realizado=1 AND (EsOperacionInterna=0 OR EsOperacionInterna IS NULL) GROUP BY Medio ORDER BY Medio FOR JSON PATH),'[]')) Resumen,
          JSON_QUERY((SELECT COUNT_BIG(*) Registros,COALESCE(SUM(CASE WHEN Realizado=0 THEN 1 ELSE 0 END),0) ExcluidosDeTotales,
            COALESCE(SUM(CASE WHEN EsOperacionInterna IS NULL AND Realizado=1 THEN 1 ELSE 0 END),0) ClasificacionInternaPendiente,
            COALESCE(SUM(CASE WHEN CuentaBancariaPendiente=1 AND Realizado=1 THEN 1 ELSE 0 END),0) CuentasBancariasPendientes,
            CAST(0 AS bit) EsFlujoNetoEmpresa,
            COALESCE(SUM(CASE WHEN Realizado=1 AND EsOperacionInterna=0 AND Tipo='Ingreso' THEN Importe ELSE 0 END),0) IngresosExternosIdentificados,
            COALESCE(SUM(CASE WHEN Realizado=1 AND EsOperacionInterna=0 AND Tipo='Egreso' THEN Importe ELSE 0 END),0) EgresosExternosIdentificados
            FROM #Filtrados FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)) Integridad,
          JSON_QUERY((SELECT
            (SELECT COUNT_BIG(*) FROM dbo.Cobro c JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
              WHERE ec.Nombre='Confirmado' AND NOT EXISTS(SELECT 1 FROM dbo.CajaMovimiento cm WHERE cm.CobroId=c.CobroId)
              AND NOT EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero mf WHERE mf.CobroId=c.CobroId)) CobrosConfirmadosSinLibro,
            (SELECT COUNT_BIG(*) FROM dbo.OrdenPagoProveedor op WHERE op.Estado='Confirmada'
              AND NOT EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero mf WHERE mf.OrigenTipo='OrdenPagoProveedor' AND mf.OrigenId=op.OrdenPagoProveedorId)) OrdenesPagoConfirmadasSinLibro,
            CAST(0 AS bit) AplicanFiltrosDelListado
            FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)) DiagnosticoGlobal
          FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
        """;

    public const string DetalleFinancieroSql = LibroCajaSql + """
        SELECT (SELECT l.*,COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) Responsable,
            JSON_QUERY(COALESCE((SELECT tc.Nombre Tipo,c.PuntoVenta,c.NumeroComprobante,ac.ImporteAplicado
              FROM dbo.AplicacionCobro ac JOIN dbo.Comprobante c ON c.ComprobanteId=ac.ComprobanteId
              JOIN dbo.TipoComprobante tc ON tc.TipoComprobanteId=c.TipoComprobanteId
              WHERE ac.CobroId=l.CobroId ORDER BY c.ComprobanteId,ac.AplicacionCobroId FOR JSON PATH),'[]')) Comprobantes
          FROM Libro l JOIN dbo.Usuario u ON u.UsuarioId=l.UsuarioId
          WHERE Fuente=@Fuente AND MovimientoId=@Id FOR JSON PATH,WITHOUT_ARRAY_WRAPPER,INCLUDE_NULL_VALUES);
        """;

    public const string CierresCajaSql = """
        SELECT s.CajaSesionId,c.Nombre Caja,s.FechaApertura,s.FechaCierre,s.Estado,s.EfectivoInicial,
          s.EfectivoEsperadoCierre,s.EfectivoContadoCierre,s.DiferenciaCierre,s.ObservacionCierre,
          COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) Responsable,
          COALESCE(m.Ingresos,0) Ingresos,COALESCE(m.Egresos,0) Egresos INTO #Cierres
        FROM dbo.CajaSesion s JOIN dbo.Caja c ON c.CajaId=s.CajaId
        JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId AND cfg.EsFisica=1
        JOIN dbo.Usuario u ON u.UsuarioId=s.UsuarioCierreId
        OUTER APPLY (SELECT SUM(CASE WHEN Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE 0 END) Ingresos,
          SUM(CASE WHEN Tipo IN ('Gasto','Retiro') THEN Importe ELSE 0 END) Egresos
          FROM dbo.CajaMovimiento WHERE CajaSesionId=s.CajaSesionId) m
        WHERE s.Estado='Cerrada' AND (@Desde IS NULL OR s.FechaCierre>=@Desde)
          AND (@Hasta IS NULL OR s.FechaCierre<DATEADD(day,1,CONVERT(datetime2,@Hasta)))
          AND (@Buscar IS NULL OR CHARINDEX(@Buscar,CONCAT(c.Nombre,' ',u.Nombre,' ',u.Apellido,' ',s.ObservacionCierre))>0);
        SELECT (SELECT (SELECT COUNT_BIG(*) FROM #Cierres) Total,
          JSON_QUERY(COALESCE((SELECT * FROM #Cierres ORDER BY FechaCierre DESC,CajaSesionId DESC
            OFFSET (CONVERT(bigint,@Pagina)-1)*@Tamano ROWS FETCH NEXT @Tamano ROWS ONLY FOR JSON PATH,INCLUDE_NULL_VALUES),'[]')) Filas,
          JSON_QUERY((SELECT COUNT_BIG(*) Cantidad,COALESCE(SUM(Ingresos),0) Ingresos,COALESCE(SUM(Egresos),0) Egresos,
            COALESCE(SUM(DiferenciaCierre),0) Diferencia,COALESCE(SUM(CASE WHEN DiferenciaCierre<>0 THEN 1 ELSE 0 END),0) ConDiferencia FROM #Cierres FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)) Resumen
          FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
        """;

    // Opciones de códigos cerrados obtenidas de las restricciones reales, no catálogos inventados.
    public async Task<Dictionary<string, string[]>> ConsultarFiltrosCajaAsync(CancellationToken ct)
    {
        var rows = await ConsultarCajaJsonAsync("""
            SELECT (SELECT name,definition FROM sys.check_constraints WHERE parent_object_id=OBJECT_ID('dbo.MovimientoFinanciero')
              AND name IN ('CK_MovFin_Tipo','CK_MovFin_Medio','CK_MovFin_Estado','CK_MovFin_Origen') FOR JSON PATH);
            """, [], ct);
        var result = new Dictionary<string,string[]>();
        foreach (var row in rows.EnumerateArray())
        {
            var values = System.Text.RegularExpressions.Regex.Matches(row.GetProperty("definition").GetString()!, "'([^']*)'")
                .Select(m => m.Groups[1].Value).ToList();
            var key = row.GetProperty("name").GetString()!.Replace("CK_MovFin_", "");
            if (key == "Medio") values.Add("Efectivo");
            if (key == "Origen") values.Add("Caja");
            result[key.ToLowerInvariant()] = values.Distinct().Order().ToArray();
        }
        return result;
    }
}
