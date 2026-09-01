import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Flame, Info, Layers, Users } from 'lucide-react';
import { MarketCropData, DateRangeOption } from '../../types';

interface DemandTrendChartProps {
  crop: MarketCropData;
  dateRange: DateRangeOption;
}

export const DemandTrendChart: React.FC<DemandTrendChartProps> = ({ crop, dateRange }) => {
  const data = crop.demandTrends[dateRange] || crop.demandTrends['30d'];

  const currentDemand = data[data.length - 1]?.demandIndex || 85;
  const startDemand = data[0]?.demandIndex || 70;
  const demandShift = currentDemand - startDemand;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-[#1B4332]/20 shadow-lg text-xs">
          <p className="font-black text-[#11281E] text-sm uppercase tracking-tight mb-1">
            {point.date}
          </p>
          <div className="space-y-1.5 font-bold">
            <div className="flex justify-between gap-4 text-emerald-800">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Demand Index:</span>
              </span>
              <span className="font-black text-sm">{point.demandIndex} / 100</span>
            </div>
            <div className="flex justify-between gap-4 text-blue-700 text-[11px]">
              <span>Buyer Inquiries:</span>
              <span className="font-bold">{point.buyerInquiries} active</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600 text-[11px]">
              <span>Arrival Pressure Index:</span>
              <span className="font-bold">{point.supplyArrivals} / 100</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-100 text-[10px] text-[#8C6228] font-black uppercase">
              • Demo Market Demand Metrics
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-7 rounded-[32px] bg-white border-2 border-[#1B4332]/15 shadow-xs flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                Demo Market Data
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">
                Procurement Pressure Index
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E] mt-1 flex items-center gap-2">
              <span>Demand & Inquiry Velocity</span>
            </h3>
            <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
              Buyer inquiry surge vs. mandi arrival volume for {crop.cropName}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0E5] border border-[#1B4332]/20 text-xs font-black text-[#1B4332] self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Demand Level: {crop.demandLevel}</span>
          </div>
        </div>

        {/* Key Indicators Banner */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Current Demand Score
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5 block">
              {currentDemand} <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">
              {demandShift >= 0 ? `+${demandShift} pts surge` : `${demandShift} pts shift`}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Active Buyer Inquiries
            </span>
            <span className="text-lg sm:text-xl font-black text-[#11281E] mt-0.5 block">
              {data[data.length - 1]?.buyerInquiries || 45}
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">Verified Millers & Traders</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              Supply Status
            </span>
            <span className="text-sm sm:text-base font-black text-[#11281E] mt-1 block">
              {crop.supplyLevel}
            </span>
            <span className="text-[10px] text-[#4D6B53] font-bold">
              {crop.arrivalVolumeQuintals.toLocaleString('en-IN')} Qtl Total
            </span>
          </div>
        </div>

        {/* Demand Chart */}
        <div className="h-56 sm:h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2D5A27" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '10px' }}
              />
              <Area
                type="monotone"
                name="Demand Score"
                dataKey="demandIndex"
                stroke="#1B4332"
                strokeWidth={2.5}
                fill="url(#demandGradient)"
              />
              <Bar
                name="Buyer Inquiries"
                dataKey="buyerInquiries"
                barSize={12}
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                name="Arrival Inflow"
                dataKey="supplyArrivals"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#4D6B53]">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#8C6228]" />
          <span>Demo inquiry trajectory aggregated from sample bids & search logs.</span>
        </span>
        <span className="font-mono text-[10px] text-[#8FA396]">DEMO DATA ONLY</span>
      </div>
    </div>
  );
};
