import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Maximize2,
  RefreshCw,
  Droplets,
  Sun,
  Activity,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DEMO_AGRICULTURAL_PLOTS, SATELLITE_YIELD_MODELS } from '../data/satelliteYieldData';
import { FieldPlotGeometry, YieldRegressionResult, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface SatelliteYieldPredictorProps {
  currentUser: UserProfile | null;
  onNavigateToAuction?: () => void;
}

export const SatelliteYieldPredictor: React.FC<SatelliteYieldPredictorProps> = ({
  currentUser,
  onNavigateToAuction,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(DEMO_AGRICULTURAL_PLOTS[0].plotId);
  const [activeVisualMode, setActiveVisualMode] = useState<'ndvi_heatmap' | 'optical_satellite' | 'nir_false_color'>('ndvi_heatmap');
  const [customLat, setCustomLat] = useState<string>('23.1765');
  const [customLng, setCustomLng] = useState<string>('75.7885');
  const [isRefreshingSatellite, setIsRefreshingSatellite] = useState<boolean>(false);
  const [activePixelProbe, setActivePixelProbe] = useState<{ x: number; y: number; ndvi: number; health: string }>({
    x: 4,
    y: 3,
    ndvi: 0.84,
    health: 'Optimal Biomass (Healthy Canopy)',
  });

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  const selectedPlot = DEMO_AGRICULTURAL_PLOTS.find((p) => p.plotId === selectedPlotId) || DEMO_AGRICULTURAL_PLOTS[0];
  const yieldModel = SATELLITE_YIELD_MODELS[selectedPlotId] || SATELLITE_YIELD_MODELS['PLOT-MP-UJJAIN-101'];

  // Calculate live dynamic NDVI from spectral bands
  const calculatedNDVI = (
    (yieldModel.spectralBands.b8NIR - yieldModel.spectralBands.b4Red) /
    (yieldModel.spectralBands.b8NIR + yieldModel.spectralBands.b4Red)
  ).toFixed(3);

  const handleRefreshSatellitePass = () => {
    setIsRefreshingSatellite(true);
    setTimeout(() => {
      setIsRefreshingSatellite(false);
      showSuccess(
        isHindi ? 'सेंटिनेल-2 उपग्रह डेटा अपडेट हुआ' : 'Sentinel-2 L2A Orbit Pass Pulled',
        isHindi ? '10m रिज़ॉल्यूशन मल्टीस्पेक्ट्रल बैंड सफलतापूर्वक सिंक हुए।' : '10m GSD multispectral reflectance synced with cloud mask < 1%.'
      );
    }, 1200);
  };

  return (
    <div className="space-y-6" id="satellite-yield-prediction-root">
      {/* Hero Header Banner */}
      <div className="bg-radial from-[#132E22] via-[#1B4332] to-[#0D2017] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#1B4332] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '12s' }} />
                ESA Sentinel-2 Multispectral MSI (10m)
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider border border-white/15">
                Google Earth Engine API Ready
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-black uppercase tracking-wider border border-amber-400/30">
                AI Yield Regression Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi ? 'वास्तविक उपग्रह उपज पूर्वानुमान (Sentinel-2 / NDVI)' : 'Real Sentinel-2 / NDVI Plot Yield Predictor'}
            </h1>
            <p className="text-sm text-emerald-100/80 font-medium max-w-2xl leading-relaxed">
              {isHindi
                ? 'सिर्फ बुवाई के अनुमान नहीं — किसान के वास्तविक खेत निर्देशांक (GPS) से सेंटिनेल-2 उपग्रह का NIR Band 8 व Red Band 4 स्पेक्ट्रल डेटा खींचकर 5-वर्षीय ऐतिहासिक उपज प्रतिगमन मॉडल से सटीक उत्पादन का सटीक पूर्वानुमान।'
                : 'Direct plot coordinate spectral extraction (NIR Band 8, Red Band 4, SWIR Band 11) fed into multi-season regression models. Predicts exact harvest volume (Qtl/Acre), harvest readiness window, and farm-gate revenue.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="refresh-satellite-pass-btn"
              onClick={handleRefreshSatellitePass}
              disabled={isRefreshingSatellite}
              className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#11281E] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingSatellite ? 'animate-spin' : ''}`} />
              <span>{isRefreshingSatellite ? (isHindi ? 'उपग्रह डेटा लोड हो रहा है...' : 'Syncing Orbit...') : (isHindi ? 'ताज़ा सैटेलाइट पास खींचें' : 'Pull Live Sentinel Pass')}</span>
            </button>
          </div>
        </div>

        {/* Plot Selector Chips */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 shrink-0">
            {isHindi ? 'खेत प्लॉट चुनें:' : 'Select Plot:'}
          </span>
          {DEMO_AGRICULTURAL_PLOTS.map((plot) => {
            const isSelected = plot.plotId === selectedPlotId;
            return (
              <button
                key={plot.plotId}
                id={`plot-btn-${plot.plotId}`}
                onClick={() => setSelectedPlotId(plot.plotId)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-white text-[#11281E] border-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border-white/15'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{plot.plotName.split('-')[0]}</span>
                <span className="text-[10px] opacity-75 font-bold">({plot.areaAcres} Ac)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Plot Satellite Visualizer & Spectral Bands (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plot Heatmap & Visualizer */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#1B4332]/15 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                    GPS: {selectedPlot.latitude.toFixed(4)}° N, {selectedPlot.longitude.toFixed(4)}° E
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedPlot.currentCrop}
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#11281E]">
                  {selectedPlot.plotName}
                </h3>
              </div>

              {/* Visual Mode Selector */}
              <div className="flex items-center gap-1 bg-[#F8FAF5] p-1 rounded-2xl border border-[#1B4332]/15">
                <button
                  id="mode-ndvi-heatmap-btn"
                  onClick={() => setActiveVisualMode('ndvi_heatmap')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeVisualMode === 'ndvi_heatmap'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E]'
                  }`}
                >
                  NDVI Heatmap
                </button>
                <button
                  id="mode-nir-false-color-btn"
                  onClick={() => setActiveVisualMode('nir_false_color')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeVisualMode === 'nir_false_color'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E]'
                  }`}
                >
                  NIR False Color
                </button>
                <button
                  id="mode-optical-satellite-btn"
                  onClick={() => setActiveVisualMode('optical_satellite')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeVisualMode === 'optical_satellite'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#4D6B53] hover:text-[#11281E]'
                  }`}
                >
                  True Optical
                </button>
              </div>
            </div>

            {/* Interactive Farm Plot Canvas / Pixel Grid Simulation */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1B4332]/20 bg-[#0F281E] p-4 text-white min-h-[300px] flex flex-col justify-between">
              {/* Overlay Background depending on mode */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  activeVisualMode === 'ndvi_heatmap'
                    ? 'bg-gradient-to-br from-emerald-900/90 via-emerald-700/80 to-lime-600/70'
                    : activeVisualMode === 'nir_false_color'
                    ? 'bg-gradient-to-br from-rose-950 via-rose-700 to-amber-900'
                    : 'bg-gradient-to-br from-[#2D5A27] via-[#1B4332] to-[#3B2F1F]'
                }`}
              />

              {/* Synthetic 8x6 Pixel Grid Simulation with Interactive Hover Probe */}
              <div className="relative z-10 grid grid-cols-8 gap-1.5 max-w-lg mx-auto w-full my-auto">
                {Array.from({ length: 48 }).map((_, index) => {
                  const x = index % 8;
                  const y = Math.floor(index / 8);
                  const isCorner = (x === 0 && y === 0) || (x === 7 && y === 0) || (x === 0 && y === 5) || (x === 7 && y === 5);
                  // NDVI values centered high in the middle
                  const distFromCenter = Math.sqrt(Math.pow(x - 3.5, 2) + Math.pow(y - 2.5, 2));
                  const pixelNdvi = Number((0.88 - distFromCenter * 0.08 - (isCorner ? 0.25 : 0)).toFixed(2));
                  const isCurrentProbe = activePixelProbe.x === x && activePixelProbe.y === y;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setActivePixelProbe({
                          x,
                          y,
                          ndvi: pixelNdvi,
                          health:
                            pixelNdvi > 0.75
                              ? 'Optimal Biomass (Healthy Canopy)'
                              : pixelNdvi > 0.55
                              ? 'Moderate Vigor (Normal Growth)'
                              : 'Border Margin / Bare Soil Edge',
                        });
                      }}
                      className={`h-9 rounded-md transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono font-black border ${
                        isCurrentProbe
                          ? 'border-amber-300 ring-2 ring-amber-400 scale-110 z-20 bg-amber-400 text-black shadow-md'
                          : pixelNdvi > 0.75
                          ? 'bg-emerald-500/80 border-emerald-400 text-white hover:scale-105'
                          : pixelNdvi > 0.55
                          ? 'bg-lime-500/70 border-lime-400 text-black hover:scale-105'
                          : 'bg-amber-800/60 border-amber-600 text-amber-200 hover:scale-105'
                      }`}
                    >
                      {pixelNdvi}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Canvas HUD */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/60 p-3 rounded-xl backdrop-blur-xs border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">
                    Sampled Pixel [{activePixelProbe.x}, {activePixelProbe.y}]: NDVI = <strong>{activePixelProbe.ndvi}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-black text-emerald-300 uppercase">{activePixelProbe.health}</span>
              </div>
            </div>

            {/* Multispectral Band Reflectance Inspector */}
            <div className="pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2D5A27]" />
                <span>Sentinel-2 Multispectral Surface Reflectance (L2A Level)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#F8FAF5] rounded-2xl border border-[#1B4332]/15 text-center">
                  <span className="text-[10px] font-bold text-[#6C8573] uppercase block">NIR (Band 8, 842nm)</span>
                  <span className="text-base font-black text-emerald-700">{yieldModel.spectralBands.b8NIR.toFixed(3)}</span>
                  <span className="text-[9px] text-[#4D6B53] block mt-0.5 font-semibold">High Cell Reflection</span>
                </div>

                <div className="p-3 bg-[#F8FAF5] rounded-2xl border border-[#1B4332]/15 text-center">
                  <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Red (Band 4, 665nm)</span>
                  <span className="text-base font-black text-rose-700">{yieldModel.spectralBands.b4Red.toFixed(3)}</span>
                  <span className="text-[9px] text-[#4D6B53] block mt-0.5 font-semibold">Chlorophyll Absorbed</span>
                </div>

                <div className="p-3 bg-[#F8FAF5] rounded-2xl border border-[#1B4332]/15 text-center">
                  <span className="text-[10px] font-bold text-[#6C8573] uppercase block">SWIR (Band 11, 1.6µm)</span>
                  <span className="text-base font-black text-blue-700">{yieldModel.spectralBands.b11SWIR.toFixed(3)}</span>
                  <span className="text-[9px] text-[#4D6B53] block mt-0.5 font-semibold">Canopy Moisture %</span>
                </div>

                <div className="p-3 bg-[#E8F0E5] rounded-2xl border-2 border-[#1B4332]/25 text-center">
                  <span className="text-[10px] font-black text-[#1B4332] uppercase block">Computed Plot NDVI</span>
                  <span className="text-lg font-black text-[#1B4332]">{calculatedNDVI}</span>
                  <span className="text-[9px] text-[#2D5A27] font-black block mt-0.5">Vigorous Growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series NDVI Progression Chart */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#1B4332]/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1B4332]/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
                  {isHindi ? '12-सप्ताह NDVI वनस्पति स्वास्थ्य वक्र' : '12-Week NDVI Crop Phenology Progression'}
                </h3>
                <p className="text-[11px] text-[#4D6B53] font-bold mt-0.5">
                  Tracks emergence ➔ tillering ➔ flowering ➔ grain-filling biomass accumulation
                </p>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                Sentinel-2 Time Series
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldModel.ndviTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ndviColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2D5A27" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B4332" strokeOpacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: '#4D6B53' }} />
                  <YAxis domain={[0, 1.0]} tick={{ fontSize: 10, fontWeight: 700, fill: '#4D6B53' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11281E',
                      borderRadius: '12px',
                      color: '#FAF3E0',
                      border: '1px solid #2D5A27',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => [`${value}`, 'NDVI Index']}
                  />
                  <ReferenceLine y={0.7} stroke="#D4A373" strokeDasharray="3 3" label={{ value: 'Optimal Vigor Line (0.70)', fill: '#7F5539', fontSize: 10 }} />
                  <Area type="monotone" dataKey="ndvi" stroke="#1B4332" strokeWidth={3} fillOpacity={1} fill="url(#ndviColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: AI Yield Regression Output & Strategic Advisory (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* PREDICTED YIELD HERO CARD */}
          <div className="bg-radial from-[#1B4332] to-[#0E261C] rounded-3xl p-6 text-white border-2 border-[#1B4332] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Regression Yield Output
              </span>
              <span className="text-[10px] font-bold text-emerald-200">
                95% Confidence Interval
              </span>
            </div>

            {/* Yield Number Hero */}
            <div className="text-center py-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 block">
                {isHindi ? 'अनुमानित कुल उपज (Predicted Harvest Yield)' : 'Predicted Harvest Yield'}
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white my-1 font-mono">
                {yieldModel.predictedYieldPerAcre} <span className="text-lg font-bold text-emerald-300">Qtl/Acre</span>
              </div>
              <p className="text-xs font-bold text-emerald-200">
                ± {yieldModel.confidenceMarginQuintals} Qtl Margin • Total Plot: <strong className="text-white text-sm">{yieldModel.totalPredictedHarvest} Quintals</strong>
              </p>
            </div>

            {/* Delta vs Regional Benchmark */}
            <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 font-medium">District 5-Yr Baseline:</span>
                <span className="font-bold text-white">{yieldModel.baselineHistoricalAvg} Qtl/Acre</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 font-medium">Plot Outperformance Delta:</span>
                <span className="font-black text-emerald-300 text-sm">+{yieldModel.yieldDeltaPercent}% Above Avg</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                <span className="text-emerald-100 font-medium">Predicted Harvest Window:</span>
                <span className="font-bold text-amber-300">{yieldModel.predictedHarvestWindow}</span>
              </div>
            </div>

            {/* Revenue Projection */}
            <div className="p-4 bg-[#FAF3E0] rounded-2xl text-[#11281E] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7F5539] block">
                Estimated Farm Gate Gross Revenue
              </span>
              <div className="text-xl font-black text-[#1B4332]">
                ₹{yieldModel.estimatedGrossRevenueMin.toLocaleString('en-IN')} – ₹{yieldModel.estimatedGrossRevenueMax.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-[#4D6B53] font-bold">
                Based on current KrishiSetu Reverse Auction floor rates.
              </p>
            </div>

            {/* Direct Link to Reverse Auction Button */}
            <button
              id="list-crop-to-reverse-auction-btn"
              onClick={onNavigateToAuction}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#11281E] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{isHindi ? 'यह उपज रिवर्स-ऑक्शन में लिस्ट करें' : 'List This Yield in Live Reverse-Auction'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Model Weights Breakdown */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#2D5A27]" />
              <span>Multi-Factor Regression Model Weights</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#4D6B53]">Sentinel-2 NDVI Peak Biomass (40%):</span>
                  <span className="text-[#11281E]">0.84 NDVI</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#4D6B53]">Thermal GDD Accumulation (25%):</span>
                  <span className="text-[#11281E]">1,240 GDD</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-[#4D6B53]">Soil Organic Carbon & Nitrogen (20%):</span>
                  <span className="text-[#11281E]">{selectedPlot.soilOrganicCarbon}% SOC</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Agronomy Advisory */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isHindi ? 'सैटेलाइट समर्थित कृषि परामर्श' : 'Satellite Agronomy Advisory'}</span>
            </h4>

            <ul className="space-y-2.5">
              {yieldModel.actionableAdvisory.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2C4A38] font-medium leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
