# Event Reservation

Reservation system for a cultural event held on **31 December 2027 at 19:00**.
Single-page React (TypeScript) client backed by an ASP.NET Core 10 REST API
with SQLite storage.

## Features

- 3-step wizard (Welcome → Details → Confirmation) built with MUI.
- Create, view, edit, and cancel a reservation, identified by a short code
  (`EVT-XXXXX`).
- Server-side enforcement of capacity (100 seats) and per-reservation limit
  (10 tickets) inside a serializable transaction (SQLite `BEGIN IMMEDIATE`)
  so concurrent writes cannot overbook.
- Client- and server-side validation of email, phone, and ticket count.
- Every mutation is recorded in a journal with IP address, User-Agent,
  timestamp, and a JSON snapshot of the payload.

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19 + TypeScript + Vite, MUI v9              |
| Backend  | ASP.NET Core 10, EF Core 10 (Sqlite), DI built-in |
| Database | SQLite (file-based, auto-migrated on startup)     |

## Project layout

```
EventReservation/
├── EventReservation.Server/        ASP.NET Core API
│   ├── Controllers/                ConfigController, ReservationsController
│   ├── Services/                   IReservationService, IJournalService, ...
│   ├── Domain/                     Reservation, JournalEntry
│   ├── Data/                       AppDbContext
│   ├── Migrations/                 EF Core migrations
│   └── Contracts/                  Request / response DTOs
└── eventreservation.client/        React + Vite SPA
    └── src/
        ├── api/                    Typed fetch client
        ├── components/             Wizard steps and shell
        ├── theme.ts                MUI theme
        └── types.ts                Shared client/server types
```

## Running

### Prerequisites

- Visual Studio 2022 (17.12+) **or** the .NET 10 SDK
- Node.js 20+
- (One-time) Trust the ASP.NET Core dev certificate so the browser stops
  warning about the local HTTPS cert:
  ```
  dotnet dev-certs https --trust
  ```

### From Visual Studio

1. Open `EventReservation.sln`.
2. Make sure `EventReservation.Server` is the startup project.
3. Press **F5** with the `https` launch profile selected.

The backend launches the Vite dev server automatically via
`Microsoft.AspNetCore.SpaProxy` and opens the client at
`https://localhost:52262`.

### From the command line

```bash
# 1. Restore + install (first run only)
dotnet restore
cd eventreservation.client && npm install && cd ..

# 2. Run the server (it will spawn the Vite dev server)
dotnet run --project EventReservation.Server --launch-profile https
```

Then open `https://localhost:52262`.

The SQLite database file `eventreservation.db` is created next to the server
binary on first run; EF Core migrations are applied automatically at startup,
so no manual database setup is needed.

## REST API

Base URL: `https://localhost:7254`

| Method   | Path                       | Body                              | Notes                                             |
| -------- | -------------------------- | --------------------------------- | ------------------------------------------------- |
| `GET`    | `/api/config`              | -                                 | Event date, capacity, max tickets, remaining seats |
| `POST`   | `/api/reservations`        | `{ email, phone, ticketCount }`   | Returns the created reservation including `code`   |
| `GET`    | `/api/reservations/{code}` | -                                 | Fetch a reservation by code                        |
| `PUT`    | `/api/reservations/{code}` | `{ email, phone, ticketCount }`   | Update an existing reservation                     |
| `DELETE` | `/api/reservations/{code}` | -                                 | Soft-cancel a reservation                          |

Example requests are in `EventReservation.Server/EventReservation.Server.http`
(clickable inside Visual Studio).

## Configuration

Event configuration lives in `EventReservation.Server/appsettings.json` and
is exposed via `GET /api/config`:

```json
"Event": {
  "DateUtc": "2027-12-31T18:00:00Z",
  "Capacity": 100,
  "MaxTicketsPerReservation": 10
}
```

The date is stored in UTC; `2027-12-31T18:00:00Z` corresponds to
**19:00 Central European Time** (winter, UTC+1).

The SQLite connection string is also in `appsettings.json`:

```json
"ConnectionStrings": {
  "AppDb": "Data Source=eventreservation.db"
}
```

## Journal

Every create / update / cancel operation writes a `JournalEntry` row with:

- `ReservationCode` and `ReservationId`
- `Action` (Create, Update, Cancel)
- `IpAddress` of the caller
- `UserAgent` (i.e. navigator)
- `Timestamp` (UTC)
- `PayloadJson` snapshot of the request

You can inspect the journal directly in `eventreservation.db` with any SQLite
browser:

```sql
SELECT Timestamp, ReservationCode, Action, IpAddress, UserAgent, PayloadJson
FROM JournalEntries
ORDER BY Timestamp DESC;
```
