using System.Globalization;
using System.Text;
using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

/// <summary>Documento administrativo TEKA en A4, sin representación fiscal.</summary>
public static class ComprobantePdfGenerator
{
    private static readonly CultureInfo Ar = CultureInfo.GetCultureInfo("es-AR");
    private static readonly Encoding Latin;
    static ComprobantePdfGenerator()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        Latin = Encoding.GetEncoding(1252);
    }

    public static byte[] Generate(ComprobanteConDetalleDTO c)
    {
        var objects = new List<byte[]>();
        int Obj(string value) { objects.Add(Encoding.ASCII.GetBytes(value)); return objects.Count; }
        Obj("<< /Type /Catalog /Pages 2 0 R >>");
        Obj("<< /Type /Pages /Kids [] /Count 0 >>");
        Obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        Obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
        var pageIds = new List<int>();
        MemoryStream? stream = null;
        double y = 0;
        void Write(string command) { var bytes = Latin.GetBytes(command); stream!.Write(bytes); }
        string Escape(string value)
        {
            var bytes = Latin.GetBytes((value ?? "").Replace('\r', ' ').Replace('\n', ' '));
            var result = new StringBuilder();
            foreach (var b in bytes)
            {
                if (b is 40 or 41 or 92) result.Append('\\');
                if (b < 32) continue;
                result.Append((char)b);
            }
            return result.ToString();
        }
        void Text(double x, double top, string value, double size = 10, bool bold = false, string color = "0.10 0.17 0.16")
        {
            Write($"{color} rg BT /{(bold ? "F2" : "F1")} {size.ToString(CultureInfo.InvariantCulture)} Tf 1 0 0 1 {x.ToString(CultureInfo.InvariantCulture)} {(842 - top).ToString(CultureInfo.InvariantCulture)} Tm ({Escape(value)}) Tj ET\n");
        }
        void Rect(double x, double top, double width, double height, string color)
        {
            Write($"{color} rg {x} {842 - top - height} {width} {height} re f\n");
        }
        void Line(double x1, double top1, double x2, double top2, string color = "0.82 0.87 0.84")
        {
            Write($"{color} RG 0.7 w {x1} {842 - top1} m {x2} {842 - top2} l S\n");
        }
        void Begin()
        {
            stream = new MemoryStream(); y = 48;
            Rect(0, 0, 595, 8, "0.08 0.39 0.28");
            Rect(38, 39, 47, 47, "0.08 0.39 0.28");
            Text(54, 70, "T", 27, true, "1 1 1");
            Text(97, 57, "TEKA", 23, true, "0.08 0.39 0.28");
            Text(98, 75, "MUEBLES · CÓRDOBA", 8, false);
            Text(38, 108, "DOCUMENTO ADMINISTRATIVO INTERNO", 8, true);
            Text(330, 52, c.TipoComprobanteNombre.ToUpperInvariant(), 10, true);
            Text(330, 72, $"N.º {c.PuntoVenta:0000}-{c.NumeroComprobante.GetValueOrDefault():00000000}", 13, true);
            Text(330, 89, $"Fecha: {c.FechaComprobante:dd/MM/yyyy}", 9);
            Line(38, 120, 557, 120, "0.08 0.39 0.28");
            Rect(38, 134, 519, 76, "0.95 0.97 0.96");
            Text(50, 151, "CLIENTE", 8, true, "0.30 0.40 0.36");
            Text(50, 170, $"{c.ClienteNombre} {c.ClienteApellido}".Trim(), 11, true);
            Text(50, 189, $"{c.TipoDocumentoNombre}: {c.DocumentoReceptor}", 9);
            Text(330, 151, "REFERENCIA", 8, true, "0.30 0.40 0.36");
            Text(330, 170, $"Pedido: {c.PedidoId?.ToString() ?? "-"}", 10, true);
            Text(330, 189, $"Estado: {c.EstadoComprobante}", 9);
            Rect(38, 225, 519, 29, "0.08 0.39 0.28");
            Text(48, 244, "DESCRIPCIÓN", 9, true, "1 1 1");
            Text(330, 244, "CANT.", 9, true, "1 1 1");
            Text(395, 244, "PRECIO UNIT.", 9, true, "1 1 1");
            Text(492, 244, "IMPORTE", 9, true, "1 1 1");
            y = 268;
        }
        void Finish()
        {
            Line(38, y + 5, 557, y + 5);
            Rect(38, y + 16, 519, 43, "0.95 0.97 0.96");
            Text(342, y + 43, "TOTAL", 11, true);
            Text(458, y + 43, $"$ {c.ImporteTotal.ToString("N2", Ar)}", 12, true, "0.08 0.39 0.28");
            if (!string.IsNullOrWhiteSpace(c.Observaciones))
            {
                var obs = c.Observaciones.Trim();
                Text(40, y + 79, "OBSERVACIONES", 8, true);
                foreach (var chunk in Wrap(obs, 96).Take(3).Select((s, i) => (s, i))) Text(40, y + 96 + chunk.i * 14, chunk.s, 9);
            }
            Line(38, 786, 557, 786);
            Text(38, 803, "Emitido por TEKA Manager · Documento interno, no válido como factura fiscal.", 8);
            var content = stream!.ToArray();
            using var obj = new MemoryStream();
            var prefix = Encoding.ASCII.GetBytes($"<< /Length {content.Length} >>\nstream\n");
            obj.Write(prefix); obj.Write(content); obj.Write(Encoding.ASCII.GetBytes("\nendstream"));
            objects.Add(obj.ToArray());
            var contentId = objects.Count;
            var pageId = Obj($"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {contentId} 0 R >>");
            pageIds.Add(pageId);
            stream.Dispose(); stream = null;
        }
        Begin();
        foreach (var d in c.Detalles)
        {
            var description = Wrap(d.DescripcionItem ?? "", 45).ToArray();
            var height = Math.Max(35, 17 + description.Length * 13);
            if (y + height > 650) { Finish(); Begin(); }
            if (pageIds.Count % 2 == 0) Rect(38, y - 9, 519, height, "0.985 0.99 0.985");
            for (int i = 0; i < description.Length; i++) Text(48, y + i * 13, description[i], 9, i == 0);
            Text(332, y, d.Cantidad.ToString("N2", Ar), 9);
            Text(395, y, $"$ {d.PrecioUnitario.ToString("N2", Ar)}", 9);
            Text(484, y, $"$ {d.ImporteTotalItem.ToString("N2", Ar)}", 9);
            y += height;
            Line(38, y - 8, 557, y - 8);
        }
        Finish();
        objects[1] = Encoding.ASCII.GetBytes($"<< /Type /Pages /Kids [{string.Join(" ", pageIds.Select(id => $"{id} 0 R"))}] /Count {pageIds.Count} >>");
        using var pdf = new MemoryStream();
        pdf.Write(Encoding.ASCII.GetBytes("%PDF-1.4\n"));
        var offsets = new List<long> { 0 };
        for (int i = 0; i < objects.Count; i++)
        {
            offsets.Add(pdf.Position);
            pdf.Write(Encoding.ASCII.GetBytes($"{i + 1} 0 obj\n"));
            pdf.Write(objects[i]);
            pdf.Write(Encoding.ASCII.GetBytes("\nendobj\n"));
        }
        var xref = pdf.Position;
        pdf.Write(Encoding.ASCII.GetBytes($"xref\n0 {objects.Count + 1}\n0000000000 65535 f \n"));
        foreach (var offset in offsets.Skip(1)) pdf.Write(Encoding.ASCII.GetBytes($"{offset:0000000000} 00000 n \n"));
        pdf.Write(Encoding.ASCII.GetBytes($"trailer\n<< /Size {objects.Count + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF"));
        return pdf.ToArray();
    }

    private static IEnumerable<string> Wrap(string value, int limit)
    {
        var text = (value ?? "").Replace('\r', ' ').Replace('\n', ' ').Trim();
        while (text.Length > limit)
        {
            var split = text.LastIndexOf(' ', limit);
            if (split < limit / 3) split = limit;
            yield return text[..split];
            text = text[split..].TrimStart();
        }
        if (text.Length > 0) yield return text;
    }
}
