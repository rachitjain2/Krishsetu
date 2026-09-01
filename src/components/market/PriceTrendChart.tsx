import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Info, ShieldAlert } from 'lucide-react';
import { MarketCropData, DateRangeOption } from '../../types';

interface PriceTrendChartProps {
  crop: MarketCropData;
  dateRange: DateRangeOption;
  onDateRangeChange?: (range: DateRangeOption) => void;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  crop,
  dateRange,
  onDateRangeChange,
}) => {
  const data = crop.historicalPrices[dateRange] || crop.historicalPrices['30d'];

  const startPrice = data[0]?.price || crop.previousPrice;
  const currentPrice = data[data.length - 1]?.price || crop.currentIndicativePrice;
  const priceDiff = currentPrice - startPrice;
  const priceDiffPercent = Number(((priceDiff / startPrice) * 100).toFixed(2));
  const isPositive = priceDiff >= 0;

  const minPrice = Math.min(...data.map((d) => d.indicativeMin || d.price));
  const maxPrice = Math.max(...data.map((d) => d.indicativeMax || d.price));
  const avgPrice = Math.round(data.reduce((acc, curr) => acc + curr.price, 0) / (data.length || 1));

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-[#1B4332]/20 shadow-lg text-xs">
          <p className="font-black text-[#11281E] text-sm uppercase tracking-tight mb-1">
            {point.date}
          </p>
          <div className="space-y-1 font-bold">
            <div className="flex justify-between gap-4 text-[#1B4332]">
              <span>Indicative Price:</span>
              <span className="font-black text-sm">₹{point.price.toLocaleString('en-IN')} / {crop.unit}</span>
            </div>
            {point.indicativeMin && point.indicativeMax && (
              <div className="flex justify-between gap-4 text-[#4D6B53] text-[11px]">
                <span>Mandi Range:</span>
                <span>₹{point.indicativeMin} – ₹{point.indicativeMax}</span>
              </div>
            )}
            {point.volumeQuintals && (
              <div className="flex justify-between gap-4 text-[#8FA396] text-[11px]">
                <span>Est. Volume:</span>
                <span>{point.volumeQuintals.toLocaleString('en-IN')} Qtl</span>
              </div>
            )}
            <div className="pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-[#8C6228] font-black uppercase">
              • Demo Indicative Sample
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const rangeLabels: Record<DateRangeOption, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '3m': 'Last 3 Months',
    '1y': 'Past 1 Year',
  };

  return (
    <div className="p-6 sm:p-7 rounded-[32px] bg-white border-2 border-[#1B4332]/15 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                Demo Market Data
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">
                {crop.mandiName}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E] mt-1 flex items-center gap-2">
              <span>{crop.cropName}</span>
              <span className="text-sm font-bold text-[#4D6B53]">({crop.hindiName})</span>
            </h3>
            <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
              Historical Indicative Farmgate & Mandi Price Trend
            </p>
          </div>

          {/* Date Range Selector Pills */}
          {onDateRangeChange && (
            <div className="flex items-center gap-1 bg-[#F8FAF5] p-1 rounded-full border-2 border-[#1B4332]/10 self-start sm:self-auto">
              {(['7d', '30d', '3m', '1y'] as DateRangeOption[]).map((range) => (
                <button
                  key={range}
                  onClick={() => onDateRangeChange(range)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    dateRange === range
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Current Indicative
            </span>
            <span className="text-lg sm:text-xl font-black text-[#11281E] mt-0.5 block">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">per {crop.unit}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Period Trend ({rangeLabels[dateRange]})
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
              <span
                className={`text-lg sm:text-xl font-black ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositive ? '+' : ''}₹{priceDiff} ({isPositive ? '+' : ''}{priceDiffPercent}%)
              </span>
            </div>
            <span className="text-[10px] text-[#8FA396] font-bold">From ₹{startPrice}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Period High / Low
            </span>
            <span className="text-sm font-black text-[#11281E] mt-1 block font-mono">
              ₹{maxPrice.toLocaleString('en-IN')} <span className="text-slate-400">/</span> ₹{minPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">Range Spread</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Period Average
            </span>
            <span className="text-lg sm:text-xl font-black text-[#1B4332] mt-0.5 block">
              ₹{avgPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">Indicative benchmark</span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={avgPrice}
                stroke="#8C6228"
                strokeDasharray="4 4"
                label={{ value: 'Avg', fill: '#8C6228', fontSize: 10, position: 'right' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#1B4332"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#priceGradient)"
                activeDot={{ r: 6, stroke: '#1B4332', strokeWidth: 2, fill: '#FAF3E0' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Footer Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#4D6B53] font-medium">
        <p className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#8C6228] shrink-0" />
          <span>Notice: Historical trend numbers shown are sample demo market figures for UI preview.</span>
        </p>
        <span className="text-[10px] font-black uppercase text-[#8FA396] shrink-0">
          Updated Today • {crop.location}
        </span>
      </div>
    </div>
  );
};
