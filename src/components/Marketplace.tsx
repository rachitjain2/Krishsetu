import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Award,
  ArrowUpDown,
  SlidersHorizontal,
  Store,
  ChevronRight,
  ShieldCheck,
  Wheat,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  Eye,
  IndianRupee,
  Layers
} from 'lucide-react';
import { CropListing, UserProfile } from '../types';
import { CropDetails } from './CropDetails';
import { QualityScoreBadge } from './QualityScoreBadge';
import { QualityScoreBreakdownModal } from './QualityScoreBreakdownModal';
import { getCropQualityScore } from '../utils/qualityScorer';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS } from '../data/marketplaceData';

interface MarketplaceProps {
  currentUser: UserProfile | null;
  cropListings: CropListing[];
  onMakeOffer?: (cropId: string, offeredPrice: number, quantity: number, notes: string) => void;
  onPlaceOrder?: (cropId: string, quantity: number, deliveryAddress: string) => void;
  selectedCropIdInitial?: string | null;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  currentUser,
  cropListings,
  onMakeOffer,
  onPlaceOrder,
  selectedCropIdInitial = null,
}) => {
  // Selected crop for Crop Details view
  const [selectedCropId, setSelectedCropId] = useState<string | null>(selectedCropIdInitial);

  // Inspected crop for Quality-Verified Batch Score Modal
  const [inspectingCrop, setInspectingCrop] = useState<CropListing | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedAvailability, setSelectedAvailability] = useState<'All' | 'Active' | 'Under Offer'>('All');
  const [selectedQualityGrade, setSelectedQualityGrade] = useState<'All' | 'Grade A (85+)' | 'Grade B (70-84)' | 'Grade C-D (<70)'>('All');
  
  // Price filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Sorting state: 'price-asc' | 'price-desc' | 'distance' | 'newest' | 'quality-desc'
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'distance' | 'newest' | 'quality-desc'>('newest');

  // Mobile filters panel toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Toast message for actions
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSelectedAvailability('All');
    setSelectedQualityGrade('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  // Filter and sort the crop listings
  const filteredCrops = useMemo(() => {
    return cropListings.filter((crop) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = crop.cropName.toLowerCase().includes(q);
        const matchesHindi = crop.hindiName?.toLowerCase().includes(q) || false;
        const matchesVariety = crop.variety?.toLowerCase().includes(q) || false;
        const matchesFarmer = crop.farmerName?.toLowerCase().includes(q) || false;
        const matchesLoc = crop.location.toLowerCase().includes(q);
        const matchesId = crop.id.toLowerCase().includes(q);
        if (!matchesName && !matchesHindi && !matchesVariety && !matchesFarmer && !matchesLoc && !matchesId) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'All Categories' && crop.category !== selectedCategory) {
        return false;
      }

      // 3. Location Filter
      if (selectedLocation !== 'All Locations') {
        const locName = selectedLocation.split(',')[0].trim().toLowerCase();
        if (!crop.location.toLowerCase().includes(locName)) {
          return false;
        }
      }

      // 4. Availability Filter
      if (selectedAvailability !== 'All') {
        if (crop.status !== selectedAvailability) {
          return false;
        }
      }

      // 5. Price Range Filter
      const minP = parseFloat(minPrice);
      const maxP = parseFloat(maxPrice);
      if (!isNaN(minP) && crop.expectedPrice < minP) {
        return false;
      }
      if (!isNaN(maxP) && crop.expectedPrice > maxP) {
        return false;
      }

      // 6. Quality Grade Filter
      if (selectedQualityGrade !== 'All') {
        const qScore = getCropQualityScore(crop).final_score;
        if (selectedQualityGrade === 'Grade A (85+)' && qScore < 85) return false;
        if (selectedQualityGrade === 'Grade B (70-84)' && (qScore < 70 || qScore >= 85)) return false;
        if (selectedQualityGrade === 'Grade C-D (<70)' && qScore >= 70) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'quality-desc') {
        const scoreA = getCropQualityScore(a).final_score;
        const scoreB = getCropQualityScore(b).final_score;
        return scoreB - scoreA;
      }
      if (sortBy === 'price-asc') {
        return a.expectedPrice - b.expectedPrice;
      }
      if (sortBy === 'price-desc') {
        return b.expectedPrice - a.expectedPrice;
      }
      if (sortBy === 'distance') {
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      }
      // default: newest / priority
      return b.id.localeCompare(a.id);
    });
  }, [cropListings, searchQuery, selectedCategory, selectedLocation, selectedAvailability, selectedQualityGrade, minPrice, maxPrice, sortBy]);

  // If a crop is selected for viewing details, render the CropDetails component
  const selectedCrop = useMemo(() => {
    return cropListings.find((c) => c.id === selectedCropId) || null;
  }, [cropListings, selectedCropId]);

  if (selectedCrop) {
    return (
      <CropDetails
        crop={selectedCrop}
        currentUser={currentUser}
        onBack={() => setSelectedCropId(null)}
        onMakeOffer={(cropId, offeredPrice, quantity, notes) => {
          if (onMakeOffer) {
            onMakeOffer(cropId, offeredPrice, quantity, notes);
          }
          showToast(`Offer of ₹${offeredPrice} / Qtl submitted successfully!`);
        }}
        onPlaceOrder={(cropId, quantity, deliveryAddress) => {
          if (onPlaceOrder) {
            onPlaceOrder(cropId, quantity, deliveryAddress);
          }
          showToast(`Order for ${quantity} units placed successfully with Escrow protection!`);
        }}
      />
    );
  }

  // Active filters count
  const activeFiltersCount =
    (selectedCategory !== 'All Categories' ? 1 : 0) +
    (selectedLocation !== 'All Locations' ? 1 : 0) +
    (selectedAvailability !== 'All' ? 1 : 0) +
    (selectedQualityGrade !== 'All' ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast message */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <p className="text-xs sm:text-sm font-black text-[#11281E]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] text-[10px] font-black uppercase tracking-widest mb-2 border border-[#1B4332]/20">
              <Store className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Direct Kisan Wholesale Exchange • सीधा किसान बाजार</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
              Browse Farmer Harvest Batches
            </h1>
            <p className="text-xs sm:text-sm text-[#4D6B53] font-bold mt-1 max-w-2xl">
              Source premium grains, pulses, oilseeds, and vegetables directly from verified farmers. Zero middlemen, complete quality inspection, and protected escrow checkout.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-[#F8FAF5] p-3.5 rounded-2xl border border-[#1B4332]/15 self-start md:self-auto">
            <div className="text-center px-3 border-r border-[#1B4332]/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">Batches</span>
              <span className="text-lg font-black text-[#1B4332]">{filteredCrops.length}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">Volume</span>
              <span className="text-lg font-black text-[#11281E]">
                {filteredCrops.reduce((acc, c) => acc + (c.quantity || 0), 0)} Qtl
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#4D6B53] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="marketplace-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop (wheat, mustard, chana), variety, farmer name, or location..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs sm:text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8FA396] hover:text-[#11281E]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[170px]">
                <ArrowUpDown className="w-4 h-4 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="marketplace-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-9 pr-8 py-3.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] appearance-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="quality-desc">⭐ Sort: Highest Quality Score</option>
                  <option value="price-asc">Sort: Price (Low to High)</option>
                  <option value="price-desc">Sort: Price (High to Low)</option>
                  <option value="distance">Sort: Distance (Nearest)</option>
                </select>
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden py-3.5 px-4 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-2xl border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>
            </div>
          </div>

          {/* Category Quick Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-2 px-3.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === category
                    ? 'bg-[#1B4332] text-[#E8D5B5] border-[#1B4332] shadow-xs'
                    : 'bg-[#F8FAF5] text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5] border-[#1B4332]/15'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Secondary Filters Strip (Location, Availability, Price Filter, Reset) */}
          <div
            className={`pt-3 border-t border-[#1B4332]/10 flex flex-wrap items-center justify-between gap-3 ${
              showMobileFilters ? 'block' : 'hidden sm:flex'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Location Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2D5A27]" />
                <select
                  id="marketplace-location-filter"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] cursor-pointer"
                >
                  {MARKETPLACE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">Availability:</span>
                <select
                  id="marketplace-availability-filter"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value as any)}
                  className="py-2 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">In Stock (Active)</option>
                  <option value="Under Offer">Under Negotiation</option>
                </select>
              </div>

              {/* Quality Grade Filter */}
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">Quality:</span>
                <select
                  id="marketplace-quality-filter"
                  value={selectedQualityGrade}
                  onChange={(e) => setSelectedQualityGrade(e.target.value as any)}
                  className="py-2 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] cursor-pointer"
                >
                  <option value="All">All Quality Grades</option>
                  <option value="Grade A (85+)">Grade A (85+ Score)</option>
                  <option value="Grade B (70-84)">Grade B (70-84 Score)</option>
                  <option value="Grade C-D (<70)">Grade C & D (&lt;70 Score)</option>
                </select>
              </div>

              {/* Price Filter (Min & Max Price) */}
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-[#8C6228]" />
                <div className="flex items-center gap-1">
                  <input
                    id="marketplace-min-price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ₹"
                    className="w-20 py-1.5 px-2.5 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  />
                  <span className="text-xs text-[#8FA396]">-</span>
                  <input
                    id="marketplace-max-price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ₹"
                    className="w-20 py-1.5 px-2.5 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="py-1.5 px-3 rounded-full text-xs font-black uppercase tracking-wider text-[#8C6228] hover:bg-[#FAF3E0] border border-[#E8D5B5] flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CROP CARDS GRID */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
            const unitSingular = crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl';
            const isSold = crop.status === 'Sold';
            const isUnderOffer = crop.status === 'Under Offer';
            const qScore = getCropQualityScore(crop);

            return (
              <div
                key={crop.id}
                id={`crop-card-${crop.id}`}
                className="bg-white rounded-[32px] border-2 border-[#1B4332]/15 hover:border-[#1B4332] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Crop Image & Badges */}
                  <div className="relative h-52 w-full bg-[#E8F0E5] overflow-hidden">
                    <img
                      src={crop.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'}
                      alt={crop.cropName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                    {/* Top status tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${
                          isSold
                            ? 'bg-gray-800 text-gray-200 border-gray-600'
                            : isUnderOffer
                            ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                            : 'bg-[#1B4332] text-white border-[#1B4332]'
                        }`}
                      >
                        {isSold ? 'Sold' : isUnderOffer ? '⚡ In Negotiation' : '● Available'}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/90 text-[#11281E] px-2 py-0.5 rounded-full">
                        {crop.category}
                      </span>
                    </div>

                    {/* LARGE CIRCULAR QUALITY SCORE BADGE IN TOP-RIGHT CORNER */}
                    <div className="absolute top-3 right-3 z-10">
                      <QualityScoreBadge
                        score={qScore.final_score}
                        grade={qScore.letter_grade}
                        size="md"
                        onClick={() => setInspectingCrop(crop)}
                      />
                    </div>

                    {/* Distance Tag */}
                    {crop.distanceKm !== undefined && (
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#11281E]/80 backdrop-blur-xs text-[#E8D5B5] px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#E8D5B5]" />
                          <span>~{crop.distanceKm} km</span>
                        </span>
                      </div>
                    )}

                    {/* Batch ID */}
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-md">
                        #{crop.id}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E] group-hover:text-[#1B4332] transition-colors">
                        {crop.cropName}
                      </h3>
                      {crop.variety && (
                        <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                          Variety: {crop.variety}
                        </p>
                      )}
                    </div>

                    {/* Pricing and Quantity Bar */}
                    <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                          Price per {unitSingular}
                        </span>
                        <span className="text-lg font-black text-[#1B4332]">
                          ₹{crop.expectedPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                          Available Stock
                        </span>
                        <span className="text-sm font-black text-[#11281E]">
                          {crop.quantity} {crop.unit || 'Quintals'}
                        </span>
                      </div>
                    </div>

                    {/* Card Meta Details (Location, Quality, Harvest Date, Farmer Name) */}
                    <div className="space-y-1.5 text-xs">
                      {/* Farmer Name */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Farmer:</span>
                        </span>
                        <span className="text-[#11281E] font-black">
                          {crop.farmerName || 'Ramesh Patel'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Location:</span>
                        </span>
                        <span className="text-[#11281E] truncate max-w-[160px]">
                          {crop.location}
                        </span>
                      </div>

                      {/* Quality Score Breakdown Trigger Row */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Batch Score:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setInspectingCrop(crop)}
                          className="text-[#1B4332] hover:text-[#2D5A27] font-black text-[11px] bg-[#E8F0E5] hover:bg-[#d5e7d1] px-2.5 py-0.5 rounded-full border border-[#1B4332]/25 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Click to view full 4-component score breakdown"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{qScore.final_score}/100 • Grade {qScore.letter_grade}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Harvest Date */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#4D6B53]" />
                          <span>Harvest Date:</span>
                        </span>
                        <span className="text-[#11281E]">
                          {crop.harvestDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-inspect-score-${crop.id}`}
                      onClick={() => setInspectingCrop(crop)}
                      className="flex-1 py-2.5 px-3 rounded-full bg-[#FAF3E0] hover:bg-[#f3ebd3] text-[#8C6228] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#E8D5B5] shadow-2xs transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#8C6228]" />
                      <span>Inspect Score</span>
                    </button>
                    <button
                      id={`btn-view-details-${crop.id}`}
                      onClick={() => setSelectedCropId(crop.id)}
                      className="flex-1 py-2.5 px-3 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-[#1B4332] shadow-xs group/btn transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#E8D5B5]" />
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#E8D5B5] group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-12 rounded-[32px] border-2 border-[#1B4332]/15 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F8FAF5] border-2 border-[#1B4332]/20 flex items-center justify-center mx-auto text-[#4D6B53]">
            <Wheat className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
            No Crops Found Matching Your Filters
          </h3>
          <p className="text-xs sm:text-sm text-[#4D6B53] font-bold max-w-md mx-auto">
            Try adjusting your search query, selecting different crop categories, or widening the price range.
          </p>
          <button
            onClick={handleResetFilters}
            className="py-2.5 px-6 rounded-full bg-[#1B4332] text-[#E8D5B5] hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Quality Score Breakdown Modal */}
      <QualityScoreBreakdownModal
        isOpen={!!inspectingCrop}
        onClose={() => setInspectingCrop(null)}
        crop={inspectingCrop}
        onMakeOffer={(cropId) => {
          setSelectedCropId(cropId);
        }}
        onPlaceOrder={(cropId) => {
          setSelectedCropId(cropId);
        }}
      />
    </div>
  );
};
