import { useLocalSearchParams } from 'expo-router';
import { BookingFlowScreen } from '../features/booking';

export default function BookScreen() {
  const params = useLocalSearchParams<{
    locationId?: string;
    vetId?: string;
    serviceId?: string;
    bookingType?: string;
    date?: string;
  }>();

  return (
    <BookingFlowScreen
      initialLocationId={params.locationId}
      initialVetId={params.vetId}
      initialServiceId={params.serviceId}
      initialBookingType={params.bookingType === 'serial' ? 'serial' : 'slot'}
      initialDate={params.date}
    />
  );
}
