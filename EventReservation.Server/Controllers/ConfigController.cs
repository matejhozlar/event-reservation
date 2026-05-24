using EventReservation.Server.Contracts;
using EventReservation.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace EventReservation.Server.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController : ControllerBase
{
    private readonly EventOptions _options;
    private readonly IReservationService _reservations;

    public ConfigController(IOptions<EventOptions> options, IReservationService reservations)
    {
        _options = options.Value;
        _reservations = reservations;
    }

    [HttpGet]
    public async Task<ActionResult<EventConfigDto>> Get(CancellationToken ct)
    {
        var remaining = await _reservations.GetRemainingCapacityAsync(ct);
        return new EventConfigDto
        {
            EventDateUtc = _options.DateUtc,
            Capacity = _options.Capacity,
            MaxTicketsPerReservation = _options.MaxTicketsPerReservation,
            RemainingCapacity = remaining
        };
    }
}
