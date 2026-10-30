using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace TEKAManager.API.Security;

public static class EcommerceJwtSetup
{
    public const string Scheme = "EcommerceBuyer";
    public static IServiceCollection AddEcommerceJwt(this IServiceCollection services, IConfiguration configuration)
    {
        var key = configuration["EcommerceJwt:Key"] ?? throw new InvalidOperationException("Configurar EcommerceJwt:Key");
        if (Encoding.UTF8.GetByteCount(key) < 32) throw new InvalidOperationException("EcommerceJwt:Key requiere al menos 32 bytes");
        services.AddAuthentication().AddJwtBearer(Scheme, options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["EcommerceJwt:Issuer"] ?? "TEKA-Ecommerce",
                ValidAudience = configuration["EcommerceJwt:Audience"] ?? "TEKA-Compradores",
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                ClockSkew = TimeSpan.FromMinutes(1)
            };
        });
        return services;
    }
    public static string Create(IConfiguration config, int cuentaId, int clienteId, string email)
    {
        var key = config["EcommerceJwt:Key"]!;
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, cuentaId.ToString()),
            new Claim("cliente_id", clienteId.ToString()), new Claim("identity_type", "buyer"),
            new Claim(JwtRegisteredClaimNames.Email, email) };
        var token = new JwtSecurityToken(config["EcommerceJwt:Issuer"] ?? "TEKA-Ecommerce",
            config["EcommerceJwt:Audience"] ?? "TEKA-Compradores", claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
