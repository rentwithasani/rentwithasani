// Client-side reservation persistence helpers (safe fallback if Supabase is unavailable)
export function storageKey(email) {
  return `asani_bookings_${(email || "").toLowerCase().trim()}`;
}

export function loadBookings(email) {
  try {
    const raw = localStorage.getItem(storageKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookings(email, bookings) {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify(bookings || []));
  } catch {
    // ignore
  }
}

export function upsertBooking(email, booking) {
  const current = loadBookings(email);
  const next = [
    booking,
    ...current.filter((b) => b.reservationId !== booking.reservationId),
  ];
  saveBookings(email, next);
  return next;
}

export function updateBooking(email, reservationId, patch) {
  const current = loadBookings(email);
  const next = current.map((b) =>
    b.reservationId === reservationId ? { ...b, ...patch } : b
  );
  saveBookings(email, next);
  return next;
}
