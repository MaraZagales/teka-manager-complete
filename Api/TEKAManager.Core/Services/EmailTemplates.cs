using System.Net;

namespace TEKAManager.Core.Services;

public static class EmailTemplates
{
    public static string PasswordRecovery(
        string nombre,
        string recoveryUrl)
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);
        var urlSegura = WebUtility.HtmlEncode(recoveryUrl);

        return $"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #3F5140;">Recuperá tu acceso</h2>

                <p>Hola {nombreSeguro},</p>

                <p>
                    Recibimos una solicitud para restablecer
                    tu contraseña de TEKA Manager.
                </p>

                <p style="margin: 30px 0;">
                    <a href="{urlSegura}"
                       style="
                           background-color: #6F876B;
                           color: white;
                           padding: 12px 20px;
                           text-decoration: none;
                           border-radius: 8px;
                           display: inline-block;">
                        Crear una nueva contraseña
                    </a>
                </p>

                <p>
                    Este enlace vence en 30 minutos
                    y puede utilizarse una sola vez.
                </p>

                <p style="color: #78716C;">
                    Si no solicitaste el cambio,
                    podés ignorar este mensaje.
                </p>

                <hr style="border: 0; border-top: 1px solid #DED8CF;" />

                <p style="color: #78716C; font-size: 12px;">
                    TEKA Manager
                </p>
            </div>
            """;
    }

    public static string PasswordChanged(string nombre)
    {
        var nombreSeguro = WebUtility.HtmlEncode(nombre);

        return $"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #3F5140;">
                    Contraseña actualizada
                </h2>

                <p>Hola {nombreSeguro},</p>

                <p>
                    La contraseña de tu cuenta de
                    TEKA Manager fue actualizada correctamente.
                </p>

                <p>
                    Ya podés ingresar utilizando
                    tu nueva contraseña.
                </p>

                <p style="color: #78716C;">
                    Si no realizaste este cambio,
                    contactá a un administrador.
                </p>

                <hr style="border: 0; border-top: 1px solid #DED8CF;" />

                <p style="color: #78716C; font-size: 12px;">
                    TEKA Manager
                </p>
            </div>
            """;
    }
}