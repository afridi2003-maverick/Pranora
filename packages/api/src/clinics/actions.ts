/**
 * MAP-6: One-tap actions (Call, Directions, Book) & Route Contract
 * Integration 6: Map ↔ Booking (schema.md §5.4.5)
 * Owner: Zimia | Sprint: S3
 */

export interface BookingRouteParams {
  locationId: string;
  vetId?: string | null;
  serviceId?: string | null;
  bookingType?: 'slot' | 'serial' | null;
  date?: string | null; // YYYY-MM-DD
}

/**
 * Normalizes phone string into clean dialable tel: format.
 * Strips whitespace, brackets, and extra non-dialable characters while preserving '+' prefix.
 */
export function formatPhoneForDial(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned;
}

/**
 * Returns a tel: URI for one-tap calling (MAP-6).
 */
export function buildTelUrl(phone: string): string {
  return `tel:${formatPhoneForDial(phone)}`;
}

/**
 * Returns Google Maps directions URL for one-tap navigation (MAP-6).
 */
export function buildDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Constructs the standard booking flow entry route adhering to
 * Integration Contract 6 (schema.md §5.4.5):
 * Route: `/book?locationId=<uuid>&vetId=<uuid>&serviceId=<uuid>&bookingType=<type>&date=<YYYY-MM-DD>`
 */
export function buildBookingUrl(
  params: BookingRouteParams,
  baseRoute: string = '/book'
): string {
  const search = new URLSearchParams();

  if (params.locationId) {
    search.set('locationId', params.locationId);
  }
  if (params.vetId) {
    search.set('vetId', params.vetId);
  }
  if (params.serviceId) {
    search.set('serviceId', params.serviceId);
  }
  if (params.bookingType) {
    search.set('bookingType', params.bookingType);
  }
  if (params.date) {
    search.set('date', params.date);
  }

  const query = search.toString();
  return query ? `${baseRoute}?${query}` : baseRoute;
}

/**
 * Parses query parameters from a URL or query string into typed BookingRouteParams.
 * Consumed by APT-1 (Booking Screen).
 */
export function parseBookingUrl(searchOrUrl: string): BookingRouteParams {
  let queryString = searchOrUrl;
  if (queryString.includes('?')) {
    queryString = queryString.split('?')[1] ?? '';
  }

  const search = new URLSearchParams(queryString);
  const locationId = search.get('locationId') ?? '';
  const vetId = search.get('vetId');
  const serviceId = search.get('serviceId');
  const bookingTypeRaw = search.get('bookingType');
  const date = search.get('date');

  const bookingType =
    bookingTypeRaw === 'slot' || bookingTypeRaw === 'serial'
      ? bookingTypeRaw
      : null;

  return {
    locationId,
    vetId: vetId || null,
    serviceId: serviceId || null,
    bookingType,
    date: date || null,
  };
}
