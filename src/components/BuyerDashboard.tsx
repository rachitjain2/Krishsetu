import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AppRoute, UserProfile, CropListing, Order } from '../types';
import { Marketplace } from './Marketplace';
import { BuyerOrders } from './BuyerOrders';
import { MarketIntelligence } from './MarketIntelligence';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';

interface BuyerDashboardProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onNavigate: (route: AppRoute) => void;
  orders: Order[];
  onCancelOrder?: (orderId: string, reason: string) => void;
  onPlaceOrder?: (cropId: string, quantity: number, deliveryAddress: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigate,
  orders,
  onCancelOrder,
  onPlaceOrder,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [crops, setCrops] = useState<CropListing[]>(INITIAL_MARKETPLACE_CROPS);

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
    // update crop status to 'Under Offer'
    setCrops(crops.map(c => c.id === cropId ? { ...c, status: 'Under Offer', inquiriesCount: (c.inquiriesCount || 0) + 1 } : c));
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
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] flex flex-col md:flex-row">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-[#1B4332]/15 mb-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1B4332]" />
            <span className="font-black uppercase tracking-wider text-xs text-[#11281E]">Buyer Hub Menu</span>
          </div>
          <button
            id="buyer-dashboard-menu-open-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="py-2 px-3 bg-[#1B4332] text-[#E8D5B5] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#1B4332] cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Open Menu</span>
          </button>
        </div>

        {/* Buyer Welcome Header Banner */}
        <div className="bg-[#1B4332] text-white rounded-[32px] p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden border-2 border-[#1B4332]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27] text-[#E8D5B5] text-[10px] font-black uppercase tracking-widest mb-3 border border-[#E8D5B5]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8D5B5]" />
              <span>Verified Wholesale Buyer • प्रमाणित खरीदार</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Welcome, {buyerName}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#E8D5B5] font-bold max-w-2xl">
              Source harvest batches directly from verified farmer clusters with zero intermediary markups.
            </p>
            <p className="mt-2 text-xs text-[#D8E6D3] font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E8D5B5]" />
              <span>{location} • Active Direct Sourcing Exchange</span>
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
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Active Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">{activeOrdersCount} Active</div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  {activeOrdersVolume} Quintals in pipeline
                </p>
              </div>

              <div 
                id="buyer-metric-bids"
                onClick={() => setActiveTab('bids')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Open Farm Bids</span>
                  <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center border border-[#E8D5B5]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">{bids.length} Active Bids</div>
                <p className="text-xs text-[#8C6228] mt-1 font-black uppercase tracking-wider">Direct negotiation</p>
              </div>

              <div 
                id="buyer-metric-farmers"
                onClick={() => setActiveTab('verified-farmers')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Connected Farmers</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">18 Farm FPOs</div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">Across Central India</p>
              </div>

              <div 
                id="buyer-metric-logistics"
                onClick={() => setActiveTab('browse-produce')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Live Exchange</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <Store className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black uppercase tracking-tight text-[#11281E]">{crops.length} Batches</div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">Explore Marketplace →</p>
              </div>
            </div>

            {/* Quick Sourcing Marketplace Preview */}
            <div className="bg-white p-6 sm:p-7 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black uppercase tracking-tight text-base text-[#11281E] flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#1B4332]" />
                  <span>Featured Farm Batches for Immediate Procurement (उपलब्ध फसलें)</span>
                </h3>
                <button 
                  onClick={() => setActiveTab('browse-produce')}
                  className="text-xs font-black uppercase tracking-wider text-[#1B4332] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Explore All {crops.length} Batches</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.slice(0, 3).map((crop) => (
                  <div key={crop.id} className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col justify-between hover:border-[#1B4332] transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2 py-0.5 rounded-full border border-[#1B4332]/20">
                          {crop.category}
                        </span>
                        <span className="text-xs font-bold text-[#8FA396]">{crop.location.split(',')[0]}</span>
                      </div>
                      <h4 className="font-black text-[#11281E] text-sm uppercase">{crop.cropName}</h4>
                      <p className="text-xs text-[#4D6B53] font-bold mt-1">
                        Farmer: {crop.farmerName || 'Verified Kisan'} • {crop.quantity} {crop.unit}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#1B4332]/10 flex items-center justify-between">
                      <span className="text-base font-black text-[#1B4332]">
                        ₹{crop.expectedPrice.toLocaleString('en-IN')} / {crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl'}
                      </span>
                      <button 
                        onClick={() => setActiveTab('browse-produce')}
                        className="text-xs bg-[#1B4332] text-white px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider hover:bg-[#2D5A27] border border-[#1B4332] cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT MARKETPLACE (FULL BROWSE PRODUCE EXPERIENCE) */}
        {activeTab === 'browse-produce' && (
          <Marketplace
            currentUser={currentUser}
            cropListings={crops}
            onMakeOffer={handleMakeOffer}
            onPlaceOrder={handleMarketplacePlaceOrder}
          />
        )}

        {/* TAB 3: PROCUREMENT ORDERS (BUYER ORDERS PAGE) */}
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
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#11281E]">Direct Farm Bids (सीधी बोली व बातचीत)</h2>
                  </div>
                  <p className="text-xs text-[#4D6B53] font-bold mt-1">
                    Transparent price discovery directly between your business and farm clusters.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('browse-produce')}
                  className="py-2.5 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make New Crop Offer</span>
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
                        <p className="text-xs text-[#4D6B53] font-bold">Farmer: {bid.farmerName} • Submitted on {bid.date}</p>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs text-[#4D6B53] font-bold">
                          Asking: <span className="line-through">₹{bid.askingPrice}</span>
                        </div>
                        <div className="text-xl font-black text-[#1B4332]">
                          Your Offer: ₹{bid.offeredPrice.toLocaleString('en-IN')} / {bid.unit ? bid.unit.replace(/s$/, '') : 'Qtl'}
                        </div>
                        <span className="text-xs font-bold text-[#8C6228]">Total: ₹{(bid.offeredPrice * bid.quantity).toLocaleString('en-IN')}</span>
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
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#11281E]">Verified Farmer Directory (प्रमाणित किसान)</h2>
                </div>
                <p className="text-xs text-[#4D6B53] font-bold mt-1">Build long-term direct sourcing relationships with certified grower cooperatives.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-6 rounded-[28px] border-2 border-[#1B4332]/15 bg-[#F8FAF5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">FPO Cooperative</span>
                    <span className="text-xs font-bold text-[#8FA396]">240 Members</span>
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base">Malwa Kisan Producer Org</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">Ujjain, MP • Wheat, Soybean, Garlic</p>
                  <button
                    onClick={() => setActiveTab('browse-produce')}
                    className="w-full py-2 px-3 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20"
                  >
                    View Harvest Batches
                  </button>
                </div>

                <div className="p-6 rounded-[28px] border-2 border-[#1B4332]/15 bg-[#F8FAF5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">Individual Grower</span>
                    <span className="text-xs font-bold text-[#8FA396]">25 Acres</span>
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base">Ramesh Patel & Sons Farm</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">Ujjain, MP • Certified Sharbati Wheat</p>
                  <button
                    onClick={() => setActiveTab('browse-produce')}
                    className="w-full py-2 px-3 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20"
                  >
                    View Harvest Batches
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


