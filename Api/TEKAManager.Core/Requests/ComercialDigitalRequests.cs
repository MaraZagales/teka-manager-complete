using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class InteresComercialInsertRequest
{
    public int? ClienteId { get; set; }
    public int? MotivoConsultaId { get; set; }
    public int? ProductoConsultadoId { get; set; }
    [StringLength(100)] public string? ClienteNombre { get; set; }
    [StringLength(100)] public string? ClienteApellido { get; set; }
    [StringLength(30)] public string? Telefono { get; set; }
    [EmailAddress, StringLength(150)] public string? Email { get; set; }
    [Required] public int CanalVentaId { get; set; }
    [Required, StringLength(30)] public string TipoOrigen { get; set; } = "Manual";
    [StringLength(150)] public string? ReferenciaOrigen { get; set; }
    [Required, StringLength(500), MinLength(3)] public string Descripcion { get; set; } = "";
    [Range(0, double.MaxValue)] public decimal MontoPotencial { get; set; }
    public int? UsuarioResponsableId { get; set; }
}

public sealed class InteresComercialUpdateRequest
{
    public int? ClienteId { get; set; }
    public int? MotivoConsultaId { get; set; }
    public int? ProductoConsultadoId { get; set; }
    [StringLength(100)] public string? ClienteNombre { get; set; }
    [StringLength(100)] public string? ClienteApellido { get; set; }
    [StringLength(30)] public string? Telefono { get; set; }
    [EmailAddress, StringLength(150)] public string? Email { get; set; }
    [Required] public int CanalVentaId { get; set; }
    [Required, StringLength(30)] public string TipoOrigen { get; set; } = "Manual";
    [StringLength(150)] public string? ReferenciaOrigen { get; set; }
    [Required, StringLength(500), MinLength(3)] public string Descripcion { get; set; } = "";
    [Range(0, double.MaxValue)] public decimal MontoPotencial { get; set; }
}

/// <summary>Contrato público: no incluye cliente, responsable, estado ni importes.</summary>
public sealed class ConsultaPublicaRequest
{
    [Required] public Guid SolicitudId { get; set; }
    [Required, StringLength(100), MinLength(2)] public string Nombre { get; set; } = "";
    [StringLength(100)] public string? Apellido { get; set; }
    [StringLength(30), Phone] public string? Telefono { get; set; }
    [StringLength(150), EmailAddress] public string? Email { get; set; }
    [Required, StringLength(500), MinLength(5)] public string Mensaje { get; set; } = "";
    public int? ProductoId { get; set; }
    public int? MotivoConsultaId { get; set; }
}

public class InteresVincularClienteRequest { [Range(1, int.MaxValue)] public int ClienteId { get; set; } }
public class InteresTomarRequest { [Required] public int UsuarioResponsableId { get; set; } }
public class InteresDescartarRequest { [Required, StringLength(250)] public string Motivo { get; set; } = ""; }
public class InteresCalificarRequest
{
    public int? UsuarioResponsableId { get; set; }
    [StringLength(150)] public string? Interes { get; set; }
    [StringLength(250)] public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    [StringLength(500)] public string? Observaciones { get; set; }
}

public class CarritoObtenerOCrearRequest { public int? ClienteId { get; set; } public Guid? IdentificadorSesion { get; set; } }
public class CarritoItemRequest { [Required] public int ProductoId { get; set; } [Range(0.01, double.MaxValue)] public decimal Cantidad { get; set; } }
public class CarritoAsignarClienteRequest { [Required] public int ClienteId { get; set; } }
public class CheckoutCarritoRequest { [StringLength(250)] public string? Observaciones { get; set; } }

public sealed class CheckoutSeguimientoRequest
{
    [Required] public Guid IdentificadorSesion { get; set; }
    [StringLength(100)] public string? Nombre { get; set; }
    [StringLength(100)] public string? Apellido { get; set; }
    [StringLength(30), Phone] public string? Telefono { get; set; }
    [StringLength(150), EmailAddress] public string? Email { get; set; }
    public bool ConsentimientoContacto { get; set; }
}

public sealed class CheckoutActividadRequest { [Required] public Guid IdentificadorSesion { get; set; } }
