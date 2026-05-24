using EventReservation.Server.Domain;
using Microsoft.EntityFrameworkCore;

namespace EventReservation.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Reservation>(e =>
        {
            e.HasIndex(r => r.Code).IsUnique();
            e.Property(r => r.Code).HasMaxLength(16).IsRequired();
            e.Property(r => r.Email).HasMaxLength(254).IsRequired();
            e.Property(r => r.Phone).HasMaxLength(32).IsRequired();
        });

        modelBuilder.Entity<JournalEntry>(e =>
        {
            e.HasIndex(j => j.ReservationCode);
            e.Property(j => j.ReservationCode).HasMaxLength(16);
            e.Property(j => j.IpAddress).HasMaxLength(64);
            e.Property(j => j.UserAgent).HasMaxLength(512);
        });
    }
}
