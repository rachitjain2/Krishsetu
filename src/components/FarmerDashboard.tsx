import React, { useState } from 'react';
import {
  Wheat,
  Tractor,
  Bot,
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  ShieldCheck,
  AlertCircle,
  Menu,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  IndianRupee,
  Truck,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Eye,
  Share2,
  X,
  User,
  Store,
  ChevronRight,
  FileText,
  BadgeCheck,
  Check,
  Droplets,
  Sun,
  CloudSun
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MyCrops } from './MyCrops';
import { Marketplace } from './Marketplace';
import { FarmerOrders } from './FarmerOrders';
import { AICropAdvisor } from './AICropAdvisor';
import { MachineryRental } from './MachineryRental';
import { MarketIntelligence } from './MarketIntelligence';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { AppRoute, UserProfile, CropListing, Order, BuyerOffer, FarmerOrder } from '../types';

interface FarmerDashboardProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onNavigate: (route: AppRoute) => void;
  orders: Order[];
  onAcceptOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string, reason: string) => void;
  onMarkInTransit?: (orderId: string, vehicleNumber: string, driverName?: string, driverPhone?: string) => void;
  onMarkCompleted?: (orderId: string) => void;
}

// Initial realistic demo crop listings
const INITIAL_CROPS: CropListing[] = [
  {
    id: 'KS-WHEAT-8821',
    cropName: 'Sharbati Premium Wheat',
    hindiName: 'शरबती प्रीमियम गेहूं',
    category: 'Grains & Cereals',
    variety: 'C-306 Desi Sharbati',
    quantity: 120,
    unit: 'Quintals',
    expectedPrice: 2600,
    mandiBenchmarkPrice: 2275,
    location: 'Ujjain Cluster, Madhya Pradesh',
    harvestDate: '2026-03-15',
    qualityGrade: 'Grade A+ (Premium Export)',
    description: 'Naturally sun-dried harvest. Moisture content tested at 10.2%. Stored in clean, moisture-proof jute bags at warehouse.',
    status: 'Active',
    inquiriesCount: 2,
    bestOfferPerQuintal: 2580,
    clusterLocation: 'Ujjain Cluster, MP',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'KS-MSTRD-7740',
    cropName: 'Yellow Mustard Seed',
    hindiName: 'पीली सरसों (उच्च तेल मात्रा)',
    category: 'Oilseeds',
    variety: 'Pusa Bold / NRCHB-101',
    quantity: 40,
    unit: 'Quintals',
    expectedPrice: 5450,
    mandiBenchmarkPrice: 5650,
    location: 'Ujjain Cluster, Madhya Pradesh',
    harvestDate: '2026-02-20',
    qualityGrade: 'Grade A (Standard Mill)',
    description: 'High oil yield (>42% oil content). Clean, machine-graded seed batch free from dust or extraneous matter.',
    status: 'Under Offer',
    inquiriesCount: 1,
    bestOfferPerQuintal: 5400,
    clusterLocation: 'Ujjain Cluster, MP',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'KS-CHANA-3309',
    cropName: 'Desi Chana (Bengal Gram)',
    hindiName: 'देसी चना (दाल ग्रेड)',
    category: 'Pulses & Dal',
    variety: 'JG-11 Desi',
    quantity: 25,
    unit: 'Quintals',
    expectedPrice: 4900,
    mandiBenchmarkPrice: 4750,
    location: 'Malwa FPO Hub, Madhya Pradesh',
    harvestDate: '2026-03-02',
    qualityGrade: 'Grade A+ (Premium Export)',
    description: 'Uniform grain size, unpolished, zero pest infestation. Moisture level 9.5%. Ideal for wholesale dal mills.',
    status: 'Active',
    inquiriesCount: 1,
    bestOfferPerQuintal: 4850,
    clusterLocation: 'Malwa FPO Hub, MP',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  },
];

