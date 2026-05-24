namespace EventReservation.Server.Domain;

public enum JournalAction
{
    Create = 1,
    Update = 2,
    Cancel = 3
}

public class JournalEntry
{
    public int Id { get; set; }

    public int? ReservationId { get; set; }

    public string ReservationCode { get; set; } = string.Empty;

    public JournalAction Action { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime Timestamp { get; set; }

    public string? PayloadJson { get; set; }
}
