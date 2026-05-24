using EventReservation.Server.Contracts;
using EventReservation.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace EventReservation.Server.Controllers;

[ApiController]
[Route("api/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationsController(IReservationService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        return MapResult(result, success: r => CreatedAtAction(nameof(Get), new { code = r.Code }, r));
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<ReservationDto>> Get(string code, CancellationToken ct)
    {
        var dto = await _service.GetByCodeAsync(code, ct);
        return dto is null ? NotFound(new { error = "Reservation not found." }) : Ok(dto);
    }

    [HttpPut("{code}")]
    public async Task<ActionResult<ReservationDto>> Update(string code, [FromBody] UpdateReservationRequest request, CancellationToken ct)
    {
        var result = await _service.UpdateAsync(code, request, ct);
        return MapResult(result, success: Ok);
    }

    [HttpDelete("{code}")]
    public async Task<ActionResult<ReservationDto>> Cancel(string code, CancellationToken ct)
    {
        var result = await _service.CancelAsync(code, ct);
        return MapResult(result, success: Ok);
    }

    private ActionResult<ReservationDto> MapResult(ReservationResult result, Func<ReservationDto, ActionResult> success)
    {
        return result.Status switch
        {
            ReservationResultStatus.Success => success(result.Reservation!),
            ReservationResultStatus.NotFound => NotFound(new { error = result.Error }),
            ReservationResultStatus.AlreadyCancelled => Conflict(new { error = result.Error }),
            ReservationResultStatus.CapacityExceeded => Conflict(new { error = result.Error, remainingCapacity = result.RemainingCapacity }),
            ReservationResultStatus.ValidationFailed => BadRequest(new { error = result.Error }),
            _ => StatusCode(500, new { error = "Unexpected result." })
        };
    }
}
