using System.Text.Json;
using EventReservation.Server.Data;
using EventReservation.Server.Domain;

namespace EventReservation.Server.Services;

public class JournalService : IJournalService
{
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _http;

    public JournalService(AppDbContext db, IHttpContextAccessor http)
    {
        _db = db;
        _http = http;
    }

    public async Task RecordAsync(JournalAction action, Reservation reservation, object? payload, CancellationToken ct = default)
    {
        var ctx = _http.HttpContext;
        var entry = new JournalEntry
        {
            ReservationId = reservation.Id == 0 ? null : reservation.Id,
            ReservationCode = reservation.Code,
            Action = action,
            IpAddress = ctx?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = ctx?.Request.Headers.UserAgent.ToString(),
            Timestamp = DateTime.UtcNow,
            PayloadJson = payload is null ? null : JsonSerializer.Serialize(payload)
        };
        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync(ct);
    }
}
