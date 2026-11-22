import {
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUpazilaById,
  searchAreas,
  DIVISIONS,
  DISTRICTS,
  UPAZILAS,
} from '../areas';

describe('MAP-4: Area Search & Division/District/Upazila Hierarchy', () => {
  it('returns all 8 divisions of Bangladesh', () => {
    const divisions = getDivisions();
    expect(divisions).toHaveLength(8);
    const namesEn = divisions.map((d) => d.nameEn);
    expect(namesEn).toContain('Dhaka');
    expect(namesEn).toContain('Chattogram');
    expect(namesEn).toContain('Sylhet');
    expect(namesEn).toContain('Rajshahi');
  });

  it('filters districts by division ID', () => {
    // Dhaka division ID = 3
    const dhakaDistricts = getDistrictsByDivision(3);
    expect(dhakaDistricts.length).toBeGreaterThan(0);
    const districtNames = dhakaDistricts.map((d) => d.nameEn);
    expect(districtNames).toContain('Dhaka');
    expect(districtNames).toContain('Gazipur');

    // Barishal division ID = 1
    const barishalDistricts = getDistrictsByDivision(1);
    expect(barishalDistricts.map((d) => d.nameEn)).toContain('Barishal');
  });

  it('filters upazilas by district ID', () => {
    // Dhaka district ID = 18
    const dhakaUpazilas = getUpazilasByDistrict(18);
    expect(dhakaUpazilas.length).toBeGreaterThan(0);
    const upazilaNames = dhakaUpazilas.map((u) => u.nameEn);
    expect(upazilaNames).toContain('Dhanmondi');
    expect(upazilaNames).toContain('Gulshan');
    expect(upazilaNames).toContain('Uttara');
    expect(upazilaNames).toContain('Mirpur');
  });

  it('retrieves an upazila by its unique ID', () => {
    const dhanmondi = getUpazilaById(1801);
    expect(dhanmondi).toBeDefined();
    expect(dhanmondi?.nameEn).toBe('Dhanmondi');
    expect(dhanmondi?.nameBn).toBe('ধানমন্ডি');
    expect(dhanmondi?.lat).toBeCloseTo(23.7465, 2);
    expect(dhanmondi?.lng).toBeCloseTo(90.3752, 2);
  });

  it('searches areas by English keyword', () => {
    const results = searchAreas('dhanmondi');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameEn).toBe('Dhanmondi');
    expect(results[0].type).toBe('upazila');
    expect(results[0].lat).toBeDefined();
    expect(results[0].lng).toBeDefined();
  });

  it('searches areas by Bangla keyword', () => {
    const results = searchAreas('মিরপুর');
    expect(results.length).toBeGreaterThan(0);
    const mirpur = results.find((r) => r.nameBn.includes('মিরপুর'));
    expect(mirpur).toBeDefined();
    expect(mirpur?.type).toBe('upazila');
  });

  it('searches areas by district name', () => {
    const results = searchAreas('Sylhet');
    expect(results.length).toBeGreaterThan(0);
    const sylhet = results.find((r) => r.nameEn === 'Sylhet');
    expect(sylhet).toBeDefined();
    expect(sylhet?.type).toBe('district');
  });

  it('returns empty array for empty search queries', () => {
    expect(searchAreas('')).toEqual([]);
    expect(searchAreas('   ')).toEqual([]);
  });
});
