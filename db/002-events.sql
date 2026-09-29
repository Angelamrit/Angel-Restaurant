-- Event date reservations.
--
-- Deliberately holds NO customer information: a row is only a date, what kind of
-- occasion it is, and where it sits in the workflow. The visitor's name, email,
-- phone and message stay in the enquiry email to the restaurant team and are
-- never written here, so the assistant cannot leak them even in principle — the
-- data simply is not in the table it reads.
--
-- event_date is a plain ISO yyyy-mm-dd string, matching how every other date in
-- this schema is stored, so one query shape serves every date the application
-- supports. There is no per-date or per-month logic anywhere.
CREATE TABLE IF NOT EXISTS event_reservations (
  id TEXT PRIMARY KEY,
  event_date TEXT NOT NULL CHECK(length(event_date) = 10),
  event_type TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'reserved', 'cancelled')),
  created_at TEXT NOT NULL
);

-- The only read this table serves: "is any blocking event on this date?".
CREATE INDEX IF NOT EXISTS event_reservations_date_status ON event_reservations(event_date, status);
