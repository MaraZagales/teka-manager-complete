namespace TEKAManager.API.Services;

public sealed partial class CajaSqlService
{
    public async Task<bool> ConceptoPermitidoAsync(int id,string tipo,CancellationToken ct)
    {
        var result=await ConsultarCajaJsonAsync("SELECT (SELECT COUNT(*) Cantidad FROM dbo.CajaConcepto WHERE CajaConceptoId=@Id AND Tipo=@Tipo AND Activo=1 FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)",new(){["Id"]=id,["Tipo"]=tipo},ct);
        return result.GetProperty("Cantidad").GetInt32()==1;
    }
    public async Task<bool> ConceptosDisponiblesAsync(CancellationToken ct)
    {
        var result=await ConsultarCajaJsonAsync("""
            SELECT (SELECT CAST(CASE WHEN OBJECT_ID('dbo.CajaConcepto','U') IS NOT NULL
              AND COL_LENGTH('dbo.CajaMovimiento','CajaConceptoId') IS NOT NULL
              AND COL_LENGTH('dbo.CajaConcepto','Codigo') IS NOT NULL AND COL_LENGTH('dbo.CajaConcepto','Nombre') IS NOT NULL
              AND COL_LENGTH('dbo.CajaConcepto','Tipo') IS NOT NULL AND COL_LENGTH('dbo.CajaConcepto','Activo') IS NOT NULL
              AND OBJECT_ID('dbo.FK_CajaMovimiento_ConceptoTipo','F') IS NOT NULL
              AND OBJECT_ID('dbo.sp_CajaConcepto_Guardar','P') IS NOT NULL
              AND OBJECT_ID('dbo.sp_CajaConcepto_Estado','P') IS NOT NULL
              AND EXISTS(SELECT 1 FROM sys.parameters WHERE object_id=OBJECT_ID('dbo.sp_CajaDiaria_RegistrarMovimiento') AND name='@CajaConceptoId')
              THEN 1 ELSE 0 END AS bit) Disponible FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)
            """,[],ct);
        return result.GetProperty("Disponible").GetBoolean();
    }
}
