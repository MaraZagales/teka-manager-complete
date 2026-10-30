namespace TEKAManager.Core.DTOs;
public sealed class MovimientoAnaliticoDTO {
 public int MovimientoStockId {get;set;} public DateTime FechaMovimiento {get;set;}
 public string Clase {get;set;}=""; public int ArticuloId {get;set;}
 public string Codigo {get;set;}=""; public string Articulo {get;set;}="";
 public int DepositoId {get;set;} public string Deposito {get;set;}="";
 public int TipoMovimientoStockId {get;set;} public string TipoMovimiento {get;set;}="";
 public short Signo {get;set;} public decimal Cantidad {get;set;}
 public string? Motivo {get;set;} public string? EntidadOrigen {get;set;} public int? OrigenId {get;set;}
 public bool Activo {get;set;} public DateTime? FechaAnulacion {get;set;}
 public string? MotivoAnulacion {get;set;} public string? ObservacionAnulacion {get;set;}
 public int? MovimientoStockIdReversaDe {get;set;}
 public string Modalidad {get;set;}=""; public string Estado {get;set;}="";
 public long TotalFilas {get;set;}
}
public sealed class MovimientoResumenDTO {
 public long TotalMovimientos {get;set;} public long CantidadEntradas {get;set;}
 public long CantidadSalidas {get;set;} public long CantidadManuales {get;set;}
 public long CantidadAutomaticos {get;set;} public long CantidadReversas {get;set;}
 public long CantidadAnulados {get;set;}
}
public sealed class MovimientoSerieDTO {
 public DateTime Fecha {get;set;} public string Modalidad {get;set;}="";
 public string Origen {get;set;}=""; public short Signo {get;set;}
 public long CantidadMovimientos {get;set;}
}