// Initial realistic demo orders
const INITIAL_ORDERS: FarmerOrder[] = [
  {
    id: 'PO-2026-991',
    buyerName: 'Vikram Singhania',
    buyerCompany: 'AgroFoods Processing Hub Pvt Ltd',
    buyerLocation: 'Indore Mandi Hub, MP',
    cropName: '100 Qtl Sharbati Premium Wheat',
    quantityQuintals: 100,
    agreedPricePerQuintal: 2600,
    totalAmount: 260000,
    status: 'In Transit',
    orderDate: '26 Aug 2026',
    deliveryDate: '29 Aug 2026',
    vehicleNumber: 'MP-09-AB-1234 (E-Way: #88392)',
    escrowStatus: 'Protected',
  },
  {
    id: 'PO-2026-842',
    buyerName: 'Gaurav Aggarwal',
    buyerCompany: 'Shree Ganesh Oil Industries',
    buyerLocation: 'Alwar & Delhi Wholesale Mandi',
    cropName: '40 Qtl Yellow Mustard Seed',
    quantityQuintals: 40,
    agreedPricePerQuintal: 5400,
    totalAmount: 216000,
    status: 'Pickup Scheduled',
    orderDate: '27 Aug 2026',
    deliveryDate: '30 Aug 2026',
    vehicleNumber: 'Driver: Rajesh Verma (Truck #RJ-02-CD-5678)',
    escrowStatus: 'Protected',
  },
  {
    id: 'PO-2026-720',
    buyerName: 'Kailash Chand',
    buyerCompany: 'Kisan Setu Wholesale Escrow',
    buyerLocation: 'Ujjain Central Mandi',
    cropName: '25 Qtl Desi Chana (Bengal Gram)',
    quantityQuintals: 25,
    agreedPricePerQuintal: 4900,
    totalAmount: 122500,
    status: 'Completed',
    orderDate: '20 Aug 2026',
    deliveryDate: '25 Aug 2026',
    vehicleNumber: 'Completed via Hub Depot #04',
    escrowStatus: 'Released',
  },
];

// Realistic demo buyer offers
const INITIAL_OFFERS: BuyerOffer[] = [
  {
    id: 'OFFER-101',
    buyerName: 'Vikram Singhania',
    company: 'AgroFoods Processing Hub',
    cropName: 'Sharbati Premium Wheat',
    offeredPrice: 2580,
    askingPrice: 2600,
    quantityRequested: 80,
    pickupLocation: 'Direct Farm Gate / Mandi Platform 3',
    paymentTerms: '100% Instant Escrow upon Digital Weighing',
    status: 'Pending',
    receivedTime: '2 hours ago',
  },
  {
    id: 'OFFER-102',
    buyerName: 'Deepak Mehrotra',
    company: 'Golden Harvest Flour Mills',
    cropName: 'Sharbati Premium Wheat',
    offeredPrice: 2590,
    askingPrice: 2600,
    quantityRequested: 100,
    pickupLocation: 'Farm Gate Loading Hub',
    paymentTerms: 'KrishiSetu Escrow Protected',
    status: 'Pending',
    receivedTime: '5 hours ago',
  },
  {
    id: 'OFFER-103',
    buyerName: 'Gaurav Aggarwal',
    company: 'Shree Ganesh Oil Industries',
    cropName: 'Yellow Mustard Seed',
    offeredPrice: 5400,
    askingPrice: 5450,
    quantityRequested: 40,
    pickupLocation: 'Ujjain FPO Storage 2',
    paymentTerms: 'Direct NEFT/UPI via Verified Escrow',
    status: 'Pending',
    receivedTime: '1 day ago',
  },
];

