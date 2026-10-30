using System.Security.Cryptography;
using System.Text;

namespace TEKAManager.Core.Services;

public static class WhatsAppSignature
{
    public static bool IsValid(string body, string? signatureHeader, string appSecret)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrWhiteSpace(appSecret) ||
            !signatureHeader.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase)) return false;
        byte[] supplied;
        try { supplied = Convert.FromHexString(signatureHeader[7..]); }
        catch (FormatException) { return false; }
        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(appSecret), Encoding.UTF8.GetBytes(body));
        return supplied.Length == expected.Length && CryptographicOperations.FixedTimeEquals(supplied, expected);
    }

    public static bool FixedTimeEquals(string supplied, string expected)
    {
        var left = Encoding.UTF8.GetBytes(supplied ?? string.Empty);
        var right = Encoding.UTF8.GetBytes(expected ?? string.Empty);
        return left.Length == right.Length && CryptographicOperations.FixedTimeEquals(left, right);
    }
}
