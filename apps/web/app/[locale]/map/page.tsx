'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, SearchBar, EmptyState } from '@pranora/ui';
import {
  getNearbyClinicsWithFallback,
  type NearbyClinicResult,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
} from '@pranora/api';

const DEFAULT_DHAKA_COORDS = { lat: 23.7465, lng: 90.3752 }; // Dhanmondi

export default function WebMapPage() {
  const router = useRouter();
  const { isBangla } = useLocale();

  // Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_DHAKA_COORDS);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [locationName, setLocationName] = useState<string>('ধানমন্ডি, ঢাকা');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filter24h, setFilter24h] = useState<boolean>(false);
  const [filterEmergency, setFilterEmergency] = useState<boolean>(false);
  const [filterHomeVisit, setFilterHomeVisit] = useState<boolean>(false);
  const [filterGovt, setFilterGovt] = useState<'all' | 'govt' | 'private'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat' | 'bird' | 'rabbit'>('all');

  // View state
  const [mobileView, setMobileView] = useState<'split' | 'map' | 'list'>('split');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<NearbyClinicResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      try {
        const results = await getNearbyClinicsWithFallback({
          lat: userCoords.lat,
          lng: userCoords.lng,
          radiusM: 20000,
          openNow: filterOpenNow,
          emergency: filterEmergency,
          homeVisit: filterHomeVisit,
          species: selectedSpecies !== 'all' ? selectedSpecies : undefined,
          limit: 50,
        });

        if (active) {
          setClinics(results);
          if (results.length > 0 && !selectedClinicId) {
            setSelectedClinicId(results[0]?.locationId ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load nearby clinics:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchClinics();
    return () => {
      active = false;
    };
  }, [userCoords, filterOpenNow, filterEmergency, filterHomeVisit, selectedSpecies]);

  // Client-side search and ownership filter
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

      return true;
    });
  }, [clinics, searchQuery, filter24h, filterGovt, isBangla]);

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
    router.push(buildBookingUrl({ locationId }));
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
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bangla flex items-center gap-1 mt-0.5">
                <span>🎯</span>
                <span>{locationName}</span>
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

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'ক্লিনিকের নাম বা এলাকা খুঁজুন...' : 'Search clinic or area...'}
              onClear={() => setSearchQuery('')}
            />
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

        {/* Filter Chips Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
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
        </div>
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
                          router.push(`/clinics/${clinic.locationId}`);
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

            {/* Interactive Clinic Map Markers */}
            {displayedClinics.map((c, idx) => {
              // Projected relative positions based on Dhaka coordinates offset
              const dx = (c.lng - userCoords.lng) * 4000;
              const dy = (userCoords.lat - c.lat) * 4000;
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
                  {/* Pin Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg border-2 ${
                      c.hasEmergency
                        ? 'bg-red-600 border-white animate-pulse'
                        : c.isGovernment
                          ? 'bg-blue-600 border-white'
                          : 'bg-green-700 border-white'
                    }`}
                  >
                    <span className="text-sm">
                      {c.hasEmergency ? '🚨' : c.isGovernment ? '🏛️' : '🏥'}
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
                    onClick={() => router.push(`/clinics/${selectedClinic.locationId}`)}
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
    </div>
  );
}