// Demo mandi market benchmark prices
const DEMO_MANDI_PRICES = [
  { crop: 'Wheat (Sharbati)', hindi: 'शरबती गेहूं', mandi: 'Ujjain Mandi', current: 2610, msp: 2275, trend: '+₹45 today', high: 2680, low: 2540 },
  { crop: 'Mustard (Yellow)', hindi: 'पीली सरसों', mandi: 'Kota & Alwar Mandi', current: 5450, msp: 5650, trend: '+₹80 today', high: 5520, low: 5380 },
  { crop: 'Desi Chana (Gram)', hindi: 'देसी चना', mandi: 'Indore Mandi', current: 4920, msp: 4750, trend: '+₹30 today', high: 5010, low: 4860 },
  { crop: 'Soybean (Yellow)', hindi: 'सोयाबीन (पीला)', mandi: 'Dewas Mandi', current: 4420, msp: 4600, trend: '-₹15 today', high: 4500, low: 4380 },
  { crop: 'Garlic (Desi)', hindi: 'देसी लहसुन', mandi: 'Neemuch Mandi', current: 14500, msp: 11000, trend: '+₹250 today', high: 16000, low: 13800 },
];

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigate,
  orders: propOrders,
  onAcceptOrder,
  onRejectOrder,
  onMarkInTransit,
  onMarkCompleted,
}) => {
  // Support both 'dashboard' and legacy 'overview'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dynamic state for crop listings & interactive modals
  const [cropListings, setCropListings] = useState<CropListing[]>(INITIAL_CROPS);
  const [offers, setOffers] = useState<BuyerOffer[]>(INITIAL_OFFERS);

  // Use orders from props
  const orders = propOrders || [];

  // Modals & form state
  const [isListCropModalOpen, setIsListCropModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<BuyerOffer | null>(null);
  const [listingSuccessMessage, setListingSuccessMessage] = useState('');
  const [farmerMarketplaceSubTab, setFarmerMarketplaceSubTab] = useState<'offers' | 'all-crops'>('offers');

  // New crop form state
  const [newCropName, setNewCropName] = useState('Wheat (शरबती गेहूं)');
  const [newVariety, setNewVariety] = useState('C-306 Sharbati Grade-A');
  const [newQuantity, setNewQuantity] = useState('60');
  const [newPrice, setNewPrice] = useState('2650');
  const [newMoisture, setNewMoisture] = useState('10.0');
  const [newGrade, setNewGrade] = useState<'A+' | 'A' | 'B+'>('A+');

  const farmerName = currentUser?.name || 'Ramesh Patel';
  const location = currentUser?.location || 'Ujjain, Madhya Pradesh';

  // Handle new crop submission
  const handleCreateCropListing = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newQuantity) || 50;
    const price = parseFloat(newPrice) || 2500;
    const moisture = parseFloat(newMoisture) || 10.5;

    const newListing: CropListing = {
      id: `KS-LIST-${Math.floor(1000 + Math.random() * 9000)}`,
      cropName: newCropName.split('(')[0].trim(),
      hindiName: newCropName.includes('(') ? newCropName.split('(')[1].replace(')', '') : 'ताज़ा फसल',
      category: 'Grains & Cereals',
      variety: newVariety,
      quantity: qty,
      unit: 'Quintals',
      expectedPrice: price,
      mandiBenchmarkPrice: Math.round(price * 0.92),
      location: location,
      harvestDate: new Date().toISOString().split('T')[0],
      qualityGrade: newGrade === 'A+' ? 'Grade A+ (Premium Export)' : newGrade === 'A' ? 'Grade A (Standard Mill)' : 'Grade B+ (Fair Average Quality)',
      description: `Direct farm stock harvested from ${location}. Moisture tested at ${moisture}%.`,
      status: 'Active',
      inquiriesCount: 0,
      clusterLocation: `${location.split(',')[0]} Cluster, MP`,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    };

    setCropListings([newListing, ...cropListings]);
    setIsListCropModalOpen(false);
    setListingSuccessMessage(`Successfully listed ${qty} Quintals of ${newListing.cropName}! It is now visible to 400+ verified buyers.`);
    setTimeout(() => setListingSuccessMessage(''), 6000);
  };

  // Handle Offer Accept / Decline
  const handleAcceptOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    setOffers(offers.filter(o => o.id !== offerId));
    setSelectedOffer(null);
    setListingSuccessMessage(`Offer from ${offer.company} accepted! Escrow amount of ₹${(offer.quantityRequested * offer.offeredPrice).toLocaleString('en-IN')} has been locked in escrow.`);
    setTimeout(() => setListingSuccessMessage(''), 6000);
  };

  const handleDeclineOffer = (offerId: string) => {
    setOffers(offers.filter(o => o.id !== offerId));
    setSelectedOffer(null);
  };

  // Normalized active tab helper (handles both 'overview' and 'dashboard')
  const currentTab = activeTab === 'overview' ? 'dashboard' : activeTab;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] flex flex-col md:flex-row">
      {/* Reusable Sidebar Component with all 8 items */}
      <Sidebar
        role="farmer"
        activeTab={currentTab}
        onSelectTab={(tab) => setActiveTab(tab)}
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
            <Wheat className="w-5 h-5 text-[#1B4332]" />
            <span className="font-black uppercase tracking-wider text-xs text-[#11281E]">Farmer Dashboard</span>
          </div>
          <button
            id="farmer-dashboard-menu-open-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="py-2 px-3 bg-[#1B4332] text-[#E8D5B5] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#1B4332]"
          >
            <Menu className="w-4 h-4" />
            <span>Open Menu</span>
          </button>
        </div>

        {/* Global Toast Notification */}
        {listingSuccessMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
              <p className="text-xs sm:text-sm font-black text-[#11281E]">{listingSuccessMessage}</p>
            </div>
            <button
              onClick={() => setListingSuccessMessage('')}
              className="text-[#4D6B53] hover:text-[#11281E] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. WELCOME SECTION FOR THE FARMER */}
        <div className="bg-[#1B4332] text-white rounded-[32px] p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden border-2 border-[#1B4332]">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A27] text-[#E8D5B5] text-[10px] font-black uppercase tracking-widest border border-[#E8D5B5]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E8D5B5]" />
                <span>Verified Kisan • प्रमाणित किसान</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold">
                <Sun className="w-3.5 h-3.5 text-[#E8D5B5]" />
                <span>Ujjain: 29°C Sunny • Ideal Harvest Weather</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Namaste, {farmerName}! (नमस्ते)
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#E8D5B5] font-bold max-w-3xl leading-relaxed">
              Your direct agricultural portal is active. Manage your harvest batches, review verified wholesale buyer bids, access farm equipment, and track digital escrow payments with zero middleman commissions.
            </p>

            <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#D8E6D3] font-bold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8D5B5]" />
                <span>{location} • 12.5 Acres (Malwa FPO Cluster)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#E8D5B5]" />
                <span>Mandi Benchmark: Wheat @ ₹2,610/Qtl (+₹335 above MSP)</span>
              </span>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
            <Wheat className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* 6, 7, 8, 9. PROMINENT QUICK ACTIONS BAR */}
        <div className="mb-6 p-4 sm:p-5 bg-white rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C6228]" />
              <span>Quick Farm Actions / मुख्य किसान सेवाएं</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396]">Instant Execution</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 6. List New Crop button */}
            <button
              id="btn-list-new-crop"
              onClick={() => setIsListCropModalOpen(true)}
              className="p-3 sm:p-4 rounded-2xl bg-[#1B4332] text-white hover:bg-[#2D5A27] transition-all flex flex-col items-start justify-between shadow-xs border-2 border-[#1B4332] group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2D5A27] text-[#E8D5B5] flex items-center justify-center mb-2 border border-[#E8D5B5]/20 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-white">List New Crop</span>
                <span className="block text-[9px] text-[#E8D5B5] font-bold mt-0.5">नई फसल जोड़ें</span>
              </div>
            </button>

            {/* 7. Find Buyers button */}
            <button
              id="btn-find-buyers"
              onClick={() => setActiveTab('marketplace')}
              className="p-3 sm:p-4 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/20 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center mb-2 border border-[#1B4332]/20 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-[#11281E]">Find Buyers</span>
                <span className="block text-[9px] text-[#4D6B53] font-bold mt-0.5">व्यापारी व मिल खोजें</span>
              </div>
            </button>

            {/* 8. AI Crop Advisor button */}
            <button
              id="btn-ai-crop-advisor"
              onClick={() => setActiveTab('advisory')}
              className="p-3 sm:p-4 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/20 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center mb-2 border border-[#1B4332]/20 group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-[#11281E]">AI Crop Advisor</span>
                <span className="block text-[9px] text-[#4D6B53] font-bold mt-0.5">स्मार्ट फसल सलाह</span>
              </div>
            </button>

            {/* 9. Rent Machinery button */}
            <button
              id="btn-rent-machinery"
              onClick={() => setActiveTab('machinery')}
              className="p-3 sm:p-4 rounded-2xl bg-white text-[#11281E] hover:bg-[#FAF3E0] transition-all flex flex-col items-start justify-between border-2 border-[#E8D5B5] group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center mb-2 border border-[#E8D5B5] group-hover:scale-105 transition-transform">
                <Tractor className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black uppercase tracking-tight text-[#11281E]">Rent Machinery</span>
                <span className="block text-[9px] text-[#8C6228] font-bold mt-0.5">ट्रैक्टर व उपकरण</span>
              </div>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD (MAIN OVERVIEW) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 2, 3, 4, 5. FOUR KEY METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 2. Total listed crops */}
              <div
                id="farmer-metric-total-listed-crops"
                onClick={() => setActiveTab('my-crops')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Total Listed Crops</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <Wheat className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {cropListings.length} Crops
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider flex items-center gap-1">
                  <span>{cropListings.reduce((sum, c) => sum + (c.quantity || 0), 0)} {cropListings[0]?.unit || 'Quintals'} Listed</span>
                </p>
              </div>

              {/* 3. Active orders */}
              <div
                id="farmer-metric-active-orders"
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Active Orders</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {orders.filter(o => o.status !== 'Completed').length} Active
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  ₹{orders.filter(o => o.status !== 'Completed').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN')} in fulfillment
                </p>
              </div>

              {/* 4. Pending offers */}
              <div
                id="farmer-metric-pending-offers"
                onClick={() => setActiveTab('marketplace')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Pending Offers</span>
                  <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center border border-[#E8D5B5]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {offers.length} Buyer Offers
                </div>
                <p className="text-xs text-[#8C6228] mt-1 font-black uppercase tracking-wider">
                  Top bid: ₹{Math.max(...offers.map(o => o.offeredPrice), 2580)} / Qtl
                </p>
              </div>

              {/* 5. Estimated earnings */}
              <div
                id="farmer-metric-estimated-earnings"
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-[#4D6B53] uppercase tracking-widest">Estimated Earnings</span>
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  ₹{(orders.reduce((sum, o) => sum + o.totalAmount, 0)).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider flex items-center gap-1">
                  <span>+16.4% above standard MSP</span>
                </p>
              </div>
            </div>

            {/* 10. RECENT CROP LISTINGS SECTION */}
            <div id="recent-crop-listings-section" className="bg-white p-6 sm:p-7 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1B4332]/10">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg text-[#11281E] flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-[#1B4332]" />
                    <span>Recent Crop Listings (हालिया फसल लिस्टिंग)</span>
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                    Live batches available to verified buyers across India with automated quality benchmarking.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-list-crop-from-table"
                    onClick={() => {
                      setActiveTab('my-crops');
                      setIsListCropModalOpen(true);
                    }}
                    className="py-2 px-3.5 bg-[#1B4332] text-[#E8D5B5] hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#1B4332] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>List Crop</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my-crops')}
                    className="py-2 px-3 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#1B4332]/20 transition-colors cursor-pointer"
                  >
                    View All ({cropListings.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cropListings.map((crop) => (
                  <div
                    key={crop.id}
                    className="p-5 rounded-[24px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 hover:border-[#1B4332] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                          {crop.status}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#8FA396]">{crop.id}</span>
                      </div>

                      <h4 className="font-black text-[#11281E] text-base uppercase mt-3">{crop.cropName}</h4>
                      <p className="text-xs text-[#4D6B53] font-bold mt-0.5">{crop.hindiName}</p>

                      <div className="mt-3 py-2 px-3 rounded-xl bg-white border border-[#1B4332]/10 space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>Available Stock:</span>
                          <span className="text-[#11281E] font-black">{crop.quantity} {crop.unit || 'Quintals'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>Asking Base Price:</span>
                          <span className="text-[#1B4332] font-black">₹{crop.expectedPrice.toLocaleString('en-IN')} / {crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>Quality Grade:</span>
                          <span className="text-[#11281E] font-black truncate max-w-[140px]">{crop.qualityGrade}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-[#1B4332]/10 flex items-center justify-between">
                      <div className="text-xs font-bold text-[#4D6B53]">
                        {crop.inquiriesCount && crop.inquiriesCount > 0 ? (
                          <span className="text-[#8C6228] font-black flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{crop.inquiriesCount} Inquiries Received</span>
                          </span>
                        ) : (
                          <span className="text-[#8FA396]">Live on Exchange</span>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveTab('my-crops')}
                        className="text-xs font-black uppercase tracking-wider text-[#1B4332] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 11. RECENT ORDERS SECTION */}
            <div id="recent-orders-section" className="bg-white p-6 sm:p-7 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1B4332]/10">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg text-[#11281E] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#1B4332]" />
                    <span>Recent Orders & Transit Updates (हालिया ऑर्डर व परिवहन)</span>
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                    Track pickup schedules, weighing certification, and digital escrow payouts directly.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="py-2 px-3.5 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#1B4332]/20 transition-colors self-start sm:self-auto"
                >
                  View All Orders →
                </button>
              </div>

              <div className="space-y-3.5">
                {orders.map((order) => {
                  const isTransit = order.status === 'In Transit';
                  const isScheduled = order.status === 'Pickup Scheduled';
                  const isCompleted = order.status === 'Completed';

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 hover:border-[#1B4332] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              isTransit
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : isScheduled
                                ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                                : 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/20'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#8FA396]">Order #{order.id}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#E8F0E5] text-[#1B4332] px-2 py-0.5 rounded-full border border-[#1B4332]/20">
                            🛡️ Escrow {order.escrowStatus}
                          </span>
                        </div>

                        <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base">
                          {order.cropName}
                        </h4>

                        <p className="text-xs text-[#4D6B53] font-bold">
                          Buyer: <span className="text-[#11281E] font-black">{order.buyerCompany}</span> ({order.buyerName}) • {order.buyerLocation}
                        </p>

                        <p className="text-xs text-[#8FA396] font-bold flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Logistics: {order.vehicleNumber}</span>
                        </p>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-[#1B4332]/10 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Agreed Value</span>
                          <span className="text-lg font-black text-[#11281E]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-[#4D6B53] font-bold block">₹{order.agreedPricePerQuintal} / Qtl</span>
                        </div>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="mt-2 py-1.5 px-3 rounded-full text-xs font-black uppercase tracking-wider bg-[#1B4332] text-white hover:bg-[#2D5A27] transition-colors"
                        >
                          Track Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Buyer Offers Interactive Banner */}
            {offers.length > 0 && (
              <div className="p-6 rounded-[32px] bg-[#FAF3E0] border-2 border-[#E8D5B5] shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#8C6228] text-white flex items-center justify-center font-bold">
                      <TrendingUp className="w-5 h-5 text-[#E8D5B5]" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-tight text-base text-[#11281E]">
                        {offers.length} New Direct Buyer Proposals Awaiting Your Review
                      </h4>
                      <p className="text-xs text-[#5C4520] font-bold">
                        Wholesale buyers have submitted competitive offers directly to your farm batch.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOffer(offers[0])}
                    className="py-2 px-4 bg-[#8C6228] text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#6D4C1D] transition-colors self-start sm:self-auto shadow-xs"
                  >
                    Review Top Offer →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-4 rounded-2xl bg-white border border-[#E8D5B5] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-[#8FA396]">
                          <span>{offer.cropName}</span>
                          <span>{offer.receivedTime}</span>
                        </div>
                        <h5 className="font-black text-[#11281E] text-sm uppercase mt-1">{offer.company}</h5>
                        <p className="text-xs text-[#8C6228] font-black mt-2">
                          Offered: ₹{offer.offeredPrice} / Qtl for {offer.quantityRequested} Qtl
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#E8D5B5]/60 flex gap-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="flex-1 py-1.5 px-2 bg-[#1B4332] text-white rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#2D5A27]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="py-1.5 px-2 bg-[#FAF3E0] text-[#8C6228] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#E8D5B5]"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY CROPS (FULL DETAILED LISTINGS VIEW & LIFECYCLE) */}
        {currentTab === 'my-crops' && (
          <MyCrops
            currentUser={currentUser}
            cropListings={cropListings}
            onAddCrop={(newCrop) => {
              setCropListings([newCrop, ...cropListings]);
            }}
            onUpdateCrop={(updatedCrop) => {
              setCropListings(cropListings.map((c) => (c.id === updatedCrop.id ? updatedCrop : c)));
            }}
            onDeleteCrop={(id) => {
              setCropListings(cropListings.filter((c) => c.id !== id));
            }}
            onToggleSold={(id) => {
              setCropListings(
                cropListings.map((c) => {
                  if (c.id === id) {
                    const nextStatus = c.status === 'Sold' ? 'Active' : 'Sold';
                    return { ...c, status: nextStatus };
                  }
                  return c;
                })
              );
            }}
            onFindBuyers={(cropName) => {
              setActiveTab('marketplace');
            }}
            isAddModalOpenInitially={isListCropModalOpen}
            onCloseAddModal={() => setIsListCropModalOpen(false)}
          />
        )}

        {/* TAB 3: MARKETPLACE (BUYER DEMAND & LIVE PRODUCE EXCHANGE) */}
        {currentTab === 'marketplace' && (
          <div className="space-y-6">
            {/* View Sub-selector */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#1B4332]/15 w-fit">
              <button
                onClick={() => setFarmerMarketplaceSubTab('offers')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  farmerMarketplaceSubTab === 'offers'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#F8FAF5]'
                }`}
              >
                Incoming Buyer Offers ({offers.length})
              </button>
              <button
                onClick={() => setFarmerMarketplaceSubTab('all-crops')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  farmerMarketplaceSubTab === 'all-crops'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#F8FAF5]'
                }`}
              >
                Browse Live Market Exchange
              </button>
            </div>

            {farmerMarketplaceSubTab === 'offers' ? (
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-6 h-6 text-[#1B4332]" />
                      <h2 className="text-2xl font-black uppercase tracking-tight text-[#11281E]">Wholesale Buyer Exchange (थोक खरीदार बाज़ार)</h2>
                    </div>
                    <p className="text-xs text-[#4D6B53] font-bold mt-1">
                      Connect directly with verified agro-processing companies, millers, and corporate procurement houses.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8F0E5] text-[#1B4332] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20">
                    <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                    <span>100% Escrow Protected</span>
                  </div>
                </div>

                {/* Active Buyer Inquiries */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#4D6B53]">Direct Buyer Inquiries for Your Harvest</h3>

                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                            Buyer Offer
                          </span>
                          <span className="text-xs font-bold text-[#8FA396]">{offer.receivedTime}</span>
                        </div>
                        <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base mt-1.5">
                          {offer.company} ({offer.buyerName})
                        </h4>
                        <p className="text-xs text-[#4D6B53] font-bold">
                          Interested Crop: <span className="font-black text-[#11281E]">{offer.cropName}</span> • Requested: {offer.quantityRequested} Quintals
                        </p>
                        <p className="text-xs text-[#8FA396] font-bold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Pickup: {offer.pickupLocation}</span>
                        </p>
                      </div>

                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Offered Rate</span>
                        <span className="text-xl font-black text-[#1B4332]">₹{offer.offeredPrice.toLocaleString('en-IN')} / Qtl</span>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="py-2 px-4 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
                          >
                            Accept Offer
                          </button>
                          <button
                            onClick={() => handleDeclineOffer(offer.id)}
                            className="py-2 px-3 bg-white text-[#4D6B53] hover:text-rose-700 rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Marketplace
                currentUser={currentUser}
                cropListings={INITIAL_MARKETPLACE_CROPS}
              />
            )}
          </div>
        )}

        {/* TAB 4: ORDERS & ESCROW */}
        {currentTab === 'orders' && (
          <FarmerOrders
            orders={orders}
            onAcceptOrder={onAcceptOrder}
            onRejectOrder={onRejectOrder}
            onMarkInTransit={onMarkInTransit}
            onMarkCompleted={onMarkCompleted}
          />
        )}

        {/* TAB 5: AI CROP ADVISOR */}
        {currentTab === 'advisory' && (
          <AICropAdvisor defaultLocation={currentUser?.location} />
        )}

        {/* TAB 6: MACHINERY RENTAL */}
        {currentTab === 'machinery' && (
          <MachineryRental currentUser={currentUser} />
        )}

        {/* TAB 7: MARKET INTELLIGENCE (DEMO MARKET DATA) */}
        {currentTab === 'market-prices' && (
          <MarketIntelligence currentUser={currentUser} />
        )}

        {/* TAB 8: PROFILE */}
        {currentTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="pb-6 border-b-2 border-[#1B4332]/10 flex items-center gap-2">
                <User className="w-6 h-6 text-[#1B4332]" />
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#11281E]">Farmer Profile & Verification (किसान प्रोफ़ाइल)</h2>
                  <p className="text-xs text-[#4D6B53] font-bold">Kisan Credit, Land Holding, and Direct Escrow Bank Details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                    <span>Personal & Farm Land Details</span>
                  </h3>
                  <div className="space-y-2 text-xs font-bold text-[#4D6B53]">
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Full Name:</span>
                      <span className="text-[#11281E] font-black">{farmerName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Registered Phone:</span>
                      <span className="text-[#11281E] font-black">{currentUser?.phone || '+91 98260 12345'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Location / Tehsil:</span>
                      <span className="text-[#11281E] font-black">{location}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Total Land Area:</span>
                      <span className="text-[#11281E] font-black">12.5 Acres (Khasra #142/1)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>FPO Affiliation:</span>
                      <span className="text-[#1B4332] font-black">Malwa Kisan Producer Cooperative</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#2D5A27]" />
                    <span>Direct Payment Settlement Account</span>
                  </h3>
                  <div className="space-y-2 text-xs font-bold text-[#4D6B53]">
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Bank Name:</span>
                      <span className="text-[#11281E] font-black">State Bank of India (SBI)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>Account Number:</span>
                      <span className="text-[#11281E] font-black">•••• •••• 8812 (Verified)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#1B4332]/10">
                      <span>IFSC Code:</span>
                      <span className="text-[#11281E] font-black">SBIN0001234</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Settlement Mode:</span>
                      <span className="text-[#2D5A27] font-black">Instant Escrow Release (T+0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: LIST NEW CROP MODAL */}
        {isListCropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10">
                <div className="flex items-center gap-2">
                  <Wheat className="w-6 h-6 text-[#1B4332]" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">List New Crop Batch (फसल लिस्ट करें)</h3>
                </div>
                <button
                  onClick={() => setIsListCropModalOpen(false)}
                  className="p-1.5 text-[#4D6B53] hover:text-[#11281E] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCropListing} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Crop Type & Name / फसल का प्रकार
                  </label>
                  <select
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Wheat (शरबती गेहूं)">Wheat (शरबती गेहूं)</option>
                    <option value="Mustard (पीली सरसों)">Mustard (पीली सरसों)</option>
                    <option value="Desi Chana (चना दाल)">Desi Chana (चना दाल)</option>
                    <option value="Soybean (पीला सोयाबीन)">Soybean (पीला सोयाबीन)</option>
                    <option value="Garlic (देसी लहसुन)">Garlic (देसी लहसुन)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Variety / किस्म
                  </label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="e.g. C-306 Desi Sharbati"
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      Quantity (Quintals / क्विंटल)
                    </label>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      min="1"
                      className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      Expected Price (₹/Quintal)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. 2600"
                      min="500"
                      className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      Moisture % (नमी)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMoisture}
                      onChange={(e) => setNewMoisture(e.target.value)}
                      placeholder="e.g. 10.5"
                      className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      Quality Grade / गुणवत्ता
                    </label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value as 'A+' | 'A' | 'B+')}
                      className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    >
                      <option value="A+">Grade A+ (Premium Export)</option>
                      <option value="A">Grade A (Standard Mill Grade)</option>
                      <option value="B+">Grade B+ (Fair Average Quality)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#1B4332]/10 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsListCropModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#F8FAF5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider shadow-xs"
                  >
                    Publish to Exchange
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: OFFER DETAILS MODAL */}
        {selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10">
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">Buyer Proposal Details</h3>
                <button onClick={() => setSelectedOffer(null)} className="p-1.5 text-[#4D6B53] hover:text-[#11281E]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs font-bold text-[#4D6B53]">
                <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#8FA396] block">Buyer Company</span>
                  <span className="text-base font-black text-[#11281E] block">{selectedOffer.company}</span>
                  <span className="text-xs text-[#4D6B53]">Representative: {selectedOffer.buyerName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                  <span>Requested Crop:</span>
                  <span className="text-[#11281E] font-black">{selectedOffer.cropName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                  <span>Quantity:</span>
                  <span className="text-[#11281E] font-black">{selectedOffer.quantityRequested} Quintals</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                  <span>Offered Price:</span>
                  <span className="text-base font-black text-[#1B4332]">₹{selectedOffer.offeredPrice} / Qtl</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                  <span>Total Escrow Value:</span>
                  <span className="text-base font-black text-[#11281E]">₹{(selectedOffer.offeredPrice * selectedOffer.quantityRequested).toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2">
                  <span className="block text-[#8FA396] text-[10px] uppercase font-black">Payment Terms:</span>
                  <span className="text-[#2D5A27] font-black">{selectedOffer.paymentTerms}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#1B4332]/10 flex gap-3">
                <button
                  onClick={() => handleDeclineOffer(selectedOffer.id)}
                  className="flex-1 py-3 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:text-rose-700"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAcceptOffer(selectedOffer.id)}
                  className="flex-1 py-3 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider"
                >
                  Accept & Lock Escrow
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
