using System.Data;
using EventReservation.Server.Contracts;
using EventReservation.Server.Data;
using EventReservation.Server.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace EventReservation.Server.Services;

public class ReservationService : IReservationService
{
    private readonly AppDbContext _db;
    private readonly IReservationCodeGenerator _codeGenerator;
    private readonly IJournalService _journal;
    private readonly EventOptions _options;

    public ReservationService(
        AppDbContext db,
        IReservationCodeGenerator codeGenerator,
        IJournalService journal,
        IOptions<EventOptions> options)
    {
        _db = db;
        _codeGenerator = codeGenerator;
        _journal = journal;
        _options = options.Value;
    }

    public async Task<int> GetRemainingCapacityAsync(CancellationToken ct = default)
    {
        var reserved = await _db.Reservations
            .Where(r => !r.IsCancelled)
            .SumAsync(r => (int?)r.TicketCount, ct) ?? 0;
        return Math.Max(0, _options.Capacity - reserved);
    }

    public async Task<ReservationDto?> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        var entity = await _db.Reservations.AsNoTracking().FirstOrDefaultAsync(r => r.Code == code, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<ReservationResult> CreateAsync(CreateReservationRequest request, CancellationToken ct = default)
    {
        if (request.TicketCount < 1 || request.TicketCount > _options.MaxTicketsPerReservation)
        {
            return new ReservationResult
            {
                Status = ReservationResultStatus.ValidationFailed,
                Error = $"Ticket count must be between 1 and {_options.MaxTicketsPerReservation}."
            };
        }

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        var remaining = await GetRemainingCapacityAsync(ct);
        if (request.TicketCount > remaining)
        {
            return ReservationResult.CapacityExceeded(remaining);
        }

        var entity = new Reservation
        {
            Code = await GenerateUniqueCodeAsync(ct),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            TicketCount = request.TicketCount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsCancelled = false
        };

        _db.Reservations.Add(entity);
        await _db.SaveChangesAsync(ct);

        await _journal.RecordAsync(JournalAction.Create, entity, new
        {
            entity.Email,
            entity.Phone,
            entity.TicketCount
        }, ct);

        await tx.CommitAsync(ct);

        return ReservationResult.Ok(ToDto(entity));
    }

    public async Task<ReservationResult> UpdateAsync(string code, UpdateReservationRequest request, CancellationToken ct = default)
    {
        if (request.TicketCount < 1 || request.TicketCount > _options.MaxTicketsPerReservation)
        {
            return new ReservationResult
            {
                Status = ReservationResultStatus.ValidationFailed,
                Error = $"Ticket count must be between 1 and {_options.MaxTicketsPerReservation}."
            };
        }

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        var entity = await _db.Reservations.FirstOrDefaultAsync(r => r.Code == code, ct);
        if (entity is null) return ReservationResult.NotFound();
        if (entity.IsCancelled) return ReservationResult.AlreadyCancelled();

        var otherTickets = await _db.Reservations
            .Where(r => !r.IsCancelled && r.Id != entity.Id)
            .SumAsync(r => (int?)r.TicketCount, ct) ?? 0;
        var remainingForThis = _options.Capacity - otherTickets;
        if (request.TicketCount > remainingForThis)
        {
            return ReservationResult.CapacityExceeded(Math.Max(0, remainingForThis));
        }

        entity.Email = request.Email.Trim();
        entity.Phone = request.Phone.Trim();
        entity.TicketCount = request.TicketCount;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _journal.RecordAsync(JournalAction.Update, entity, new
        {
            entity.Email,
            entity.Phone,
            entity.TicketCount
        }, ct);

        await tx.CommitAsync(ct);

        return ReservationResult.Ok(ToDto(entity));
    }

    public async Task<ReservationResult> CancelAsync(string code, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        var entity = await _db.Reservations.FirstOrDefaultAsync(r => r.Code == code, ct);
        if (entity is null) return ReservationResult.NotFound();
        if (entity.IsCancelled) return ReservationResult.AlreadyCancelled();

        entity.IsCancelled = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await _journal.RecordAsync(JournalAction.Cancel, entity, null, ct);

        await tx.CommitAsync(ct);

        return ReservationResult.Ok(ToDto(entity));
    }

    private async Task<string> GenerateUniqueCodeAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var code = _codeGenerator.Generate();
            var exists = await _db.Reservations.AnyAsync(r => r.Code == code, ct);
            if (!exists) return code;
        }
        throw new InvalidOperationException("Failed to generate a unique reservation code after multiple attempts.");
    }

    private static ReservationDto ToDto(Reservation r) => new()
    {
        Code = r.Code,
        Email = r.Email,
        Phone = r.Phone,
        TicketCount = r.TicketCount,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt,
        IsCancelled = r.IsCancelled
    };
}
