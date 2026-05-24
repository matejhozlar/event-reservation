using EventReservation.Server.Contracts;

namespace EventReservation.Server.Services;

public interface IReservationService
{
    Task<ReservationResult> CreateAsync(CreateReservationRequest request, CancellationToken ct = default);
    Task<ReservationDto?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<ReservationResult> UpdateAsync(string code, UpdateReservationRequest request, CancellationToken ct = default);
    Task<ReservationResult> CancelAsync(string code, CancellationToken ct = default);
    Task<int> GetRemainingCapacityAsync(CancellationToken ct = default);
}
