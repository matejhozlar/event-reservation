using EventReservation.Server.Contracts;

namespace EventReservation.Server.Services;

public enum ReservationResultStatus
{
    Success,
    NotFound,
    CapacityExceeded,
    AlreadyCancelled,
    ValidationFailed
}

public class ReservationResult
{
    public ReservationResultStatus Status { get; init; }
    public ReservationDto? Reservation { get; init; }
    public string? Error { get; init; }
    public int? RemainingCapacity { get; init; }

    public static ReservationResult Ok(ReservationDto dto) =>
        new() { Status = ReservationResultStatus.Success, Reservation = dto };

    public static ReservationResult NotFound() =>
        new() { Status = ReservationResultStatus.NotFound, Error = "Reservation not found." };

    public static ReservationResult AlreadyCancelled() =>
        new() { Status = ReservationResultStatus.AlreadyCancelled, Error = "Reservation is already cancelled." };

    public static ReservationResult CapacityExceeded(int remaining) =>
        new()
        {
            Status = ReservationResultStatus.CapacityExceeded,
            RemainingCapacity = remaining,
            Error = $"Not enough capacity. Remaining: {remaining}."
        };
}
