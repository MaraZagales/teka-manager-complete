namespace TEKAManager.Core.DTOs;

// DTO genérico para listas desplegables (lookups)
public class LookupDTO
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}

public class UnidadMedidaLookupDTO : LookupDTO
{
    public string Abreviatura { get; set; } = string.Empty;
}

public class ColorLookupDTO : LookupDTO
{
    public string? CodigoHex { get; set; }
}

public class TipoMovimientoStockLookupDTO : LookupDTO
{
    public short Signo { get; set; }
}

public class TipoDocumentoLookupDTO : LookupDTO
{
    public int CodigoARCA { get; set; }
}

public class TipoComprobanteLookupDTO : LookupDTO
{
    public string? Letra { get; set; }
    public int? CodigoARCA { get; set; }
    public bool EsNotaCredito { get; set; }
    public bool EsNotaDebito { get; set; }
}

public class CondicionIVALookupDTO : LookupDTO
{
    public string? CodigoAFIP { get; set; }
}

public class AlicuotaIVALookupDTO : LookupDTO
{
    public decimal Porcentaje { get; set; }
    public int CodigoARCA { get; set; }
}

public class CodigoArcaIntLookupDTO : LookupDTO
{
    public int CodigoARCA { get; set; }
}

public class MonedaLookupDTO : LookupDTO
{
    public string CodigoARCA { get; set; } = string.Empty;
}

public class ClienteLookupDTO : LookupDTO
{
    public string? Documento { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
}

public class MedioCobroLookupDTO : LookupDTO
{
    public bool RequiereReferencia { get; set; }
}

public class TipoMovimientoCuentaCorrienteLookupDTO : LookupDTO
{
    public short Signo { get; set; }
}
