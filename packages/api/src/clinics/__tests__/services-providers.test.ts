import {
  SERVICE_CATALOG,
  getServiceBySlug,
  resolveServiceSlug,
  getProvidersByServiceSlug,
} from '../services-providers';

describe('SVC-2: Provider List Per Service (List / Map Toggle)', () => {
  it('retrieves service catalog metadata by service slug', () => {
    const consultation = getServiceBySlug('clinic_visit');
    expect(consultation).toBeDefined();
    expect(consultation?.nameEn).toContain('Clinic Consultation');
    expect(consultation?.priceRangeBn).toBe('৳৫০ – ৳৮০০');
  });

  it('normalizes category slug to corresponding service slug', () => {
    expect(resolveServiceSlug('vet')).toBe('clinic_visit');
    expect(resolveServiceSlug('vaccination')).toBe('vaccine_clinic');
    expect(resolveServiceSlug('emergency')).toBe('emergency_care');
    expect(resolveServiceSlug('home_visit')).toBe('home_vet_visit');
  });

  it('retrieves distance-sorted providers offering clinic_visit', () => {
    const providers = getProvidersByServiceSlug('clinic_visit', {
      lat: 23.7465,
      lng: 90.3752, // Dhanmondi
    });

    expect(providers.length).toBeGreaterThan(0);
    // Nearest should be Dhanmondi clinic
    expect(providers[0].clinicNameEn).toContain('Care Pet Clinic');
    expect(providers[0].distanceM).toBeLessThan(1000);
    expect(providers[0].price).toBeGreaterThan(0);
  });

  it('filters providers offering vaccination by government ownership', () => {
    const govtProviders = getProvidersByServiceSlug('vaccine_clinic', {
      govt: 'govt',
    });

    expect(govtProviders.length).toBeGreaterThan(0);
    expect(govtProviders.every((p) => p.isGovernment)).toBe(true);
    const cvh = govtProviders.find((p) => p.clinicNameEn.includes('Central Veterinary Hospital'));
    expect(cvh).toBeDefined();
  });

  it('filters providers by maximum consultation/service price', () => {
    const affordableProviders = getProvidersByServiceSlug('clinic_visit', {
      maxPrice: 200,
    });

    expect(affordableProviders.length).toBeGreaterThan(0);
    expect(affordableProviders.every((p) => p.price <= 200)).toBe(true);
  });

  it('filters home visit providers', () => {
    const homeVisitProviders = getProvidersByServiceSlug('home_vet_visit');
    expect(homeVisitProviders.length).toBeGreaterThan(0);
    expect(homeVisitProviders.every((p) => p.offersHomeVisit)).toBe(true);
  });
});
