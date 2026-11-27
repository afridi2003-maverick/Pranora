'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Chip, SearchBar, EmptyState } from '@pranora/ui';
import {
  getNearbyClinicsWithFallback,
  type NearbyClinicResult,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
  searchAreas,
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUpazilaById,
  type AreaSearchResult,
  clusterMarkers,
  autoExpandRadius,
  RADIUS_TIERS_KM,
  type RadiusTierKm,
  saveNearbyCache,
  getNearbyCache,
} from '@pranora/api';
import { useSession } from '../../../hooks/useSession';

const DEFAULT_DHAKA_COORDS = { lat: 23.7465, lng: 90.3752 }; // Dhanmondi

export default function WebMapPage() {
  const router = useRouter();
  const { isBangla, locale } = useLocale();
  const { supabase, isConfigured } = useSession();

  // Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_DHAKA_COORDS);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [locationName, setLocationName] = useState<string>('ধানমন্ডি, ঢাকা');

  // Search & Filter state (MAP-3)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filter24h, setFilter24h] = useState<boolean>(false);
  const [filterEmergency, setFilterEmergency] = useState<boolean>(false);
  const [filterHomeVisit, setFilterHomeVisit] = useState<boolean>(false);
  const [filterGovt, setFilterGovt] = useState<'all' | 'govt' | 'private'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat' | 'bird' | 'rabbit'>('all');
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);

  // Radius Slider (MAP-8)
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [autoExpandNotice, setAutoExpandNotice] = useState<string | null>(null);

  // Service Layers (MAP-10)
  const [activeLayer, setActiveLayer] = useState<'all' | 'vet' | 'grooming' | 'boarding' | 'home_visit' | 'emergency'>('all');

  // Area Picker state (MAP-4)
  const [areaModalOpen, setAreaModalOpen] = useState<boolean>(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number>(3); // Default Dhaka
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(18); // Default Dhaka district
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<number>(1801); // Default Dhanmondi
  const [showAreaSuggestions, setShowAreaSuggestions] = useState<boolean>(false);

  const areaSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchAreas(searchQuery);
  }, [searchQuery]);

  const handleSelectArea = (result: AreaSearchResult) => {
    setUserCoords({ lat: result.lat, lng: result.lng });
    setLocationName(isBangla ? result.nameBn : result.nameEn);
    setShowAreaSuggestions(false);
    setSearchQuery('');
  };

  const availableDivisions = useMemo(() => getDivisions(), []);
  const availableDistricts = useMemo(() => getDistrictsByDivision(selectedDivisionId), [selectedDivisionId]);
  const availableUpazilas = useMemo(() => getUpazilasByDistrict(selectedDistrictId), [selectedDistrictId]);

  const handleConfirmAreaPicker = () => {
    const upazila = getUpazilaById(selectedUpazilaId) || availableUpazilas[0];
    if (upazila) {
      setUserCoords({ lat: upazila.lat, lng: upazila.lng });
      setLocationName(isBangla ? upazila.nameBn : upazila.nameEn);
    }
    setAreaModalOpen(false);
  };

  // View state
  const [mobileView, setMobileView] = useState<'split' | 'map' | 'list'>('split');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<NearbyClinicResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Read URL query parameters on mount for shareable filter links (docs/app-flow.md §4)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('open') === '1') setFilterOpenNow(true);
      if (searchParams.get('open24') === '1') setFilter24h(true);
      if (searchParams.get('emergency') === '1') setFilterEmergency(true);
      if (searchParams.get('homeVisit') === '1') setFilterHomeVisit(true);
      const g = searchParams.get('govt');
      if (g === 'govt' || g === 'private') setFilterGovt(g);
      const sp = searchParams.get('species');
      if (sp === 'dog' || sp === 'cat' || sp === 'bird' || sp === 'rabbit') setSelectedSpecies(sp);
      const fee = searchParams.get('maxFee');
      if (fee && !isNaN(Number(fee))) setMaxFee(Number(fee));
    }
  }, []);

  // Sync state changes to URL query parameters without reloading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams();
      if (filterOpenNow) searchParams.set('open', '1');
      if (filter24h) searchParams.set('open24', '1');
      if (filterEmergency) searchParams.set('emergency', '1');
      if (filterHomeVisit) searchParams.set('homeVisit', '1');
      if (filterGovt !== 'all') searchParams.set('govt', filterGovt);
      if (selectedSpecies !== 'all') searchParams.set('species', selectedSpecies);
      if (maxFee !== null) searchParams.set('maxFee', maxFee.toString());

      const queryStr = searchParams.toString();
      const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [filterOpenNow, filter24h, filterEmergency, filterHomeVisit, filterGovt, selectedSpecies, maxFee]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterOpenNow) count++;
    if (filter24h) count++;
    if (filterEmergency) count++;
    if (filterHomeVisit) count++;
    if (filterGovt !== 'all') count++;
    if (selectedSpecies !== 'all') count++;
    if (maxFee !== null) count++;
    return count;
  }, [filterOpenNow, filter24h, filterEmergency, filterHomeVisit, filterGovt, selectedSpecies, maxFee]);

  const handleResetFilters = () => {
    setFilterOpenNow(false);
    setFilter24h(false);
    setFilterEmergency(false);
    setFilterHomeVisit(false);
    setFilterGovt('all');
    setSelectedSpecies('all');
    setMaxFee(null);
    setSearchQuery('');
  };

  // Request browser geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermission('granted');
          setLocationName(isBangla ? 'আমার বর্তমান অবস্থান' : 'My Current Location');
        },
        () => {
          setLocationPermission('denied');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, [isBangla]);

  // Fetch / compute nearby clinics
  useEffect(() => {
    let active = true;
    async function fetchClinics() {
      setLoading(true);

      // MAP-12: Offline cache check if navigator is offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const cached = getNearbyCache(userCoords);
        if (cached && cached.clinics.length > 0) {
          setClinics(cached.clinics);
          setIsOffline(true);
          setLoading(false);
          return;
        }
      }

      try {
        const results = await getNearbyClinicsWithFallback(
          {
            lat: userCoords.lat,
            lng: userCoords.lng,
            radiusM: radiusKm * 1000,
            openNow: filterOpenNow,
            emergency: filterEmergency || activeLayer === 'emergency',
            homeVisit: filterHomeVisit || activeLayer === 'home_visit',
            species: selectedSpecies !== 'all' ? selectedSpecies : undefined,
            maxFee: maxFee !== null ? maxFee : undefined,
            limit: 50,
          },
          isConfigured ? supabase : null
        );

        if (active) {
          // MAP-12: Cache results for offline resilience
          saveNearbyCache(results, userCoords, radiusKm * 1000);
          setIsOffline(false);

          if (results.length === 0) {
            // Auto-expand search radius if nothing found (MAP-8)
            const expansion = autoExpandRadius(radiusKm, 0);
            if (expansion.didExpand) {
              setRadiusKm(expansion.nextRadiusKm);
              setAutoExpandNotice(
                isBangla
                  ? `${radiusKm} কিমিতে কোনো ক্লিনিক পাওয়া যায়নি, অনুসন্ধান পরিধি বাড়িয়ে ${expansion.nextRadiusKm} কিমি করা হয়েছে`
                  : `No clinics found within ${radiusKm} km, automatically expanded search to ${expansion.nextRadiusKm} km`
              );
            }
          } else {
            setAutoExpandNotice(null);
          }

          setClinics(results);
          if (results.length > 0 && !selectedClinicId) {
            setSelectedClinicId(results[0]?.locationId ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load nearby clinics:', err);
        // MAP-12: Fallback to cached results if available
        const cached = getNearbyCache(userCoords);
        if (cached && cached.clinics.length > 0) {
          setClinics(cached.clinics);
          setIsOffline(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchClinics();
    return () => {
      active = false;
    };
  }, [userCoords, radiusKm, activeLayer, filterOpenNow, filterEmergency, filterHomeVisit, selectedSpecies, maxFee, isConfigured, supabase, isBangla]);

  // MAP-12: Online/offline event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      const cached = getNearbyCache(userCoords);
      if (cached && cached.clinics.length > 0) {
        setClinics(cached.clinics);
        setIsOffline(true);
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userCoords]);

  // Client-side search and ownership filter (MAP-3 & MAP-10)
  const displayedClinics = useMemo(() => {
    return clinics.filter((c) => {
      const name = (isBangla ? c.nameBn : c.nameEn) || c.nameEn || '';
      const address = (isBangla ? c.addressBn : c.addressEn) || c.addressEn || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter24h && !c.is24h) return false;
      if (filterGovt === 'govt' && !c.isGovernment) return false;
      if (filterGovt === 'private' && c.isGovernment) return false;
      if (maxFee !== null && (c.feeFrom ?? 500) > maxFee) return false;

      // Layer filtering (MAP-10)
      if (activeLayer === 'grooming' && !c.nameEn?.toLowerCase().includes('animal') && !c.offersHomeVisit) {
        return false;
      }
      if (activeLayer === 'boarding' && c.isGovernment) {
        return false;
      }
      if (activeLayer === 'home_visit' && !c.offersHomeVisit) {
        return false;
      }
      if (activeLayer === 'emergency' && !c.hasEmergency && !c.is24h) {
        return false;
      }

      return true;
    });
  }, [clinics, searchQuery, filter24h, filterGovt, maxFee, activeLayer, isBangla]);

  // Marker clustering (MAP-9)
  const mapClusters = useMemo(() => {
    return clusterMarkers(displayedClinics, 12, 50);
  }, [displayedClinics]);
      const name = (isBangla ? c.nameBn : c.nameEn) || c.nameEn || '';
      const address = (isBangla ? c.addressBn : c.addressEn) || c.addressEn || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter24h && !c.is24h) return false;
      if (filterGovt === 'govt' && !c.isGovernment) return false;
      if (filterGovt === 'private' && c.isGovernment) return false;
      if (maxFee !== null && (c.feeFrom ?? 500) > maxFee) return false;

      return true;
    });
  }, [clinics, searchQuery, filter24h, filterGovt, maxFee, isBangla]);

  const selectedClinic = useMemo(() => {
    return clinics.find((c) => c.locationId === selectedClinicId) || displayedClinics[0];
  }, [clinics, displayedClinics, selectedClinicId]);

  const handleRecenter = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermission('granted');
        },
        () => {
          setUserCoords(DEFAULT_DHAKA_COORDS);
        }
      );
    }
  };

  const handleCall = (phone: string | null) => {
    if (phone && typeof window !== 'undefined') {
      window.location.href = buildTelUrl(phone);
    }
  };

  const handleDirections = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      window.open(buildDirectionsUrl(lat, lng), '_blank', 'noopener,noreferrer');
    }
  };

  const handleBook = (locationId: string) => {
    router.push(`/${locale}${buildBookingUrl({ locationId })}`);
  };

  return (
    <div className="min-h-screen bg-green-50/20 dark:bg-gray-900 flex flex-col text-content-primary">
      {/* Top Search & Filter Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/80 px-4 py-3 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Title & Location indicator */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-bangla text-green-900 dark:text-green-300 flex items-center gap-2">
                <span>📍</span>
                <span>{isBangla ? 'নিকটস্থ পশু চিকিৎসক ও ক্লিনিক' : 'Nearest Veterinary Map'}</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bangla flex items-center gap-1.5 mt-0.5">
                <span>🎯</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{locationName}</span>
                <button
                  onClick={() => setAreaModalOpen(true)}
                  className="text-xs text-green-700 dark:text-green-400 font-bold hover:underline ml-1 flex items-center gap-0.5"
                >
                  <span>✏️</span>
                  <span>{isBangla ? 'এলাকা পরিবর্তন' : 'Change Area'}</span>
                </button>
                {locationPermission === 'denied' && (
                  <span className="text-amber-600 dark:text-amber-400 ml-1">
                    ({isBangla ? 'ডিফল্ট অবস্থান' : 'default location'})
                  </span>
                )}
              </p>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg text-xs font-bangla">
              <button
                onClick={() => setMobileView('list')}
                className={`px-3 py-1.5 rounded-md ${
                  mobileView === 'list'
                    ? 'bg-white dark:bg-gray-800 font-bold text-green-800 shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                📋 {isBangla ? 'তালিকা' : 'List'}
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`px-3 py-1.5 rounded-md ${
                  mobileView === 'map'
                    ? 'bg-white dark:bg-gray-800 font-bold text-green-800 shadow-xs'
                    : 'text-gray-600'
                }`}
              >
                🗺️ {isBangla ? 'ম্যাপ' : 'Map'}
              </button>
            </div>
          </div>

          {/* Search bar with Area Autocomplete (MAP-4) */}
          <div className="flex-1 max-w-md relative">
            <SearchBar
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAreaSuggestions(true);
              }}
              placeholder={isBangla ? 'ক্লিনিকের নাম বা এলাকা খুঁজুন...' : 'Search clinic or area...'}
              onClear={() => {
                setSearchQuery('');
                setShowAreaSuggestions(false);
              }}
            />

            {/* Area Suggestions Dropdown (MAP-4) */}
            {showAreaSuggestions && areaSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-[11px] font-bangla font-semibold text-gray-500 flex justify-between items-center">
                  <span>📍 {isBangla ? 'এলাকা সাজেশন' : 'Area Suggestions'}</span>
                  <button onClick={() => setShowAreaSuggestions(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                {areaSuggestions.map((area) => (
                  <button
                    key={`${area.type}-${area.id}`}
                    onClick={() => handleSelectArea(area)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 dark:hover:bg-green-950/30 flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-bangla font-semibold text-gray-800 dark:text-gray-200">
                        {isBangla ? area.nameBn : area.nameEn}
                        <span className="text-[10px] text-gray-400 ml-1.5 font-normal">({area.nameEn})</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-bangla">
                        {isBangla ? area.parentNameBn : area.parentNameEn}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bangla">
                      {area.type === 'upazila' ? (isBangla ? 'উপজেলা/থানা' : 'Thana') : (isBangla ? 'জেলা' : 'District')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Mode Quick Toggle */}
          <Button
            variant={filterEmergency ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilterEmergency((prev) => !prev)}
            className={`font-bangla flex items-center justify-center gap-1.5 shrink-0 ${
              filterEmergency
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'text-red-700 border-red-300 hover:bg-red-50'
            }`}
          >
            <span>🚨</span>
            <span>{isBangla ? 'জরুরি মোড' : 'Emergency Mode'}</span>
          </Button>
        </div>

        {/* Filter Chips Bar (MAP-3 & MAP-4) */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
          {/* Area Picker Chip (MAP-4) */}
          <button
            onClick={() => setAreaModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-green-300 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200 flex items-center gap-1.5 font-bangla font-semibold shrink-0 hover:bg-green-100 transition shadow-xs cursor-pointer"
          >
            <span>📍</span>
            <span>{locationName}</span>
            <span className="text-[10px] bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 px-1.5 py-0.5 rounded-full">
              {isBangla ? 'পরিবর্তন' : 'Change'}
            </span>
          </button>

          <button
            onClick={() => setFilterModalOpen(true)}
            className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-bangla font-semibold transition shrink-0 ${
              activeFilterCount > 0
                ? 'bg-green-700 text-white border-green-700 shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>⚙️</span>
            <span>{isBangla ? 'ফিল্টার' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-white text-green-800 text-[11px] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <Chip
            label={isBangla ? 'এখন খোলা' : 'Open Now'}
            isSelected={filterOpenNow}
            onSelect={() => setFilterOpenNow((p) => !p)}
          />
          <Chip
            label={isBangla ? '২৪/৭ খোলা' : '24/7 Open'}
            isSelected={filter24h}
            onSelect={() => setFilter24h((p) => !p)}
          />
          <Chip
            label={isBangla ? 'হোম ভিজিট' : 'Home Visit'}
            isSelected={filterHomeVisit}
            onSelect={() => setFilterHomeVisit((p) => !p)}
          />
          <Chip
            label={isBangla ? '🏛️ সরকারি' : 'Govt'}
            isSelected={filterGovt === 'govt'}
            onSelect={() => setFilterGovt((p) => (p === 'govt' ? 'all' : 'govt'))}
          />
          <Chip
            label={isBangla ? '🏥 বেসরকারি' : 'Private'}
            isSelected={filterGovt === 'private'}
            onSelect={() => setFilterGovt((p) => (p === 'private' ? 'all' : 'private'))}
          />

          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />

          {/* Fee quick filter */}
          <Chip
            label={maxFee ? (isBangla ? `ফি সর্বোচ্চ ৳${maxFee}` : `Fee ≤ ৳${maxFee}`) : (isBangla ? 'ফি: যেকোনো' : 'Fee: Any')}
            isSelected={maxFee !== null}
            onSelect={() => setMaxFee((prev) => (prev ? null : 500))}
          />

          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />

          {/* Species filters */}
          {(['all', 'dog', 'cat', 'bird', 'rabbit'] as const).map((sp) => {
            const labels = {
              all: isBangla ? 'সকল প্রজাতি' : 'All Species',
              dog: isBangla ? '🐕 কুকুর' : '🐕 Dogs',
              cat: isBangla ? '🐈 বিড়াল' : '🐈 Cats',
              bird: isBangla ? '🦜 পাখি' : '🦜 Birds',
              rabbit: isBangla ? '🐇 খরগোশ' : '🐇 Rabbits',
            };
            return (
              <Chip
                key={sp}
                label={labels[sp]}
                isSelected={selectedSpecies === sp}
                onSelect={() => setSelectedSpecies(sp)}
              />
            );
          })}

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bangla font-semibold px-2 py-1 rounded shrink-0 hover:bg-red-50 transition"
            >
              ✕ {isBangla ? 'ফিল্টার মুছুন' : 'Reset'}
            </button>
          )}

          {/* Suggest a Clinic Button (MAP-11) */}
          <button
            onClick={() => router.push(`/${locale}/clinics/suggest`)}
            className="ml-auto text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bangla font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 transition"
          >
            <span>➕</span>
            <span>{isBangla ? 'ক্লিনিক যোগ করার অনুরোধ' : 'Suggest Clinic'}</span>
          </button>
        </div>

        {/* Service Layers (MAP-10) & Search Radius Slider (MAP-8) */}
        <div className="max-w-7xl mx-auto pt-2 pb-1 border-t border-gray-100 dark:border-gray-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* MAP-10 Service Layers */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bangla font-semibold text-gray-500 shrink-0">
              {isBangla ? 'লেয়ার:' : 'Layers:'}
            </span>
            {[
              { id: 'all', icon: '🌐', labelBn: 'সকল সেবা', labelEn: 'All Services' },
              { id: 'vet', icon: '🩺', labelBn: 'চিকিৎসা', labelEn: 'Veterinary' },
              { id: 'grooming', icon: '✂️', labelBn: 'গ্রুমিং', labelEn: 'Grooming' },
              { id: 'boarding', icon: '🏨', labelBn: 'বোর্ডিং', labelEn: 'Boarding' },
              { id: 'home_visit', icon: '🏡', labelBn: 'হোম ভিজিট', labelEn: 'Home Visit' },
              { id: 'emergency', icon: '🚨', labelBn: 'জরুরি ২৪/৭', labelEn: '24/7 Emergency' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bangla text-xs flex items-center gap-1 transition shrink-0 ${
                  activeLayer === layer.id
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <span>{layer.icon}</span>
                <span>{isBangla ? layer.labelBn : layer.labelEn}</span>
              </button>
            ))}
          </div>

          {/* MAP-8 Radius Slider Controls */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0">
            <span className="text-[11px] font-bangla font-semibold text-gray-600 dark:text-gray-300">
              📏 {isBangla ? 'অনুসন্ধান পরিধি:' : 'Search Radius:'} <strong className="text-emerald-700 dark:text-emerald-400">{radiusKm} km</strong>
            </span>
            <div className="flex items-center gap-1">
              {RADIUS_TIERS_KM.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setRadiusKm(tier)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-bangla transition ${
                    radiusKm === tier
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tier}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAP-8 Auto-Expansion Notification Banner */}
        {autoExpandNotice && (
          <div className="max-w-7xl mx-auto mt-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bangla flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{autoExpandNotice}</span>
            </div>
            <button onClick={() => setAutoExpandNotice(null)} className="text-amber-700 font-bold hover:underline">✕</button>
          </div>
        )}

        {/* MAP-12 Offline Cache Warning Banner */}
        {isOffline && (
          <div className="max-w-7xl mx-auto mt-1 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-bangla flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">📡</span>
              <div>
                <span className="font-bold">
                  {isBangla ? 'অফলাইন মোড:' : 'Offline Mode:'}
                </span>
                <span className="ml-1 text-[11px]">
                  {isBangla
                    ? 'ইন্টারনেট সংযোগ নেই। পূর্বে সংরক্ষিত নিকটস্থ ক্লিনিক তালিকা প্রদর্শিত হচ্ছে।'
                    : 'No internet connection. Displaying locally cached nearby clinics.'}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono font-bold px-2 py-0.5 rounded">
              OFFLINE CACHE
            </span>
          </div>
        )}
      </header>

      {/* Main Split View Area (MAP-1b Desktop Split / Mobile Toggle) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Distance-Sorted Clinic List (MAP-2) */}
        <section
          className={`w-full md:w-[45%] lg:w-[40%] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Results Summary Header */}
          <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-bangla text-gray-600 dark:text-gray-400">
            <span>
              {isBangla
                ? `কাছাকাছি ${displayedClinics.length}টি ক্লিনিক পাওয়া গেছে (দূরত্ব অনুযায়ী সাজানো)`
                : `Found ${displayedClinics.length} clinics nearby (sorted by distance)`}
            </span>
            <span className="text-[11px] text-green-700 dark:text-green-400 font-semibold">
              ● {displayedClinics.filter((c) => c.isOpenNow).length} {isBangla ? 'এখন খোলা' : 'open now'}
            </span>
          </div>

          {/* Clinic Cards List */}
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : displayedClinics.length === 0 ? (
            <div className="p-8 text-center my-auto">
              <EmptyState
                icon={<span className="text-3xl">🔍</span>}
                title={isBangla ? 'কোনো ক্লিনিক পাওয়া যায়নি' : 'No Clinics Found'}
                description={
                  isBangla
                    ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো পশু চিকিৎসালয় খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                    : 'No clinics match your current search and filter settings. Try relaxing filters.'
                }
              />
              <div className="mt-4 flex justify-center">
                <Button size="sm" variant="secondary" onClick={handleResetFilters}>
                  {isBangla ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 p-2 space-y-2">
              {displayedClinics.map((clinic) => {
                const isSelected = clinic.locationId === selectedClinicId;
                const name = (isBangla ? clinic.nameBn : clinic.nameEn) || clinic.nameEn;
                const address = (isBangla ? clinic.addressBn : clinic.addressEn) || clinic.addressEn;
                const distanceKm = (clinic.distanceM / 1000).toFixed(1);

                return (
                  <div
                    key={clinic.locationId}
                    onClick={() => setSelectedClinicId(clinic.locationId)}
                    className={`p-4 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500 shadow-xs'
                        : 'bg-white dark:bg-gray-800/80 border-gray-100 dark:border-gray-700/60 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-bold font-bangla text-gray-900 dark:text-gray-100">
                            {name}
                          </h3>
                          {clinic.isGovernment ? (
                            <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                              🏛️ {isBangla ? 'সরকারি' : 'Govt'}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
                              🏥 {isBangla ? 'বেসরকারি' : 'Private'}
                            </span>
                          )}
                          {clinic.is24h && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                              ২৪/৭
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bangla mt-1 truncate">
                          📍 {address}
                        </p>
                      </div>

                      {/* Distance Badge (MAP-2 core requirement) */}
                      <div className="text-right shrink-0">
                        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs font-bold px-2 py-0.5 rounded font-bangla">
                          {isBangla ? `${distanceKm} কিমি দূরে` : `${distanceKm} km`}
                        </span>
                        <div className="text-[11px] font-bangla mt-1">
                          {clinic.isOpenNow ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ● {isBangla ? 'এখন খোলা' : 'Open'}
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold">
                              ● {isBangla ? 'বন্ধ' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Consultation fee */}
                    <div className="flex items-center gap-3 text-xs font-bangla text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        ★ {clinic.ratingAvg.toFixed(1)} ({clinic.ratingCount})
                      </span>
                      <span>•</span>
                      <span className="text-green-700 dark:text-green-400 font-semibold">
                        {isBangla ? 'পরামর্শ ফি: ৳' : 'Fee: ৳'}
                        {clinic.feeFrom ?? 500}
                      </span>
                      {clinic.offersHomeVisit && (
                        <>
                          <span>•</span>
                          <span className="text-gray-500">
                            🏠 {isBangla ? 'হোম সার্ভিস' : 'Home visit'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Row: Call, Directions, Book, Detail (MAP-6 Integrated) */}
                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(clinic.phone);
                        }}
                        className="py-1 px-2 text-xs font-bangla flex items-center justify-center gap-1"
                      >
                        <span>📞</span>
                        <span className="hidden sm:inline">{isBangla ? 'কল' : 'Call'}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(clinic.lat, clinic.lng);
                        }}
                        className="py-1 px-2 text-xs font-bangla flex items-center justify-center gap-1"
                      >
                        <span>🗺️</span>
                        <span className="hidden sm:inline">{isBangla ? 'পথ' : 'Dir'}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(clinic.locationId);
                        }}
                        className="py-1 px-2 text-xs font-bangla flex items-center justify-center gap-1 bg-green-700 hover:bg-green-800 text-white font-bold"
                      >
                        <span>📅</span>
                        <span>{isBangla ? 'বুক' : 'Book'}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${locale}/clinics/${clinic.locationId}`);
                        }}
                        className="py-1 px-2 text-xs font-bangla flex items-center justify-center gap-1"
                      >
                        <span>🔍</span>
                        <span>{isBangla ? 'বিস্তারিত' : 'Detail'}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Panel: Interactive Map View with Markers (MAP-1b Core) */}
        <section
          className={`flex-1 relative bg-gray-100 dark:bg-gray-800 overflow-hidden ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Interactive Map Canvas (Visualizer) */}
          <div className="w-full h-full relative flex items-center justify-center bg-slate-900 overflow-hidden select-none">
            {/* Grid background representing map grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #2F7B53 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px, 96px 96px, 96px 96px',
              }}
            />

            {/* Radar / Distance rings centered at User */}
            <div className="absolute w-[400px] h-[400px] rounded-full border border-green-500/20 pointer-events-none" />
            <div className="absolute w-[600px] h-[600px] rounded-full border border-green-500/10 pointer-events-none" />
            <div className="absolute w-[800px] h-[800px] rounded-full border border-green-500/5 pointer-events-none" />

            {/* User GPS Pin Center */}
            <div className="absolute z-10 flex flex-col items-center pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-ping opacity-75" />
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md absolute" />
              <span className="mt-5 text-[11px] font-bold text-blue-300 bg-black/60 px-2 py-0.5 rounded shadow backdrop-blur-xs font-bangla">
                {isBangla ? 'আমার অবস্থান' : 'You are here'}
              </span>
            </div>

            {/* Interactive Clustered Map Markers (MAP-9) */}
            {mapClusters.map((cluster) => {
              const dx = (cluster.lng - userCoords.lng) * 4000;
              const dy = (userCoords.lat - cluster.lat) * 4000;

              if (cluster.isCluster) {
                return (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      if (cluster.items[0]?.locationId) {
                        setSelectedClinicId(cluster.items[0].locationId);
                      }
                    }}
                    style={{ transform: `translate(${dx}px, ${dy}px)` }}
                    className="absolute z-25 cursor-pointer group hover:scale-110 transition-transform duration-200"
                  >
                    <div className="w-11 h-11 rounded-full bg-emerald-700 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-sm ring-4 ring-emerald-500/30 animate-pulse">
                      <span>+{cluster.count}</span>
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bangla font-semibold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{cluster.count} {isBangla ? 'টি ক্লিনিক ক্লাস্টার' : 'clinics cluster'}</span>
                    </div>
                  </div>
                );
              }

              const c = cluster.items[0];
              if (!c) return null;
              const isSelected = c.locationId === selectedClinicId;

              return (
                <div
                  key={c.locationId}
                  onClick={() => setSelectedClinicId(c.locationId)}
                  style={{
                    transform: `translate(${dx}px, ${dy}px)`,
                  }}
                  className={`absolute z-20 cursor-pointer group transition-all duration-300 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  {/* Pin Icon with Service Layer Badge (MAP-10) */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg border-2 ${
                      c.hasEmergency
                        ? 'bg-red-600 border-white animate-pulse'
                        : c.isGovernment
                          ? 'bg-blue-600 border-white'
                          : activeLayer === 'grooming'
                            ? 'bg-purple-600 border-white'
                            : activeLayer === 'boarding'
                              ? 'bg-amber-600 border-white'
                              : 'bg-green-700 border-white'
                    }`}
                  >
                    <span className="text-sm">
                      {c.hasEmergency
                        ? '🚨'
                        : c.isGovernment
                          ? '🏛️'
                          : activeLayer === 'grooming'
                            ? '✂️'
                            : activeLayer === 'boarding'
                              ? '🏨'
                              : '🏥'}
                    </span>
                  </div>

                  {/* Marker Tooltip / Label */}
                  <div
                    className={`absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-bangla shadow-md transition-opacity pointer-events-none ${
                      isSelected
                        ? 'bg-gray-900 text-white font-bold opacity-100 ring-2 ring-green-400'
                        : 'bg-black/70 text-gray-200 opacity-90 group-hover:opacity-100'
                    }`}
                  >
                    <span>{isBangla ? c.nameBn ?? c.nameEn : c.nameEn}</span>
                    <span className="text-[10px] text-green-300 ml-1">
                      ({(c.distanceM / 1000).toFixed(1)} km)
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Map Controls (Re-center GPS & Zoom) */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
              <button
                onClick={handleRecenter}
                title={isBangla ? 'আমার অবস্থানে ফিরে যান' : 'Re-center GPS'}
                className="w-11 h-11 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition"
              >
                🎯
              </button>
            </div>

            {/* Selected Clinic Preview Card Overlay (on Map) */}
            {selectedClinic && (
              <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 z-30 animate-fade-in">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold font-bangla text-gray-900 dark:text-gray-100 truncate">
                    {isBangla ? selectedClinic.nameBn ?? selectedClinic.nameEn : selectedClinic.nameEn}
                  </h4>
                  <span className="text-xs bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded font-bangla shrink-0">
                    {(selectedClinic.distanceM / 1000).toFixed(1)} km
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-bangla truncate mb-3">
                  📍 {isBangla ? selectedClinic.addressBn : selectedClinic.addressEn}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCall(selectedClinic.phone)}
                    className="py-1 text-xs font-bangla"
                  >
                    📞 {isBangla ? 'কল' : 'Call'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDirections(selectedClinic.lat, selectedClinic.lng)}
                    className="py-1 text-xs font-bangla"
                  >
                    🗺️ {isBangla ? 'পথ' : 'Dir'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => router.push(`/${locale}/clinics/${selectedClinic.locationId}`)}
                    className="py-1 text-xs font-bangla bg-green-700 hover:bg-green-800 text-white"
                  >
                    🔍 {isBangla ? 'বিস্তারিত' : 'Detail'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Advanced Filter Modal (MAP-3) */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl font-bangla max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>⚙️</span>
                <span>{isBangla ? 'উন্নত ফিল্টার' : 'Advanced Filters'}</span>
              </h2>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              {/* Ownership */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {isBangla ? 'ক্লিনিকের ধরন' : 'Ownership & Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: isBangla ? 'সকল' : 'All' },
                    { id: 'govt', label: isBangla ? '🏛️ সরকারি' : '🏛️ Govt' },
                    { id: 'private', label: isBangla ? '🏥 বেসরকারি' : '🏥 Private' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFilterGovt(opt.id as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        filterGovt === opt.id
                          ? 'bg-green-50 border-green-600 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operating Features */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {isBangla ? 'সেবা ও সময়' : 'Operating Facilities'}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterOpenNow}
                      onChange={(e) => setFilterOpenNow(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {isBangla ? 'এখন খোলা (Open Now)' : 'Open Now'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter24h}
                      onChange={(e) => setFilter24h(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {isBangla ? 'সার্বক্ষণিক ২৪/৭ খোলা' : '24/7 Always Open'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterEmergency}
                      onChange={(e) => setFilterEmergency(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      🚨 {isBangla ? 'জরুরি সেবা উপলব্ধ' : 'Emergency Facilities'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterHomeVisit}
                      onChange={(e) => setFilterHomeVisit(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      🏠 {isBangla ? 'বাসায় ডাক্তার সেবা (Home Visit)' : 'Home Vet Visit Available'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Consultation Fee Slider / Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {isBangla ? 'পরামর্শ ফি সীমা (টাকা)' : 'Max Consultation Fee (BDT)'}
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { val: null, label: isBangla ? 'যেকোনো' : 'Any' },
                    { val: 100, label: '≤ ৳১০০' },
                    { val: 500, label: '≤ ৳৫০০' },
                    { val: 1000, label: '≤ ৳১০০০' },
                  ].map((fee) => (
                    <button
                      key={fee.label}
                      onClick={() => setMaxFee(fee.val)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        maxFee === fee.val
                          ? 'bg-green-50 border-green-600 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {fee.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Species Treated */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {isBangla ? 'চিকিৎসা করা প্রজাতি' : 'Species Treated'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: isBangla ? 'সকল' : 'All' },
                    { id: 'dog', label: isBangla ? '🐕 কুকুর' : '🐕 Dog' },
                    { id: 'cat', label: isBangla ? '🐈 বিড়াল' : '🐈 Cat' },
                    { id: 'bird', label: isBangla ? '🦜 পাখি' : '🦜 Bird' },
                    { id: 'rabbit', label: isBangla ? '🐇 খরগোশ' : '🐇 Rabbit' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSpecies(s.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedSpecies === s.id
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                ✕ {isBangla ? 'সব মুছুন' : 'Reset All'}
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setFilterModalOpen(false)}
                className="px-6 font-bangla"
              >
                {isBangla ? 'ফিল্টার প্রয়োগ করুন' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Cascading Area Picker Modal (MAP-4) */}
      {areaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold font-bangla text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>📍</span>
                <span>{isBangla ? 'বিভাগ, জেলা ও এলাকা নির্বাচন করুন' : 'Select Division, District & Area'}</span>
              </h3>
              <button
                onClick={() => setAreaModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 font-bangla">
              {isBangla
                ? 'আপনার কাঙ্ক্ষিত এলাকা বেছে নিলে ম্যাপটি স্বয়ংক্রিয়ভাবে সেখানে স্থানান্তরিত হবে।'
                : 'Selecting an area will automatically center the map and show nearby clinics there.'}
            </p>

            <div className="space-y-4">
              {/* Step 1: Division */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-1.5">
                  ১. {isBangla ? 'বিভাগ বেছে নিন' : 'Select Division'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableDivisions.map((div) => (
                    <button
                      key={div.id}
                      onClick={() => {
                        setSelectedDivisionId(div.id);
                        const districts = getDistrictsByDivision(div.id);
                        const firstDistrict = districts[0];
                        if (firstDistrict) {
                          setSelectedDistrictId(firstDistrict.id);
                          const upazilas = getUpazilasByDistrict(firstDistrict.id);
                          const firstUpazila = upazilas[0];
                          if (firstUpazila) setSelectedUpazilaId(firstUpazila.id);
                        }
                      }}
                      className={`p-2 rounded-lg text-xs font-bangla text-center border transition cursor-pointer ${
                        selectedDivisionId === div.id
                          ? 'bg-green-700 text-white border-green-700 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isBangla ? div.nameBn : div.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: District */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-1.5">
                  ২. {isBangla ? 'জেলা বেছে নিন' : 'Select District'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1 border border-gray-100 dark:border-gray-700 rounded-lg">
                  {availableDistricts.map((dist) => (
                    <button
                      key={dist.id}
                      onClick={() => {
                        setSelectedDistrictId(dist.id);
                        const upazilas = getUpazilasByDistrict(dist.id);
                        const firstUpazila = upazilas[0];
                        if (firstUpazila) setSelectedUpazilaId(firstUpazila.id);
                      }}
                      className={`p-1.5 rounded-md text-xs font-bangla text-center border transition cursor-pointer ${
                        selectedDistrictId === dist.id
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isBangla ? dist.nameBn : dist.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Upazila / Thana */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 font-bangla mb-1.5">
                  ৩. {isBangla ? 'উপজেলা বা থানা বেছে নিন' : 'Select Upazila / Thana'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-1 border border-gray-100 dark:border-gray-700 rounded-lg">
                  {availableUpazilas.length > 0 ? (
                    availableUpazilas.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUpazilaId(u.id)}
                        className={`p-2 rounded-md text-xs font-bangla text-left border transition flex items-center justify-between cursor-pointer ${
                          selectedUpazilaId === u.id
                            ? 'bg-green-50 border-green-600 text-green-900 dark:bg-green-900/40 dark:text-green-200 font-bold'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span>{isBangla ? u.nameBn : u.nameEn}</span>
                        {selectedUpazilaId === u.id && <span className="text-green-600">✓</span>}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full py-4 text-center text-xs text-gray-400 font-bangla">
                      {isBangla ? 'কোনো নির্দিষ্ট থানা পাওয়া যায়নি, জেলা সদর প্রযোজ্য' : 'District Sadar applies'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAreaModalOpen(false)}>
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmAreaPicker} className="px-6 font-bangla">
                ✓ {isBangla ? 'অবস্থান নিশ্চিত করুন' : 'Confirm Location'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
