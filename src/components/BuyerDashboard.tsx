import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  ShoppingBag,
  TrendingUp,
  Users,
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Menu,
  Clock,
  Wheat,
  Truck,
  DollarSign,
  ChevronRight,
  Eye,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AppRoute, UserProfile, CropListing, Order } from '../types';
import { Marketplace } from './Marketplace';
import { BuyerOrders } from './BuyerOrders';
import { MarketIntelligence } from './MarketIntelligence';
import { ReverseAuctionRoom } from './ReverseAuctionRoom';
import { GroupBulkBundling } from './GroupBulkBundling';
import { QualityBatchScoreDemo } from './QualityBatchScoreDemo';
import { QualityScoreBadge } from './QualityScoreBadge';
import { QualityScoreBreakdownModal } from './QualityScoreBreakdownModal';
import { getCropQualityScore } from '../utils/qualityScorer';
import { MobileBottomNav } from './common/MobileBottomNav';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { subscribeToCropListings } from '../lib/firebase';

interface BuyerDashboardProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onNavigate: (route: AppRoute) => void;
  orders: Order[];
  onCancelOrder?: (orderId: string, reason: string) => void;
  onPlaceOrder?: (cropId: string, quantity: number, deliveryAddress: string) => void;
  onOpenVoiceAssistant?: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigate,
  orders,
  onCancelOrder,
  onPlaceOrder,
  onOpenVoiceAssistant,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [crops, setCrops] = useState<CropListing[]>(INITIAL_MARKETPLACE_CROPS);
  const [inspectingCrop, setInspectingCrop] = useState<CropListing | null>(null);

  useEffect(() => {
    const unsub = subscribeToCropListings((updated) => {
      if (updated && updated.length > 0) {
        setCrops(updated);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  // Buyer bids state
  const [bids, setBids] = useState<Array<{
    id: string;
    cropId: string;
    cropName: string;
    farmerName: string;
    askingPrice: number;
    offeredPrice: number;
    quantity: number;
    unit: string;
    status: 'Pending Farmer Confirmation' | 'Accepted' | 'Declined';
    date: string;
    notes?: string;
  }>>([
    {
      id: 'BID-2026-881',
      cropId: 'KS-WHEAT-8821',
      cropName: 'Sharbati Premium Wheat (शरबती गेहूं)',
      farmerName: 'Ramesh Patel',
      askingPrice: 2600,
      offeredPrice: 2580,
      quantity: 120,
      unit: 'Quintals',
      status: 'Pending Farmer Confirmation',
      date: '28 Aug 2026',
      notes: 'Immediate dispatch requested via Indore central hub.'
    },
    {
      id: 'BID-2026-772',
      cropId: 'KS-MSTRD-7740',
      cropName: 'Yellow Mustard Seeds (पीली सरसों)',
      farmerName: 'Suresh Sharma',
      askingPrice: 5450,
      offeredPrice: 5400,
      quantity: 40,
      unit: 'Quintals',
      status: 'Pending Farmer Confirmation',
      date: '27 Aug 2026',
      notes: 'Standard mill grade batch with oil content certificate.'
    }
  ]);

  const buyerName = currentUser?.name || 'AgroFoods Procurement Hub';
  const location = currentUser?.location || 'Azadpur Mandi, Delhi NCR';

  // Handle Make Offer from marketplace
  const handleMakeOffer = (cropId: string, offeredPrice: number, quantity: number, notes: string) => {
    const targetCrop = crops.find(c => c.id === cropId);
    const newBid = {
      id: `BID-${Math.floor(1000 + Math.random() * 9000)}`,
      cropId,
      cropName: targetCrop?.cropName || 'Farm Harvest Batch',
      farmerName: targetCrop?.farmerName || 'Farmer',
      askingPrice: targetCrop?.expectedPrice || offeredPrice,
      offeredPrice,
      quantity,
      unit: targetCrop?.unit || 'Quintals',
      status: 'Pending Farmer Confirmation' as const,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes
    };

    setBids([newBid, ...bids]);
    setCrops(crops.map(c => c.id === cropId ? { ...c, status: 'Under Offer', inquiriesCount: (c.inquiriesCount || 0) + 1 } : c));
    showSuccess(
      isHindi ? 'बोली / प्रस्ताव भेजा गया!' : 'Offer Submitted!',
      isHindi ? `किसान ${newBid.farmerName} को ₹${offeredPrice}/क्विंटल का प्रस्ताव भेजा गया है।` : `Sent bid of ₹${offeredPrice}/Qtl to ${newBid.farmerName}.`
    );
  };

  // Handle Place Order from marketplace
  const handleMarketplacePlaceOrder = (cropId: string, quantity: number, deliveryAddress: string) => {
    if (onPlaceOrder) {
      onPlaceOrder(cropId, quantity, deliveryAddress);
    }
    setActiveTab('my-orders');
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected').length;
  const activeOrdersVolume = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((acc, o) => acc + o.quantity, 0);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] flex flex-col md:flex-row pb-20 md:pb-8">
      {/* Reusable Sidebar Component */}
      <Sidebar
        role="buyer"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
        onSwitchRole={onNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenVoiceAssistant={onOpenVoiceAssistant}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-[#1B4332]/15 mb-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1B4332]" />
            <div>
              <span className="font-black uppercase tracking-wider text-xs text-[#11281E] block">
                {isHindi ? 'व्यापारी खरीद केंद्र' : 'Buyer Hub Menu'}
              </span>
              <span className="text-[10px] text-[#4D6B53] font-bold">
                {isHindi ? 'कृषि सेतु - प्रत्यक्ष खरीद' : 'KrishiSetu Direct Sourcing'}
              </span>
            </div>
          </div>
          <button
            id="buyer-dashboard-menu-open-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="py-2.5 px-4 bg-[#1B4332] text-[#FAF3E0] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-[#1B4332] min-h-[44px]"
          >
            <Menu className="w-4 h-4" />
            <span>{isHindi ? 'मेनू' : 'Menu'}</span>
          </button>
        </div>

        {/* Buyer Welcome Header Banner */}
        <div className="bg-[#1B4332] text-white rounded-[32px] p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden border-2 border-[#1B4332]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A27] text-[#FAF3E0] text-xs font-black uppercase tracking-wider mb-3 border border-[#FAF3E0]/30">
              <ShieldCheck className="w-4 h-4 text-[#FAF3E0]" />
              <span>{isHindi ? 'प्रमाणित थोक खरीदार (Verified Buyer)' : 'Verified Wholesale Buyer'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {isHindi ? `स्वागत है, ${buyerName}!` : `Welcome, ${buyerName}!`}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#FAF3E0] font-bold max-w-2xl">
              {isHindi 
                ? 'सीधे सत्यापित किसान समूहों से ताजा फसल खरीदें, गुणवत्ता रिपोर्ट देखें और सुरक्षित एस्क्रो द्वारा भुगतान करें।'
                : 'Source harvest batches directly from verified farmer clusters with zero intermediary markups.'}
            </p>
            <p className="mt-3 text-xs text-[#D8E6D3] font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FAF3E0]" />
              <span>{location} • {isHindi ? 'सक्रिय सीधा कृषि विनिमय' : 'Active Direct Sourcing Exchange'}</span>
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
            <Building2 className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                id="buyer-metric-orders"
                onClick={() => setActiveTab('my-orders')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'सक्रिय खरीद ऑर्डर' : 'Active Orders'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">
                  {activeOrdersCount} {isHindi ? 'चालू' : 'Active'}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  {activeOrdersVolume} {isHindi ? 'क्विंटल माल प्रक्रिया में' : 'Quintals in pipeline'}
                </p>
              </div>

              <div 
                id="buyer-metric-bids"
                onClick={() => setActiveTab('bids')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'सीधी बोलियां / मोलभाव' : 'Open Farm Bids'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center border border-[#E8D5B5]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">
                  {bids.length} {isHindi ? 'सक्रिय बोलियां' : 'Active Bids'}
                </div>
                <p className="text-xs text-[#8C6228] mt-1 font-black uppercase tracking-wider">
                  {isHindi ? 'सीधी किसान बातचीत' : 'Direct negotiation'}
                </p>
              </div>

              <div 
                id="buyer-metric-farmers"
                onClick={() => setActiveTab('verified-farmers')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'सत्यापित किसान समूह' : 'Connected Farmers'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">
                  18 {isHindi ? 'एफपीओ समितियां' : 'Farm FPOs'}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  {isHindi ? 'मध्य भारत क्षेत्र' : 'Across Central India'}
                </p>
              </div>

              <div 
                id="buyer-metric-logistics"
                onClick={() => setActiveTab('browse-produce')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'उपलब्ध स्टॉक' : 'Live Exchange'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <Store className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">
                  {crops.length} {isHindi ? 'फसल लॉट' : 'Batches'}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  {isHindi ? 'बाज़ार ब्राउज़ करें →' : 'Explore Marketplace →'}
                </p>
              </div>
            </div>

            {/* QUALITY-VERIFIED BATCH SCORE HIGHLIGHT BANNER */}
            <div
              id="buyer-quality-score-banner"
              onClick={() => setActiveTab('batch-quality-score')}
              className="bg-[#1B4332] text-white p-6 rounded-[28px] border-2 border-emerald-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-[#153427] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-[#1B4332] flex items-center justify-center font-black shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-200">
                      Sight-Unseen Trust Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9622F] text-white">
                      FastAPI Verified
                    </span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">
                    {isHindi ? 'प्रमाणित गुणवत्ता बैच स्कोर (A-Grade Lots)' : 'Quality-Verified Batch Scores'}
                  </h4>
                  <p className="text-xs text-emerald-100 font-medium max-w-xl">
                    {isHindi
                      ? 'बिना भौतिक निरीक्षण के थोक खरीद करें। ताज़गी, विश्वसनीयता, खरीदार रेटिंग व एआई विज़न स्कोर देखें।'
                      : 'Purchase bulk harvest lots sight-unseen with mathematical scores across Freshness, Reliability, Ratings & Vision.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <span>{isHindi ? 'बैच स्कोर जांचें' : 'Inspect Scores'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Sourcing Marketplace Preview */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1B4332]/10">
                <h3 className="font-black uppercase tracking-tight text-lg text-[#11281E] flex items-center gap-2">
                  <Store className="w-6 h-6 text-[#1B4332]" />
                  <span>{isHindi ? 'तुरंत खरीद के लिए उपलब्ध फसल लॉट' : 'Featured Farm Batches for Procurement'}</span>
                </h3>
                <button 
                  onClick={() => setActiveTab('browse-produce')}
                  className="py-2.5 px-4 text-xs font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] hover:bg-[#1B4332] hover:text-white rounded-full transition-colors cursor-pointer flex items-center gap-1.5 w-fit min-h-[40px]"
                >
                  <span>{isHindi ? `सभी ${crops.length} लॉट देखें` : `Explore All ${crops.length} Batches`}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.slice(0, 3).map((crop) => {
                  const qScore = getCropQualityScore(crop);
                  return (
                    <div key={crop.id} className="p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col justify-between hover:border-[#1B4332] transition-all relative">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                            {crop.category}
                          </span>
                          <span className="text-xs font-bold text-[#8FA396]">{crop.location.split(',')[0]}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-black text-[#11281E] text-base uppercase">{crop.cropName}</h4>
                            <p className="text-xs text-[#4D6B53] font-bold mt-1">
                              {isHindi ? 'किसान:' : 'Farmer:'} {crop.farmerName || 'Verified Kisan'} • {crop.quantity} {crop.unit}
                            </p>
                          </div>
                          <QualityScoreBadge
                            score={qScore.final_score}
                            grade={qScore.letter_grade}
                            size="sm"
                            onClick={() => setInspectingCrop(crop)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#1B4332]/10 flex items-center justify-between gap-2">
                        <span className="text-base font-black text-[#1B4332]">
                          ₹{crop.expectedPrice.toLocaleString('en-IN')} / {crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectingCrop(crop)}
                            className="text-[11px] bg-[#FAF3E0] text-[#8C6228] px-3 py-2 rounded-full font-black uppercase tracking-wider hover:bg-[#f3ebd3] border border-[#E8D5B5] cursor-pointer"
                          >
                            {isHindi ? 'स्कोर देखें' : 'Inspect Score'}
                          </button>
                          <button 
                            onClick={() => setActiveTab('browse-produce')}
                            className="text-[11px] bg-[#1B4332] text-white px-3 py-2 rounded-full font-black uppercase tracking-wider hover:bg-[#2D5A27] border border-[#1B4332] cursor-pointer"
                          >
                            {isHindi ? 'खरीदें' : 'Procure'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT MARKETPLACE */}
        {activeTab === 'browse-produce' && (
          <Marketplace
            currentUser={currentUser}
            cropListings={crops}
            onMakeOffer={handleMakeOffer}
            onPlaceOrder={handleMarketplacePlaceOrder}
          />
        )}

        {/* TAB 3: PROCUREMENT ORDERS */}
        {activeTab === 'my-orders' && (
          <BuyerOrders
            orders={orders}
            currentUser={currentUser}
            onBrowseProduce={() => setActiveTab('browse-produce')}
            onCancelOrder={onCancelOrder}
          />
        )}

        {/* TAB 4: DIRECT BIDS */}
        {activeTab === 'bids' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#1B4332]" />
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                      {isHindi ? 'सीधी बोली व मोलभाव' : 'Direct Farm Bids'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#4D6B53] font-bold mt-1">
                    {isHindi ? 'किसान समूहों के साथ पारदर्शी और सीधी मूल्य बातचीत।' : 'Transparent price discovery directly between your business and farm clusters.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('browse-produce')}
                  className="py-3 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isHindi ? 'नया फसल प्रस्ताव दें' : 'Make New Crop Offer'}</span>
                </button>
              </div>

              <div className="space-y-4 mt-6">
                {bids.map((bid) => (
                  <div key={bid.id} className="p-6 rounded-[28px] border-2 border-[#1B4332]/15 bg-[#F8FAF5]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1B4332]/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#8FA396]">Bid #{bid.id}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                            {bid.status}
                          </span>
                        </div>
                        <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base mt-2">
                          {bid.cropName} ({bid.quantity} {bid.unit})
                        </h4>
                        <p className="text-xs text-[#4D6B53] font-bold">{isHindi ? 'किसान:' : 'Farmer:'} {bid.farmerName} • {bid.date}</p>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs text-[#4D6B53] font-bold">
                          {isHindi ? 'किसान मांग:' : 'Asking:'} <span className="line-through">₹{bid.askingPrice}</span>
                        </div>
                        <div className="text-xl font-black text-[#1B4332]">
                          {isHindi ? 'आपका प्रस्ताव:' : 'Your Offer:'} ₹{bid.offeredPrice.toLocaleString('en-IN')} / {bid.unit ? bid.unit.replace(/s$/, '') : 'Qtl'}
                        </div>
                        <span className="text-xs font-bold text-[#8C6228]">
                          {isHindi ? 'कुल राशि:' : 'Total:'} ₹{(bid.offeredPrice * bid.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {bid.notes && (
                      <p className="text-xs text-[#4D6B53] font-medium pt-3 italic">
                        "{bid.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: REVERSE AUCTION FLOOR */}
        {activeTab === 'reverse-auction' && (
          <ReverseAuctionRoom currentUser={currentUser} userRole="buyer" />
        )}

        {/* TAB 5: MARKET INTELLIGENCE */}
        {activeTab === 'market-intelligence' && (
          <MarketIntelligence currentUser={currentUser} />
        )}

        {/* TAB 6: VERIFIED FARMERS */}
        {activeTab === 'verified-farmers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="pb-6 border-b-2 border-[#1B4332]/10">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#1B4332]" />
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'प्रमाणित किसान व एफपीओ सूची' : 'Verified Farmer Directory'}
                  </h2>
                </div>
                <p className="text-xs text-[#4D6B53] font-bold mt-1">
                  {isHindi ? 'प्रमाणित किसान सहकारी समितियों से दीर्घकालिक आपूर्ति संबंध स्थापित करें।' : 'Build long-term direct sourcing relationships with certified grower cooperatives.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-6 rounded-[28px] border-2 border-[#1B4332]/15 bg-[#F8FAF5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                      {isHindi ? 'एफपीओ सहकारी समिति' : 'FPO Cooperative'}
                    </span>
                    <span className="text-xs font-bold text-[#8FA396]">240 {isHindi ? 'किसान सदस्य' : 'Members'}</span>
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base">Malwa Kisan Producer Org</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">Ujjain, MP • Wheat, Soybean, Garlic</p>
                  <button
                    onClick={() => setActiveTab('browse-produce')}
                    className="w-full py-3 px-4 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-2xl text-xs font-black uppercase tracking-wider border-2 border-[#1B4332]/20 min-h-[44px]"
                  >
                    {isHindi ? 'उपलब्ध फसल लॉट देखें' : 'View Harvest Batches'}
                  </button>
                </div>

                <div className="p-6 rounded-[28px] border-2 border-[#1B4332]/15 bg-[#F8FAF5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                      {isHindi ? 'व्यक्तिगत किसान' : 'Individual Grower'}
                    </span>
                    <span className="text-xs font-bold text-[#8FA396]">25 Acres</span>
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base">Ramesh Patel & Sons Farm</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">Ujjain, MP • Certified Sharbati Wheat</p>
                  <button
                    onClick={() => setActiveTab('browse-produce')}
                    className="w-full py-3 px-4 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-2xl text-xs font-black uppercase tracking-wider border-2 border-[#1B4332]/20 min-h-[44px]"
                  >
                    {isHindi ? 'उपलब्ध फसल लॉट देखें' : 'View Harvest Batches'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BULK BUNDLES (WHOLESALE LOTS) */}
        {activeTab === 'group-bundling' && (
          <GroupBulkBundling
            currentUser={currentUser}
            onNavigateToMarketplace={() => setActiveTab('browse-produce')}
          />
        )}

        {/* TAB: QUALITY-VERIFIED BATCH SCORE */}
        {activeTab === 'batch-quality-score' && (
          <QualityBatchScoreDemo
            currentUser={currentUser}
            onNavigateToAuction={() => setActiveTab('reverse-auction')}
            onNavigateToMarketplace={() => setActiveTab('browse-produce')}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
      />

      {/* Quality Score Breakdown Modal */}
      <QualityScoreBreakdownModal
        isOpen={!!inspectingCrop}
        onClose={() => setInspectingCrop(null)}
        crop={inspectingCrop}
        onMakeOffer={(cropId) => {
          setActiveTab('browse-produce');
        }}
        onPlaceOrder={(cropId) => {
          setActiveTab('browse-produce');
        }}
      />
    </div>
  );
};
