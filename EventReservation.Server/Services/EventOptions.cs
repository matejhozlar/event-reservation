namespace EventReservation.Server.Services;

public class EventOptions
{
    public const string SectionName = "Event";

    public DateTime DateUtc { get; set; }
    public int Capacity { get; set; } = 100;
    public int MaxTicketsPerReservation { get; set; } = 10;
}
