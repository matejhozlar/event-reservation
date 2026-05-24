using EventReservation.Server.Contracts;
using EventReservation.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventReservation.Server.Controllers;

[ApiController]
[Route("api/journal")]
public class JournalController : ControllerBase
{
    private readonly AppDbContext _db;

    public JournalController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JournalEntryDto>>> List(CancellationToken ct)
    {
        var entries = await _db.JournalEntries
            .AsNoTracking()
            .OrderByDescending(e => e.Timestamp)
            .Select(e => new JournalEntryDto
            {
                Id = e.Id,
                ReservationCode = e.ReservationCode,
                Action = e.Action.ToString(),
                IpAddress = e.IpAddress,
                UserAgent = e.UserAgent,
                Timestamp = e.Timestamp,
                PayloadJson = e.PayloadJson,
            })
            .ToListAsync(ct);

        return entries;
    }
}
