import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MapPin,
  Calendar,
  Layers,
  Flame,
  Wheat,
  AlertTriangle,
  Info,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  BarChart3,
  ArrowUpDown,
  Sparkles,
  Download,
  Bell
} from 'lucide-react';
import { MarketCropData, DateRangeOption, UserProfile } from '../types';
import { DEMO_MARKET_INTELLIGENCE_DATA } from '../data/marketIntelligenceData';
import { MarketPriceCard } from './market/MarketPriceCard';
import { PriceTrendChart } from './market/PriceTrendChart';
import { DemandTrendChart } from './market/DemandTrendChart';
import { CropComparisonChart } from './market/CropComparisonChart';

interface MarketIntelligenceProps {
  currentUser?: UserProfile | null;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ currentUser }) => {
  // Master state
  const [crops] = useState<MarketCropData[]>(DEMO_MARKET_INTELLIGENCE_DATA);
  const [selectedCropId, setSelectedCropId] = useState<string>(DEMO_MARKET_INTELLIGENCE_DATA[0].id);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('30d');
  
  // Filter States
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'price' | 'demand' | 'comparison'>('price');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'charts-only'>('grid');

  // Sort State for Table
  const [sortField, setSortField] = useState<keyof MarketCropData>('currentIndicativePrice');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Simulated Alert State
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Extract unique locations and crops for filters
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(crops.map((c) => c.location)));
    return locs;
  }, [crops]);

  const uniqueCropNames = useMemo(() => {
    const names = Array.from(new Set(crops.map((c) => c.cropName)));
    return names;
  }, [crops]);

  // Filtered dataset
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Crop name filter
      if (selectedCropFilter !== 'all' && crop.cropName !== selectedCropFilter) {
        return false;
      }
      // Location filter
      if (selectedLocationFilter !== 'all' && crop.location !== selectedLocationFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = crop.cropName.toLowerCase().includes(q);
        const matchesHindi = crop.hindiName.toLowerCase().includes(q);
        const matchesLoc = crop.location.toLowerCase().includes(q);
        const matchesMandi = crop.mandiName.toLowerCase().includes(q);
        const matchesVariety = crop.variety.toLowerCase().includes(q);
        if (!matchesName && !matchesHindi && !matchesLoc && !matchesMandi && !matchesVariety) {
          return false;
        }
      }
      return true;
    });
  }, [crops, selectedCropFilter, selectedLocationFilter, searchQuery]);

  // Sorted crops for table view
  const sortedCrops = useMemo(() => {
    return [...filteredCrops].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (typeof aVal === 'number') {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      return 0;
    });
  }, [filteredCrops, sortField, sortDirection]);

  // Selected crop object
  const activeCrop = useMemo(() => {
    return crops.find((c) => c.id === selectedCropId) || filteredCrops[0] || crops[0];
  }, [crops, selectedCropId, filteredCrops]);

  // Summary Metrics calculations
  const marketMetrics = useMemo(() => {
    const totalVolume = crops.reduce((acc, c) => acc + c.arrivalVolumeQuintals, 0);
    const topGainer = [...crops].sort((a, b) => b.priceChangePercent - a.priceChangePercent)[0];
    const highestDemand = crops.find((c) => c.demandLevel === 'Very High') || crops[0];
    const avgPrice = Math.round(crops.reduce((acc, c) => acc + c.currentIndicativePrice, 0) / crops.length);

    return { totalVolume, topGainer, highestDemand, avgPrice };
  }, [crops]);

  const handleSort = (field: keyof MarketCropData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTriggerAlert = (cropName: string) => {
    setAlertSuccess(`Price alert activated for ${cropName}! You will receive simulated SMS updates when indicative rates shift by ±2%.`);
    setTimeout(() => setAlertSuccess(null), 5000);
  };

  return (
    <div id="market-intelligence-dashboard" className="space-y-6">
      {/* 1. TOP TITLE & MANDATORY DEMO NOTICE */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#8C6228]" />
                <span>Demo Market Data</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] border border-[#1B4332]/20">
                KrishiSetu Intelligence Hub
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E] mt-2 flex items-center gap-2.5">
              <TrendingUp className="w-7 h-7 text-[#1B4332]" />
              <span>Agricultural Market Intelligence (कृषि बाज़ार विश्लेषण)</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4D6B53] font-bold mt-1 max-w-3xl">
              Track indicative farmgate rates, demand-supply velocity, regional mandi benchmark trends, and price momentum across major agricultural commodities.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => {
                setSelectedCropFilter('all');
                setSelectedLocationFilter('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-2 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#1B4332] hover:bg-[#E8F0E5] transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            <button
              onClick={() => handleTriggerAlert(activeCrop.cropName)}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D5A27] text-white rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-[#E8D5B5]" />
              <span>Set Demo Alert</span>
            </button>
          </div>
        </div>

        {/* PROMINENT DEMO DATA DISCLAIMER BOX */}
        <div className="mt-5 p-4 rounded-2xl bg-[#FAF3E0] border-2 border-[#E8D5B5] text-xs text-[#8C6228] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#8C6228] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-black uppercase tracking-wider text-[11px]">
              Transparency Notice: Demo Market Data Only
            </p>
            <p className="font-medium text-[11px] leading-relaxed">
              All prices, previous rates, percentage shifts, demand scores, and arrival quantities displayed on this dashboard are <strong>simulated Demo Market Data</strong> for demonstration and platform evaluation purposes. They do not constitute official Government Minimum Support Prices (MSP) or live published APMC/e-NAM auction rates.
            </p>
          </div>
        </div>

        {/* Alert Feedback Toast */}
        {alertSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{alertSuccess}</span>
            </span>
            <button onClick={() => setAlertSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-black">
              ✕
            </button>
          </div>
        )}

        {/* 2. OVERVIEW METRICS KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Monitored Crops</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#11281E] mt-1 block">
              {crops.length} <span className="text-xs text-[#4D6B53] font-bold">Commodities</span>
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">Avg ₹{marketMetrics.avgPrice.toLocaleString('en-IN')}/Qtl</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Top Mover Today</span>
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-800 mt-1 block truncate">
              {marketMetrics.topGainer.cropName.replace(/\s\(.*/, '')}
            </span>
            <span className="text-[10px] font-black text-emerald-700">
              +{marketMetrics.topGainer.priceChangePercent}% (₹{marketMetrics.topGainer.currentIndicativePrice})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Highest Demand</span>
            </span>
            <span className="text-base sm:text-lg font-black text-[#11281E] mt-1 block truncate">
              {marketMetrics.highestDemand.cropName.replace(/\s\(.*/, '')}
            </span>
            <span className="text-[10px] font-black text-amber-700">
              {marketMetrics.highestDemand.demandLevel} Demand • {marketMetrics.highestDemand.location.split(',')[0]}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Total Demo Arrivals</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#11281E] mt-1 block">
              {marketMetrics.totalVolume.toLocaleString('en-IN')} <span className="text-xs text-[#4D6B53] font-bold">Qtl</span>
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">Across {uniqueLocations.length} Regional Mandis</span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-CRITERIA FILTERS TOOLBAR */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Filter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Filter 1: Crop Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#11281E] mb-1.5 flex items-center gap-1">
                <Wheat className="w-3 h-3 text-[#1B4332]" />
                <span>Filter by Crop / फसल</span>
              </label>
              <select
                id="filter-crop-select"
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-hidden focus:border-[#1B4332]"
              >
                <option value="all">All Crops ({crops.length} Monitored)</option>
                {uniqueCropNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Location Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#11281E] mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#2D5A27]" />
                <span>Filter by Location / मंडी</span>
              </label>
              <select
                id="filter-location-select"
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-hidden focus:border-[#1B4332]"
              >
                <option value="all">All Locations / Mandis</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Date Range Filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#11281E] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8C6228]" />
                <span>Date Range / समय सीमा</span>
              </label>
              <div className="grid grid-cols-4 gap-1 bg-[#F8FAF5] p-1 rounded-2xl border-2 border-[#1B4332]/10">
                {(['7d', '30d', '3m', '1y'] as DateRangeOption[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedDateRange(range)}
                    className={`py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                      selectedDateRange === range
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Search Input & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                Quick Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8FA396] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="filter-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crop, variety, or mandi..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-hidden focus:border-[#1B4332]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#8FA396] hover:text-[#11281E]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                View Layout
              </label>
              <div className="flex items-center gap-1 bg-[#F8FAF5] p-1 rounded-2xl border-2 border-[#1B4332]/10 h-[42px]">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid & Charts View"
                  className={`p-2 rounded-xl text-xs font-black transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('charts-only')}
                  title="Deep Charts Mode"
                  className={`p-2 rounded-xl text-xs font-black transition-all ${
                    viewMode === 'charts-only'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Data Table View"
                  className={`p-2 rounded-xl text-xs font-black transition-all ${
                    viewMode === 'table'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary Tags */}
        {(selectedCropFilter !== 'all' || selectedLocationFilter !== 'all' || searchQuery !== '') && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap text-xs">
            <span className="font-bold text-[#4D6B53]">Active filters:</span>
            {selectedCropFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] font-black text-[11px] flex items-center gap-1 border border-[#1B4332]/20">
                Crop: {selectedCropFilter}
                <button onClick={() => setSelectedCropFilter('all')} className="hover:text-black">✕</button>
              </span>
            )}
            {selectedLocationFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] font-black text-[11px] flex items-center gap-1 border border-[#1B4332]/20">
                Location: {selectedLocationFilter}
                <button onClick={() => setSelectedLocationFilter('all')} className="hover:text-black">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] font-black text-[11px] flex items-center gap-1 border border-[#1B4332]/20">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-black">✕</button>
              </span>
            )}
            <span className="text-[11px] text-[#8FA396] font-bold">
              Showing {filteredCrops.length} of {crops.length} commodities
            </span>
          </div>
        )}
      </div>

      {/* 4. CHARTS SECTION (PRICE TREND, DEMAND TREND, CROP COMPARISON) */}
      <div className="space-y-4">
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-6 py-4 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1B4332]" />
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#11281E]">
                Market Analytics & Trend Visualizer
              </h2>
              <p className="text-[11px] text-[#4D6B53] font-bold">
                Active Crop: <span className="text-[#1B4332] font-black">{activeCrop.cropName}</span> ({activeCrop.hindiName})
              </p>
            </div>
          </div>

          {/* Chart Type Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF5] p-1.5 rounded-full border-2 border-[#1B4332]/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('price')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeChartTab === 'price'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Price Trend</span>
            </button>

            <button
              onClick={() => setActiveChartTab('demand')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeChartTab === 'demand'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Demand Velocity</span>
            </button>

            <button
              onClick={() => setActiveChartTab('comparison')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeChartTab === 'comparison'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Crop Comparison</span>
            </button>
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="grid grid-cols-1 gap-6">
          {activeChartTab === 'price' && (
            <PriceTrendChart
              crop={activeCrop}
              dateRange={selectedDateRange}
              onDateRangeChange={(range) => setSelectedDateRange(range)}
            />
          )}

          {activeChartTab === 'demand' && (
            <DemandTrendChart
              crop={activeCrop}
              dateRange={selectedDateRange}
            />
          )}

          {activeChartTab === 'comparison' && (
            <CropComparisonChart
              crops={filteredCrops.length > 0 ? filteredCrops : crops}
              selectedCropId={selectedCropId}
              onSelectCrop={(crop) => {
                setSelectedCropId(crop.id);
                setActiveChartTab('price');
              }}
            />
          )}
        </div>
      </div>

      {/* 5. COMMODITY CARDS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                Monitored Agricultural Commodities ({filteredCrops.length})
              </h3>
              <p className="text-xs text-[#4D6B53] font-bold">
                Select any crop card below to dynamically switch the active trend graph above.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
              Demo Market Data
            </span>
          </div>

          {filteredCrops.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-[#1B4332]/20 text-center space-y-3">
              <Wheat className="w-10 h-10 text-[#8FA396] mx-auto" />
              <h4 className="text-base font-black uppercase text-[#11281E]">No Commodities Match Your Filter</h4>
              <p className="text-xs text-[#4D6B53] max-w-sm mx-auto font-bold">
                Try selecting a different crop, clearing search terms, or resetting the location filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCropFilter('all');
                  setSelectedLocationFilter('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-[#1B4332] text-white rounded-full text-xs font-black uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCrops.map((crop) => (
                <MarketPriceCard
                  key={crop.id}
                  crop={crop}
                  isSelected={crop.id === selectedCropId}
                  onSelect={(c) => setSelectedCropId(c.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. DETAILED DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#1B4332]/10">
            <div>
              <div className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-[#1B4332]" />
                <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                  Complete Commodity Price & Demand Ledger
                </h3>
              </div>
              <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                All fields categorized with indicative pricing, supply-demand pressure, and regional mandis.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5] self-start sm:self-auto">
              Demo Market Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1B4332]/15 text-[10px] font-black uppercase tracking-wider text-[#4D6B53] bg-[#F8FAF5]">
                  <th
                    onClick={() => handleSort('cropName')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Crop / फसल</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('currentIndicativePrice')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Indicative Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('previousPrice')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Prev Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priceChange')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Price Change</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('demandLevel')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Demand Level</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('supplyLevel')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Supply Level</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('location')}
                    className="py-3 px-4 cursor-pointer hover:text-[#11281E]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Location / Mandi</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B4332]/10 text-xs font-bold text-[#11281E]">
                {sortedCrops.map((crop) => {
                  const isPos = crop.priceChange > 0;
                  const isZero = crop.priceChange === 0;
                  const isSelected = crop.id === selectedCropId;

                  return (
                    <tr
                      key={crop.id}
                      onClick={() => setSelectedCropId(crop.id)}
                      className={`hover:bg-[#F8FAF5] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#E8F0E5]/60' : ''
                      }`}
                    >
                      {/* Crop */}
                      <td className="py-4 px-4 font-black">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="block text-sm uppercase">{crop.cropName}</span>
                            <span className="text-[10px] text-[#4D6B53] font-bold">
                              {crop.hindiName} • {crop.variety}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1B4332] text-white">
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Indicative Price */}
                      <td className="py-4 px-4 font-black text-sm text-[#1B4332]">
                        ₹{crop.currentIndicativePrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#4D6B53]">/{crop.unit}</span>
                      </td>

                      {/* Previous Price */}
                      <td className="py-4 px-4 text-[#8FA396] font-mono">
                        ₹{crop.previousPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Price Change */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black ${
                            isPos
                              ? 'bg-emerald-100 text-emerald-800'
                              : isZero
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPos ? '+' : ''}₹{crop.priceChange} ({isPos ? '+' : ''}{crop.priceChangePercent}%)
                        </span>
                      </td>

                      {/* Demand Level */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                            crop.demandLevel === 'Very High'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : crop.demandLevel === 'High'
                              ? 'bg-teal-50 text-teal-700 border-teal-300'
                              : crop.demandLevel === 'Moderate'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {crop.demandLevel}
                        </span>
                      </td>

                      {/* Supply Level */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                            crop.supplyLevel === 'Tight' || crop.supplyLevel === 'Constrained'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          {crop.supplyLevel}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <span className="block text-xs font-bold text-[#11281E]">{crop.mandiName}</span>
                        <span className="text-[10px] text-[#8FA396] font-bold">{crop.location}</span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCropId(crop.id);
                            setActiveChartTab('price');
                          }}
                          className="py-1.5 px-3 rounded-full bg-[#E8F0E5] hover:bg-[#1B4332] hover:text-white text-[#1B4332] text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Graph Trend →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
