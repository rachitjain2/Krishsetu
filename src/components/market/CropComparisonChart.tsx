import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Layers, Info, IndianRupee, Flame, TrendingUp, Package } from 'lucide-react';
import { MarketCropData } from '../../types';

interface CropComparisonChartProps {
  crops: MarketCropData[];
  onSelectCrop?: (crop: MarketCropData) => void;
  selectedCropId?: string;
}

type ComparisonMetric = 'price' | 'demand' | 'changePercent' | 'arrivals';

export const CropComparisonChart: React.FC<CropComparisonChartProps> = ({
  crops,
  onSelectCrop,
  selectedCropId,
}) => {
  const [metric, setMetric] = useState<ComparisonMetric>('price');

  const chartData = crops.map((c) => ({
    id: c.id,
    cropName: c.cropName.replace(/\s\(.*/, ''), // Shorten label for chart axis
    fullName: c.cropName,
    hindiName: c.hindiName,
    location: c.location,
    price: c.currentIndicativePrice,
    demand: c.demandLevel === 'Very High' ? 95 : c.demandLevel === 'High' ? 82 : c.demandLevel === 'Moderate' ? 64 : 45,
    changePercent: c.priceChangePercent,
    arrivals: c.arrivalVolumeQuintals,
    unit: c.unit,
    originalCrop: c,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-[#1B4332]/20 shadow-lg text-xs">
          <p className="font-black text-[#11281E] text-sm uppercase tracking-tight mb-1">
            {data.fullName}
          </p>
          <p className="text-[11px] text-[#4D6B53] font-bold mb-2">
            {data.hindiName} • {data.location}
          </p>
          <div className="space-y-1.5 font-bold border-t border-slate-100 pt-2">
            <div className="flex justify-between gap-4 text-[#11281E]">
              <span>Indicative Price:</span>
              <span className="font-black text-[#1B4332]">₹{data.price.toLocaleString('en-IN')} / {data.unit}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#4D6B53]">
              <span>Demand Score:</span>
              <span className="font-black text-amber-700">{data.demand} / 100</span>
            </div>
            <div className="flex justify-between gap-4 text-[#4D6B53]">
              <span>Price Shift:</span>
              <span className={`font-black ${data.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent}%
              </span>
            </div>
            <div className="flex justify-between gap-4 text-[#4D6B53]">
              <span>Arrivals:</span>
              <span className="font-mono">{data.arrivals.toLocaleString('en-IN')} Qtl</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-[#8C6228] font-black uppercase">
              • Demo Market Data Comparison
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'price':
        return 'Indicative Price (₹/Quintal)';
      case 'demand':
        return 'Demand Index Score (0-100)';
      case 'changePercent':
        return 'Price Change (%)';
      case 'arrivals':
        return 'Arrivals Volume (Quintals)';
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-[32px] bg-white border-2 border-[#1B4332]/15 shadow-xs flex flex-col justify-between">
      {/* Top Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                Demo Market Data
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">
                Cross-Commodity Benchmark
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E] mt-1 flex items-center gap-2">
              <span>Crop Comparison Benchmark</span>
            </h3>
            <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
              Compare prices, demand indices, and arrival volume across monitored crops
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 bg-[#F8FAF5] p-1 rounded-full border-2 border-[#1B4332]/10 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => setMetric('price')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                metric === 'price'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Price</span>
            </button>

            <button
              onClick={() => setMetric('demand')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                metric === 'demand'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Demand</span>
            </button>

            <button
              onClick={() => setMetric('changePercent')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                metric === 'changePercent'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Shift %</span>
            </button>

            <button
              onClick={() => setMetric('arrivals')}
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                metric === 'arrivals'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Arrivals</span>
            </button>
          </div>
        </div>

        {/* Current Metric Indicator */}
        <div className="flex items-center justify-between mt-4 mb-2 text-xs font-bold text-[#4D6B53]">
          <span>Comparing: <strong className="text-[#11281E]">{getMetricLabel()}</strong></span>
          <span className="text-[10px] text-[#8FA396] uppercase font-black">
            Click bar to view dedicated crop charts
          </span>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: metric === 'price' ? 0 : -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="cropName"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (metric === 'price') return `₹${val > 999 ? `${Math.round(val / 1000)}k` : val}`;
                  if (metric === 'changePercent') return `${val}%`;
                  if (metric === 'arrivals') return `${val > 999 ? `${(val / 1000).toFixed(1)}k` : val}`;
                  return val;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={metric}
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => {
                  if (onSelectCrop && entry.originalCrop) {
                    onSelectCrop(entry.originalCrop);
                  }
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => {
                  const isSelected = selectedCropId === entry.id;
                  let fill = '#1B4332';
                  if (metric === 'demand') fill = '#D97706';
                  if (metric === 'changePercent') fill = entry.changePercent >= 0 ? '#059669' : '#E11D48';
                  if (metric === 'arrivals') fill = '#2563EB';

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isSelected ? '#11281E' : fill}
                      opacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#E8D5B5' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#4D6B53]">
        <p className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#8C6228] shrink-0" />
          <span>Demo comparative figures for agricultural commodities. Not official trade index.</span>
        </p>
        <span className="text-[10px] font-black uppercase text-[#8FA396]">
          {crops.length} Commodities Monitored
        </span>
      </div>
    </div>
  );
};
