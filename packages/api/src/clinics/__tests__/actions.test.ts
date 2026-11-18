import {
  formatPhoneForDial,
  buildTelUrl,
  buildDirectionsUrl,
  buildBookingUrl,
  parseBookingUrl,
} from '../actions';

describe('MAP-6: Clinic One-Tap Actions & Booking Contract', () => {
  it('formats phone numbers correctly for dialing', () => {
    expect(formatPhoneForDial('+880 1712-345678')).toBe('+8801712345678');
    expect(formatPhoneForDial('(02) 223382103')).toBe('02223382103');
    expect(buildTelUrl('+880 1712-345678')).toBe('tel:+8801712345678');
  });

  it('builds Google Maps directions URL', () => {
    const url = buildDirectionsUrl(23.7465, 90.3752);
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=23.7465,90.3752');
  });

  it('builds standard booking URL conforming to schema.md §5.4.5', () => {
    const url = buildBookingUrl({
      locationId: '30000000-0000-0000-0000-000000000002',
      vetId: '40000000-0000-0000-0000-000000000001',
      serviceId: '1',
      bookingType: 'slot',
      date: '2026-11-25',
    });

    expect(url).toBe(
      '/book?locationId=30000000-0000-0000-0000-000000000002&vetId=40000000-0000-0000-0000-000000000001&serviceId=1&bookingType=slot&date=2026-11-25'
    );
  });

  it('parses booking URL params correctly for APT-1 integration', () => {
    const url =
      '/book?locationId=30000000-0000-0000-0000-000000000002&vetId=40000000-0000-0000-0000-000000000001&serviceId=1&bookingType=serial&date=2026-11-25';

    const parsed = parseBookingUrl(url);
    expect(parsed).toEqual({
      locationId: '30000000-0000-0000-0000-000000000002',
      vetId: '40000000-0000-0000-0000-000000000001',
      serviceId: '1',
      bookingType: 'serial',
      date: '2026-11-25',
    });
  });
});
