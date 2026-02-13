-- Replace individual indexes with composite index for overlap check query
DROP INDEX `bookings_end_idx` ON `bookings`;
DROP INDEX `bookings_callsign_idx` ON `bookings`;

-- Composite index for checkBookingOverlap (callsign + start + end)
CREATE INDEX `bookings_callsign_start_end_idx` ON `bookings`(`callsign`, `start`, `end`);
