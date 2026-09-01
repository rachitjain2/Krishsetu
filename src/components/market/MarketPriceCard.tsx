import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Flame,
  Package,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { MarketCropData } from '../../types';

interface MarketPriceCardProps {
  crop: MarketCropData;
  isSelected?: boolean;
  onSelect?: (crop: MarketCropData) => void;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({
  crop,
  isSelected = false,
  onSelect,
}) => {
  const isPositive = crop.priceChange > 0;
  const isNeutral = crop.priceChange === 0;

  // Demand Level Badge Color
  const getDemandBadgeColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'High':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Supply Level Badge Color
  const getSupplyBadgeColor = (level: string) => {
    switch (level) {
      case 'Tight':
      case 'Constrained':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Moderate':
      case 'Adequate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Surplus':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <div
      id={`market-card-${crop.id}`}
      onClick={() => onSelect && onSelect(crop)}
      className={`relative p-5 sm:p-6 rounded-[28px] border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-white border-[#1B4332] shadow-md ring-2 ring-[#1B4332]/20'
          : 'bg-[#F8FAF5] border-[#1B4332]/15 hover:border-[#1B4332]/60 hover:bg-white hover:shadow-xs'
      }`}
    >
      {/* Top Bar: Demo Label & Selection Pill */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
              Demo Market Data
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#4D6B53] border border-[#1B4332]/15">
              {crop.category}
            </span>
          </div>

          {isSelected && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white">
              Viewing Charts
            </span>
          )}
        </div>

        {/* Crop Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E] leading-tight">
                {crop.cropName}
              </h3>
              <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                {crop.hindiName} • <span className="text-[#8FA396] font-medium">{crop.variety}</span>
              </p>
            </div>
            
            {/* Sentiment Pill */}
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                crop.sentiment === 'Bullish'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : crop.sentiment === 'Bearish'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {crop.sentiment}
            </span>
          </div>
        </div>

        {/* Price Information Section */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/10 mb-4 shadow-2xs">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block mb-0.5">
                Current Indicative Price
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#11281E]">
                  ₹{crop.currentIndicativePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-[#4D6B53]">/{crop.unit}</span>
              </div>
            </div>

            {/* Price Change Pill */}
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isNeutral
                    ? 'bg-slate-50 text-slate-600 border-slate-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isNeutral ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {isPositive ? '+' : ''}₹{crop.priceChange} ({isPositive ? '+' : ''}
                  {crop.priceChangePercent}%)
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#8FA396] block mt-1">
                Prev: ₹{crop.previousPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Day Range mini bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#4D6B53]">
            <span>Day Range:</span>
            <span className="font-mono text-[#11281E]">
              ₹{crop.dayLow.toLocaleString('en-IN')} – ₹{crop.dayHigh.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Demand & Supply Indicators */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block mb-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Demand Level</span>
            </span>
            <span
              className={`inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border ${getDemandBadgeColor(
                crop.demandLevel
              )}`}
            >
              {crop.demandLevel}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" />
              <span>Supply Level</span>
            </span>
            <span
              className={`inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border ${getSupplyBadgeColor(
                crop.supplyLevel
              )}`}
            >
              {crop.supplyLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Location & Summary Insight */}
      <div className="pt-3 border-t-2 border-[#1B4332]/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#4D6B53]">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
            <span className="truncate">{crop.mandiName}</span>
          </div>
          <span className="text-[10px] font-black uppercase text-[#8FA396] shrink-0 ml-1">
            {crop.state}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#4D6B53] font-medium bg-[#E8F0E5]/50 px-2.5 py-1.5 rounded-xl border border-[#1B4332]/10">
          <span className="font-bold">Arrivals: {crop.arrivalVolumeQuintals.toLocaleString('en-IN')} Qtl</span>
          <span className="text-[10px] font-black text-[#1B4332] uppercase tracking-wider">
            {isSelected ? 'Active Chart' : 'Click to Graph →'}
          </span>
        </div>
      </div>
    </div>
  );
};
