'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@pranora/i18n';
import { Button, Card, Chip, SearchBar, EmptyState } from '@pranora/ui';
import {
  getServiceBySlug,
  getProvidersByServiceSlug,
  type ProviderServiceOffering,
  buildBookingUrl,
  buildDirectionsUrl,
  buildTelUrl,
  getDivisions,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUpazilaById,
} from '@pranora/api';

const DEFAULT_DHAKA_COORDS = { lat: 23.7465, lng: 90.3752 };

export default function ServiceProvidersPage() {
  const params = useParams();
  const router = useRouter();
  const { isBangla, locale } = useLocale();

  const slug = (params?.slug as string) || 'clinic_visit';
  const service = useMemo(() => getServiceBySlug(slug), [slug]);

  // Location & Filter state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_DHAKA_COORDS);
  const [locationName, setLocationName] = useState<string>('ধানমন্ডি, ঢাকা');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterGovt, setFilterGovt] = useState<'all' | 'govt' | 'private'>('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected clinic for map preview
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Area Picker state
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState(3);
  const [selectedDistrictId, setSelectedDistrictId] = useState(18);
  const [selectedUpazilaId, setSelectedUpazilaId] = useState(1801);

  // Geolocation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName(isBangla ? 'আমার বর্তমান অবস্থান' : 'My Current Location');
        },
        () => {},
        { timeout: 6000 }
      );
    }
  }, [isBangla]);

  // Fetch Providers
  const providers = useMemo(() => {
    return getProvidersByServiceSlug(slug, {
      lat: userCoords.lat,
      lng: userCoords.lng,
      openNow: filterOpenNow,
      govt: filterGovt,
      maxPrice: maxPrice ?? undefined,
    });
  }, [slug, userCoords, filterOpenNow, filterGovt, maxPrice]);

  // Filtered by Search Query
  const displayedProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.clinicNameBn.toLowerCase().includes(q) ||
        p.clinicNameEn.toLowerCase().includes(q) ||
        p.addressBn.toLowerCase().includes(q) ||
        p.addressEn.toLowerCase().includes(q)
    );
  }, [providers, searchQuery]);

  const selectedProvider = useMemo(() => {
    return displayedProviders.find((p) => p.locationId === selectedLocationId) || displayedProviders[0];
  }, [displayedProviders, selectedLocationId]);

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

  const handleBook = (p: ProviderServiceOffering) => {
    const url = buildBookingUrl({
      locationId: p.locationId,
      serviceId: p.serviceId,
      bookingType: 'slot',
    });
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-content-primary">
      {/* Top Banner & Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <button
              onClick={() => router.push(`/${locale}/services`)}
              className="hover:underline flex items-center gap-1 font-bangla"
            >
              <span>←</span>
              <span>{isBangla ? 'সকল সেবা' : 'All Services'}</span>
            </button>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold font-bangla">
              {isBangla ? service?.nameBn : service?.nameEn}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3 bg-green-50 dark:bg-green-950/40 rounded-2xl border border-green-200 select-none">
                {service?.icon || '🩺'}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold font-bangla text-gray-900 dark:text-gray-100">
                    {isBangla ? service?.nameBn : service?.nameEn}
                  </h1>
                  <span className="text-xs bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold font-bangla">
                    {isBangla ? service?.priceRangeBn : service?.priceRangeEn}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bangla max-w-2xl">
                  {isBangla ? service?.descriptionBn : service?.descriptionEn}
                </p>
              </div>
            </div>

            {/* List / Map Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl self-start md:self-auto shrink-0 shadow-inner">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-xs font-bangla font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>📋</span>
                <span>{isBangla ? 'তালিকা ভিউ' : 'List View'}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-xs font-bangla font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>🗺️</span>
                <span>{isBangla ? 'ম্যাপ ভিউ' : 'Map View'}</span>
              </button>
            </div>
          </div>

          {/* 3 Steps Guide Accordion/Pills */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(isBangla ? service?.howItWorksBn : service?.howItWorksEn)?.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 font-bangla bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <span className="w-5 h-5 rounded-full bg-green-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs border-b border-gray-200 dark:border-gray-700 py-3 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Location Chip */}
          <button
            onClick={() => setAreaModalOpen(true)}
            className="px-3 py-1.5 rounded-full border border-green-300 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-200 flex items-center gap-1.5 font-bangla font-semibold text-xs transition hover:bg-green-100 shadow-xs cursor-pointer"
          >
            <span>🎯</span>
            <span>{locationName}</span>
            <span className="text-[10px] bg-green-200 dark:bg-green-800 px-1.5 py-0.5 rounded-md">
              {isBangla ? 'পরিবর্তন' : 'Change'}
            </span>
          </button>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'ক্লিনিকের নাম বা ঠিকানা...' : 'Clinic name or address...'}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <Chip
              label={isBangla ? 'এখন খোলা' : 'Open Now'}
              isSelected={filterOpenNow}
              onSelect={() => setFilterOpenNow((p) => !p)}
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
            <Chip
              label={maxPrice ? (isBangla ? `ফি ≤ ৳${maxPrice}` : `Max ৳${maxPrice}`) : (isBangla ? 'ফি: যেকোনো' : 'Fee: Any')}
              isSelected={maxPrice !== null}
              onSelect={() => setMaxPrice((p) => (p ? null : 600))}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {displayedProviders.length === 0 ? (
          <EmptyState
            icon={<span className="text-2xl">🏥</span>}
            title={isBangla ? 'কোনো ক্লিনিক পাওয়া যায়নি' : 'No Clinics Found'}
            description={
              isBangla
                ? 'আপনার নির্বাচিত ফিল্টার বা এলাকার জন্য কোনো ক্লিনিক এই মুহূর্তে এই সেবাটি দিচ্ছে না।'
                : 'No clinics offering this service match your current location or filter criteria.'
            }
          />
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProviders.map((p) => {
              const distanceKm = (p.distanceM / 1000).toFixed(1);
              return (
                <Card
                  key={p.locationId}
                  className="p-5 flex flex-col justify-between border hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div>
                    {/* Header: Verified / Govt Badge & Rating */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-base font-bangla text-gray-900 dark:text-gray-100">
                          {isBangla ? p.clinicNameBn : p.clinicNameEn}
                        </span>
                        {p.isGovernment ? (
                          <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bangla font-semibold">
                            🏛️ {isBangla ? 'সরকারি' : 'Govt'}
                          </span>
                        ) : (
                          <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bangla font-semibold">
                            ✓ {isBangla ? 'যাচাইকৃত' : 'Verified'}
                          </span>
                        )}
                        {p.isOpenNow ? (
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bangla font-medium">
                            ● {isBangla ? 'খোলা' : 'Open'}
                          </span>
                        ) : (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bangla">
                            {isBangla ? 'বন্ধ' : 'Closed'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                        <span>★</span>
                        <span>{p.ratingAvg.toFixed(1)}</span>
                        <span className="text-gray-400 font-normal">({p.ratingCount})</span>
                      </div>
                    </div>

                    {/* Address & Distance */}
                    <p className="text-xs text-gray-500 font-bangla mb-3">
                      📍 {isBangla ? p.addressBn : p.addressEn} •{' '}
                      <span className="font-bold text-green-700 dark:text-green-400">
                        {distanceKm} {isBangla ? 'কিমি দূরে' : 'km away'}
                      </span>
                    </p>

                    {/* Service Price Box */}
                    <div className="bg-green-50/60 dark:bg-green-950/30 p-3 rounded-xl border border-green-100 dark:border-green-800 flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 font-bangla">
                          {isBangla ? p.serviceNameBn : p.serviceNameEn}
                        </div>
                        <div className="text-[11px] text-gray-500 font-bangla">
                          ⏱️ {isBangla ? `${p.durationMinutes} মিনিট` : `${p.durationMinutes} mins`} •{' '}
                          👨‍⚕️ {isBangla ? `${p.vetsCount} জন ডাক্তার` : `${p.vetsCount} Doctor(s)`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-800 dark:text-green-300 font-bangla">
                          ৳{p.price}
                        </div>
                        {p.isGovernment && (
                          <div className="text-[10px] text-blue-600 font-bangla">
                            {isBangla ? 'সরকারি ভর্তুকি' : 'Govt Subsidized'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBook(p)}
                      className="flex-1 font-bangla font-bold"
                    >
                      📅 {isBangla ? 'বুক করুন' : 'Book Now'}
                    </Button>
                    <button
                      onClick={() => window.open(buildDirectionsUrl(p.lat, p.lng), '_blank')}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 dark:text-gray-300 text-xs font-bangla flex items-center gap-1 cursor-pointer"
                      title={isBangla ? 'পথ দেখুন' : 'Directions'}
                    >
                      <span>🗺️</span>
                      <span className="hidden sm:inline">{isBangla ? 'পথ' : 'Map'}</span>
                    </button>
                    <button
                      onClick={() => (window.location.href = buildTelUrl(p.phone))}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 dark:text-gray-300 text-xs font-bangla flex items-center gap-1 cursor-pointer"
                      title={isBangla ? 'কল করুন' : 'Call'}
                    >
                      <span>📞</span>
                      <span className="hidden sm:inline">{isBangla ? 'কল' : 'Call'}</span>
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/clinics/${p.locationId}`)}
                      className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 dark:text-gray-300 text-xs font-bangla cursor-pointer"
                    >
                      {isBangla ? 'বিস্তারিত' : 'Detail'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Map View (Radar Interactive Display) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Interactive Radar Canvas */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-2xl min-h-[500px] flex items-center justify-center">
              {/* Radar Grid Circles */}
              <div className="absolute w-[450px] h-[450px] rounded-full border border-green-500/15" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-green-500/25" />
              <div className="absolute w-[180px] h-[180px] rounded-full border border-green-500/40" />

              {/* User Center Pin */}
              <div className="z-10 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl animate-pulse" />
                <span className="text-[11px] font-bold text-blue-200 bg-black/70 px-2 py-0.5 rounded-full mt-1.5">
                  {isBangla ? 'আপনার অবস্থান' : 'You'}
                </span>
              </div>

              {/* Provider Pins on Map */}
              {displayedProviders.map((p) => {
                const dx = (p.lng - userCoords.lng) * 2800;
                const dy = (userCoords.lat - p.lat) * 2800;
                const isSelected = p.locationId === selectedProvider?.locationId;

                return (
                  <button
                    key={p.locationId}
                    onClick={() => setSelectedLocationId(p.locationId)}
                    style={{
                      transform: `translate(${dx}px, ${dy}px)`,
                    }}
                    className={`absolute z-20 flex flex-col items-center group transition cursor-pointer ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`px-2 py-1 rounded-full text-white font-bold text-[11px] shadow-lg flex items-center gap-1 border-2 border-white ${
                        p.isGovernment ? 'bg-blue-600' : 'bg-green-700'
                      }`}
                    >
                      <span>৳{p.price}</span>
                    </div>
                    <span className="text-[10px] text-gray-200 bg-black/70 px-1.5 py-0.5 rounded font-bangla mt-1 max-w-[120px] truncate">
                      {isBangla ? p.clinicNameBn : p.clinicNameEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Selected Provider Floating Card */}
            {selectedProvider && (
              <Card className="p-5 border border-green-200 dark:border-green-800 shadow-xl bg-white dark:bg-gray-800 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold font-bangla">
                      {selectedProvider.isGovernment ? '🏛️ সরকারি হাসপাতাল' : '✓ যাচাইকৃত ক্লিনিক'}
                    </span>
                    <span className="text-xs text-amber-600 font-bold">
                      ★ {selectedProvider.ratingAvg.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-bangla text-gray-900 dark:text-gray-100">
                    {isBangla ? selectedProvider.clinicNameBn : selectedProvider.clinicNameEn}
                  </h3>
                  <p className="text-xs text-gray-500 font-bangla mt-1">
                    📍 {isBangla ? selectedProvider.addressBn : selectedProvider.addressEn}
                  </p>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400 font-bangla mt-1">
                    {(selectedProvider.distanceM / 1000).toFixed(1)} {isBangla ? 'কিমি দূরে' : 'km away'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 font-bangla">
                      {isBangla ? selectedProvider.serviceNameBn : selectedProvider.serviceNameEn}
                    </div>
                    <div className="text-[11px] text-gray-500 font-bangla">
                      {selectedProvider.durationMinutes} {isBangla ? 'মিনিট' : 'mins'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-800 dark:text-green-300 font-bangla">
                      ৳{selectedProvider.price}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleBook(selectedProvider)}
                  className="w-full font-bangla font-bold py-3 text-sm shadow-md"
                >
                  📅 {isBangla ? 'সরাসরি বুক করুন' : 'Book Appointment'}
                </Button>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => window.open(buildDirectionsUrl(selectedProvider.lat, selectedProvider.lng), '_blank')}
                    className="p-2 border rounded-lg text-xs font-bangla font-semibold text-center hover:bg-gray-50 cursor-pointer"
                  >
                    🗺️ {isBangla ? 'দিকনির্দেশনা' : 'Directions'}
                  </button>
                  <button
                    onClick={() => (window.location.href = buildTelUrl(selectedProvider.phone))}
                    className="p-2 border rounded-lg text-xs font-bangla font-semibold text-center hover:bg-gray-50 cursor-pointer"
                  >
                    📞 {isBangla ? 'কল করুন' : 'Call'}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Cascading Area Picker Modal */}
      {areaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold font-bangla text-gray-900">
                📍 {isBangla ? 'এলাকা নির্বাচন করুন' : 'Select Location'}
              </h3>
              <button onClick={() => setAreaModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">১. বিভাগ</label>
                <div className="grid grid-cols-4 gap-1">
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
                      className={`p-1.5 rounded-lg text-xs font-bangla border ${
                        selectedDivisionId === div.id ? 'bg-green-700 text-white font-bold' : 'bg-gray-50'
                      }`}
                    >
                      {isBangla ? div.nameBn : div.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">২. জেলা</label>
                <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1 border rounded-lg">
                  {availableDistricts.map((dist) => (
                    <button
                      key={dist.id}
                      onClick={() => {
                        setSelectedDistrictId(dist.id);
                        const upazilas = getUpazilasByDistrict(dist.id);
                        const firstUpazila = upazilas[0];
                        if (firstUpazila) setSelectedUpazilaId(firstUpazila.id);
                      }}
                      className={`p-1.5 rounded-md text-xs font-bangla border ${
                        selectedDistrictId === dist.id ? 'bg-blue-600 text-white font-bold' : 'bg-gray-50'
                      }`}
                    >
                      {isBangla ? dist.nameBn : dist.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">৩. উপজেলা/থানা</label>
                <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto p-1 border rounded-lg">
                  {availableUpazilas.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUpazilaId(u.id)}
                      className={`p-1.5 rounded-md text-xs font-bangla border text-left ${
                        selectedUpazilaId === u.id ? 'bg-green-100 border-green-600 font-bold' : 'bg-gray-50'
                      }`}
                    >
                      {isBangla ? u.nameBn : u.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAreaModalOpen(false)}>
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmAreaPicker}>
                ✓ {isBangla ? 'নিশ্চিত করুন' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
