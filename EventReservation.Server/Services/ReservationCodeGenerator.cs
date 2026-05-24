using System.Security.Cryptography;

namespace EventReservation.Server.Services;

public class ReservationCodeGenerator : IReservationCodeGenerator
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const string Prefix = "EVT-";
    private const int BodyLength = 5;

    public string Generate()
    {
        Span<char> body = stackalloc char[BodyLength];
        Span<byte> bytes = stackalloc byte[BodyLength];
        RandomNumberGenerator.Fill(bytes);
        for (var i = 0; i < BodyLength; i++)
        {
            body[i] = Alphabet[bytes[i] % Alphabet.Length];
        }
        return string.Concat(Prefix, new string(body));
    }
}
