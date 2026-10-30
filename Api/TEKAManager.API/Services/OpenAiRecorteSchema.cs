using System.Text.Json;

namespace TEKAManager.API.Services;

internal static class OpenAiRecorteSchema
{
    // Contrato del proveedor: los identificadores de generación y los estados técnicos los asigna TEKA.
    public static readonly JsonElement Value = JsonDocument.Parse("""
    {
      "type":"object","additionalProperties":false,"required":["propuestas"],
      "properties":{"propuestas":{"type":"array","items":{
        "type":"object","additionalProperties":false,
        "required":["nombre","descripcion","materialInsumoId","colorId","largoExteriorMm","anchoExteriorMm","altoExteriorMm","cantidadSugerida","piezas","asignaciones","insumosComplementarios","advertencias","supuestos"],
        "properties":{
          "nombre":{"type":"string"},"descripcion":{"type":"string"},
          "materialInsumoId":{"type":["integer","null"]},"colorId":{"type":["integer","null"]},
          "largoExteriorMm":{"type":"number"},"anchoExteriorMm":{"type":"number"},"altoExteriorMm":{"type":"number"},
          "cantidadSugerida":{"type":"integer"},
          "piezas":{"type":"array","items":{
            "type":"object","additionalProperties":false,
            "required":["ordenPieza","nombre","origen","insumoId","colorId","cantidad","largoMm","anchoMm","espesorMm","orientacionVeta","observaciones"],
            "properties":{"ordenPieza":{"type":"integer"},"nombre":{"type":"string"},"origen":{"type":"string","enum":["Recorte","Insumo"]},
              "insumoId":{"type":"integer"},"colorId":{"type":["integer","null"]},"cantidad":{"type":"integer"},
              "largoMm":{"type":"number"},"anchoMm":{"type":"number"},"espesorMm":{"type":"number"},
              "orientacionVeta":{"type":"string","enum":["Indiferente","Largo","Ancho"]},"observaciones":{"type":["string","null"]}}}},
          "asignaciones":{"type":"array","items":{
            "type":"object","additionalProperties":false,
            "required":["ordenPieza","recorteId","cantidadPiezas","posicionXmm","posicionYmm","largoCorteMm","anchoCorteMm","giro90","anchoSierraMm","margenSeguridadMm","toleranciaMm"],
            "properties":{"ordenPieza":{"type":"integer"},"recorteId":{"type":"integer"},"cantidadPiezas":{"type":"integer"},
              "posicionXmm":{"type":"number"},"posicionYmm":{"type":"number"},"largoCorteMm":{"type":"number"},"anchoCorteMm":{"type":"number"},
              "giro90":{"type":"boolean"},"anchoSierraMm":{"type":"number"},"margenSeguridadMm":{"type":"number"},"toleranciaMm":{"type":"number"}}}},
          "insumosComplementarios":{"type":"array","items":{
            "type":"object","additionalProperties":false,"required":["insumoId","cantidad","observaciones"],
            "properties":{"insumoId":{"type":"integer"},"cantidad":{"type":"number"},"observaciones":{"type":["string","null"]}}}},
          "advertencias":{"type":"array","items":{"type":"string"}},
          "supuestos":{"type":"array","items":{"type":"string"}}
        }}}}
    }
    """).RootElement.Clone();
}
