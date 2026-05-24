using System.ComponentModel.DataAnnotations;

namespace EventReservation.Server.Contracts;

public class CreateReservationRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Phone { get; set; } = string.Empty;

    [Range(1, 10)]
    public int TicketCount { get; set; }
}

public class UpdateReservationRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Phone { get; set; } = string.Empty;

    [Range(1, 10)]
    public int TicketCount { get; set; }
}

public class ReservationDto
{
    public string Code { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int TicketCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsCancelled { get; set; }
}

public class EventConfigDto
{
    public DateTime EventDateUtc { get; set; }
    public int Capacity { get; set; }
    public int MaxTicketsPerReservation { get; set; }
    public int RemainingCapacity { get; set; }
}
