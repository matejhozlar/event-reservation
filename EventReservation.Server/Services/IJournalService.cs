using EventReservation.Server.Domain;

namespace EventReservation.Server.Services;

public interface IJournalService
{
    Task RecordAsync(JournalAction action, Reservation reservation, object? payload, CancellationToken ct = default);
}
