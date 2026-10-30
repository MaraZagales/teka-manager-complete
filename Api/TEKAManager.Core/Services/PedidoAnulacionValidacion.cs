using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public static class PedidoAnulacionValidacion
{
    public static void Validar(int pedidoId, PedidoAnulacionIntegralRequest request, bool permitirResolverCuenta = false)
    {
        if (pedidoId <= 0 || request.UsuarioId <= 0)
            throw new InvalidOperationException("Pedido y responsable autenticado son obligatorios.");
        if (string.IsNullOrWhiteSpace(request.Motivo) || request.Motivo.Length > 250)
            throw new InvalidOperationException("Ingresá un motivo de hasta 250 caracteres.");
        if (request.ReferenciaReintegro?.Length > 100)
            throw new InvalidOperationException("La referencia del reintegro admite hasta 100 caracteres.");
        if (request.CajaId is <= 0 || request.CuentaBancariaId is <= 0)
            throw new InvalidOperationException("Caja o cuenta bancaria inválidas.");
        if(!request.MercaderiaRecibidaApta)
            throw new InvalidOperationException("La anulación integral exige la recepción física de la mercadería en condiciones aptas.");
        if(!request.ReintegroRealizado)
            throw new InvalidOperationException("La anulación integral exige confirmar el reintegro ya efectuado. No corresponde a una cancelación sin cobros.");
        if (request.MedioReintegro is not ("Efectivo" or "Transferencia" or "Tarjeta" or "Plataforma"))
            throw new InvalidOperationException("Seleccioná un medio de reintegro válido.");
        if (request.MedioReintegro == "Efectivo" ? !request.CajaId.HasValue || request.CuentaBancariaId.HasValue : request.CajaId.HasValue)
            throw new InvalidOperationException("El efectivo requiere Caja Principal; los medios electrónicos no utilizan caja física.");
        if (request.MedioReintegro != "Efectivo" && string.IsNullOrWhiteSpace(request.ReferenciaReintegro))
            throw new InvalidOperationException("Ingresá la referencia del reintegro electrónico efectivamente realizado.");
        if (request.MedioReintegro == "Transferencia" && !request.CuentaBancariaId.HasValue && !permitirResolverCuenta)
            throw new InvalidOperationException("Seleccioná la cuenta bancaria de origen de la transferencia.");
    }

    public static void ValidarCancelacion(int pedidoId,PedidoCancelarRequest request)
    {
        if(pedidoId<=0||request.UsuarioId<=0)throw new InvalidOperationException("Pedido y responsable autenticado son obligatorios.");
        if(string.IsNullOrWhiteSpace(request.Observaciones)||request.Observaciones.Length>250)
            throw new InvalidOperationException("Ingresá el motivo de cancelación, con hasta 250 caracteres.");
    }

    public static int ElegirCuentaConfigurada(IReadOnlyCollection<int> cuentasActivasArs)
    {
        if(cuentasActivasArs.Count==0)
            throw new InvalidOperationException("No hay una cuenta bancaria activa en ARS configurada para el reintegro. Registrá la cuenta operativa antes de continuar.");
        if(cuentasActivasArs.Count!=1||cuentasActivasArs.Any(id=>id<=0))
            throw new InvalidOperationException("No se puede determinar una única cuenta bancaria operativa en ARS. Indicá la cuenta de origen del reintegro.");
        return cuentasActivasArs.Single();
    }
}

public sealed class PedidoAnulacionSchemaException() : InvalidOperationException(
    "Cancelación y anulación requieren la versión 2 de separación funcional (Ventas_CANCELACION_ANULACION_V2_PENDIENTE_APROBACION.sql). No se realizó la operación.");
