using System.ComponentModel.DataAnnotations;

namespace EventReservation.Server.Domain;

public class Reservation
{
    public int Id { get; set; }

    [Required]
    [MaxLength(16)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Phone { get; set; } = string.Empty;

    [Range(1, 10)]
    public int TicketCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsCancelled { get; set; }
}
