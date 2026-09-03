import React, { useState, useEffect } from 'react';
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
import { MobileBottomNav } from './common/MobileBottomNav';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { AppRoute, UserProfile, CropListing, Order, BuyerOffer, FarmerOrder } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  subscribeToCropListings,
  createCropListing,
  updateCropListing,
  deleteCropListing
} from '../lib/firebase';

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

// Initial realistic demo buyer offers
const INITIAL_OFFERS: BuyerOffer[] = [
  {
    id: 'OFFER-102',
    buyerName: 'Vikram Singhania',
    company: 'Golden Harvest Flour Mills',
    cropName: 'Sharbati Premium Wheat',
    offeredPrice: 2590,
    askingPrice: 2600,
    quantityRequested: 100,
    pickupLocation: 'Farm Gate Loading Hub',
    paymentTerms: 'KrishiSetu Escrow Protected (100% सुरक्षित भुगतान)',
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  // Dynamic state for crop listings & interactive modals
  const [cropListings, setCropListings] = useState<CropListing[]>(INITIAL_CROPS);
  const [offers, setOffers] = useState<BuyerOffer[]>(INITIAL_OFFERS);

  // Subscribe to real-time crops
  useEffect(() => {
    const unsub = subscribeToCropListings((updated) => {
      if (updated && updated.length > 0) {
        setCropListings(updated);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  // Use orders from props
  const orders = propOrders || [];

  // Modals & form state
  const [isListCropModalOpen, setIsListCropModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<BuyerOffer | null>(null);
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
  const handleCreateCropListing = async (e: React.FormEvent) => {
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
      farmerUid: currentUser?.uid || 'demo-farmer-ramesh',
      farmerName: farmerName,
    };

    setCropListings([newListing, ...cropListings]);
    setIsListCropModalOpen(false);

    try {
      await createCropListing(newListing, currentUser?.uid);
    } catch (err) {
      console.warn('Firestore crop listing notice:', err);
    }

    showSuccess(
      isHindi ? `${newListing.cropName} सफलतापूर्वक लिस्ट हो गई!` : `Successfully listed ${qty} Qtl of ${newListing.cropName}!`,
      isHindi ? 'यह फसल अब 400+ प्रमाणित खरीदारों को दिखाई देगी।' : 'It is now visible to verified wholesale buyers.'
    );
  };

  // Handle Offer Accept / Decline
  const handleAcceptOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    setOffers(offers.filter(o => o.id !== offerId));
    setSelectedOffer(null);
    showSuccess(
      isHindi ? `${offer.company} का प्रस्ताव स्वीकार किया गया!` : `Offer from ${offer.company} accepted!`,
      isHindi ? `₹${(offer.quantityRequested * offer.offeredPrice).toLocaleString('en-IN')} की सुरक्षित एस्क्रो राशि लॉक हो गई है।` : `Escrow locked.`
    );
  };

  const handleDeclineOffer = (offerId: string) => {
    setOffers(offers.filter(o => o.id !== offerId));
    setSelectedOffer(null);
    showInfo(
      isHindi ? 'प्रस्ताव अस्वीकार किया गया' : 'Offer Declined',
      isHindi ? 'खरीदार को सूचना भेज दी गई है।' : 'Buyer informed.'
    );
  };

  // Normalized active tab helper
  const currentTab = activeTab === 'overview' ? 'dashboard' : activeTab;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] flex flex-col md:flex-row pb-20 md:pb-8">
      {/* Reusable Sidebar Component */}
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
            <Wheat className="w-6 h-6 text-[#1B4332]" />
            <div>
              <span className="font-black uppercase tracking-wider text-xs text-[#11281E] block">
                {isHindi ? 'किसान डैशबोर्ड' : 'Farmer Dashboard'}
              </span>
              <span className="text-[10px] text-[#4D6B53] font-bold">
                {isHindi ? 'कृषि सेतु - सीधा बाज़ार' : 'KrishiSetu Portal'}
              </span>
            </div>
          </div>
          <button
            id="farmer-dashboard-menu-open-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="py-2.5 px-4 bg-[#1B4332] text-[#FAF3E0] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-[#1B4332] min-h-[44px]"
          >
            <Menu className="w-4 h-4" />
            <span>{isHindi ? 'मेनू खोलें' : 'Menu'}</span>
          </button>
        </div>

        {/* 1. WELCOME SECTION FOR THE FARMER */}
        <div className="bg-[#1B4332] text-white rounded-[32px] p-6 sm:p-8 shadow-md mb-6 relative overflow-hidden border-2 border-[#1B4332]">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2D5A27] text-[#FAF3E0] text-xs font-black uppercase tracking-wider border border-[#FAF3E0]/30">
                <ShieldCheck className="w-4 h-4 text-[#FAF3E0]" />
                <span>{isHindi ? 'प्रमाणित किसान (Verified Kisan)' : 'Verified Kisan'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                <Sun className="w-4 h-4 text-[#FAF3E0]" />
                <span>{isHindi ? 'उज्जैन: 29°C धूप • फसल कटाई व सुखाने के लिए उत्तम' : 'Ujjain: 29°C Sunny • Ideal Harvest Weather'}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {isHindi ? `नमस्ते, ${farmerName} जी!` : `Namaste, ${farmerName}!`}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#FAF3E0] font-bold max-w-3xl leading-relaxed">
              {isHindi 
                ? 'आपका सीधा किसान पोर्टल सक्रिय है। बिना किसी दलाली के सीधे बड़ी कंपनियों और मिलों को फसल बेचें, ट्रैक्टर किराए पर लें और 100% सुरक्षित भुगतान पाएं।'
                : 'Your direct agricultural portal is active. Manage harvest batches, review verified buyer bids, access farm equipment, and track digital escrow payments.'}
            </p>

            <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#D8E6D3] font-bold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FAF3E0]" />
                <span>{location} • 12.5 Acres (Malwa FPO Cluster)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FAF3E0]" />
                <span>{isHindi ? 'आज का मंडी भाव: गेहूं @ ₹2,610/क्विंटल (MSP से +₹335 ज्यादा)' : 'Mandi Benchmark: Wheat @ ₹2,610/Qtl (+₹335 above MSP)'}</span>
              </span>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
            <Wheat className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* 2. PROMINENT LARGE-TOUCH QUICK ACTIONS BAR */}
        <div className="mb-6 p-4 sm:p-6 bg-white rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
          <div className="flex items-center justify-between mb-3.5 px-1">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C6228]" />
              <span>{isHindi ? '1-क्लिक मुख्य किसान सेवाएं (Quick Actions)' : 'Quick Farm Actions'}</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396]">
              {isHindi ? 'तुरंत शुरू करें' : 'Instant Execution'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Action 1: List New Crop */}
            <button
              id="btn-list-new-crop"
              onClick={() => setIsListCropModalOpen(true)}
              className="p-4 sm:p-5 rounded-2xl bg-[#1B4332] text-white hover:bg-[#2D5A27] transition-all flex flex-col items-start justify-between shadow-xs border-2 border-[#1B4332] group cursor-pointer min-h-[96px] active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-[#FAF3E0] flex items-center justify-center mb-2 border border-[#FAF3E0]/20 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-black uppercase tracking-tight text-white">
                  {isHindi ? '+ फसल बेचें' : '+ List Crop'}
                </span>
                <span className="block text-[10px] text-[#FAF3E0] font-bold mt-0.5">
                  {isHindi ? 'नया स्टॉक जोड़ें' : 'Sell Produce'}
                </span>
              </div>
            </button>

            {/* Action 2: Check Mandi Rates */}
            <button
              id="btn-mandi-rates"
              onClick={() => setActiveTab('market-prices')}
              className="p-4 sm:p-5 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/25 group cursor-pointer min-h-[96px] active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center mb-2 border border-[#1B4332]/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'मंडी भाव देखें' : 'Mandi Rates'}
                </span>
                <span className="block text-[10px] text-[#4D6B53] font-bold mt-0.5">
                  {isHindi ? 'बाज़ार का ताजा रुख' : 'Price Intelligence'}
                </span>
              </div>
            </button>

            {/* Action 3: Rent Machinery */}
            <button
              id="btn-machinery-rental"
              onClick={() => setActiveTab('machinery')}
              className="p-4 sm:p-5 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/25 group cursor-pointer min-h-[96px] active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center mb-2 border border-[#1B4332]/20 group-hover:scale-105 transition-transform">
                <Tractor className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'ट्रैक्टर किराया' : 'Rent Tractor'}
                </span>
                <span className="block text-[10px] text-[#4D6B53] font-bold mt-0.5">
                  {isHindi ? 'पास की मशीन बुक करें' : 'Machinery Hub'}
                </span>
              </div>
            </button>

            {/* Action 4: AI Crop Doctor */}
            <button
              id="btn-ai-crop-advisor"
              onClick={() => setActiveTab('advisory')}
              className="p-4 sm:p-5 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/25 group cursor-pointer min-h-[96px] active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center mb-2 border border-[#E8D5B5] group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'फसल डॉक्टर' : 'Crop Doctor'}
                </span>
                <span className="block text-[10px] text-[#8C6228] font-bold mt-0.5">
                  {isHindi ? 'कीट व रोग सलाह' : 'Smart Advice'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1: Active Orders */}
              <div
                id="farmer-metric-active-orders"
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 sm:p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[120px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'सक्रिय ऑर्डर' : 'Active Orders'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {orders.filter(o => o.status !== 'Completed').length} {isHindi ? 'चालू ऑर्डर' : 'Active'}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider">
                  ₹{orders.filter(o => o.status !== 'Completed').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN')} {isHindi ? 'सुरक्षित भुगतान प्रक्रिया में' : 'in fulfillment'}
                </p>
              </div>

              {/* Metric 2: Buyer Offers */}
              <div
                id="farmer-metric-pending-offers"
                onClick={() => setActiveTab('marketplace')}
                className="bg-white p-5 sm:p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[120px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'खरीदारों के प्रस्ताव' : 'Pending Offers'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center border border-[#E8D5B5]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {offers.length} {isHindi ? 'नए प्रस्ताव' : 'Buyer Offers'}
                </div>
                <p className="text-xs text-[#8C6228] mt-1 font-black uppercase tracking-wider">
                  {isHindi ? 'उच्चतम बोली:' : 'Top bid:'} ₹{Math.max(...offers.map(o => o.offeredPrice), 2580)} / {isHindi ? 'क्विंटल' : 'Qtl'}
                </p>
              </div>

              {/* Metric 3: Estimated Earnings */}
              <div
                id="farmer-metric-estimated-earnings"
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 sm:p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] cursor-pointer transition-all min-h-[120px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#4D6B53] uppercase tracking-wider">
                    {isHindi ? 'कुल अनुमानित आय' : 'Total Earnings'}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/15">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  ₹{(orders.reduce((sum, o) => sum + o.totalAmount, 0)).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-[#2D5A27] mt-1 font-black uppercase tracking-wider flex items-center gap-1">
                  <span>{isHindi ? 'सरकारी एमएसपी से +16.4% अधिक लाभ' : '+16.4% above standard MSP'}</span>
                </p>
              </div>
            </div>

            {/* RECENT CROP LISTINGS SECTION */}
            <div id="recent-crop-listings-section" className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1B4332]/10">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg sm:text-xl text-[#11281E] flex items-center gap-2">
                    <Wheat className="w-6 h-6 text-[#1B4332]" />
                    <span>{isHindi ? 'मेरी हालिया फसल लिस्टिंग' : 'Recent Crop Listings'}</span>
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                    {isHindi ? 'सीधे थोक खरीदारों को दिखने वाला आपका स्टॉक' : 'Live batches available to verified buyers across India.'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    id="btn-list-crop-from-table"
                    onClick={() => {
                      setActiveTab('my-crops');
                      setIsListCropModalOpen(true);
                    }}
                    className="py-3 px-5 bg-[#1B4332] text-[#FAF3E0] hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-[#1B4332] transition-colors cursor-pointer min-h-[44px]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isHindi ? '+ नई फसल जोड़ें' : 'List Crop'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my-crops')}
                    className="py-3 px-4 bg-white text-[#1B4332] hover:bg-[#E8F0E5] rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#1B4332]/25 transition-colors cursor-pointer min-h-[44px]"
                  >
                    {isHindi ? `सभी फसलें (${cropListings.length})` : `View All (${cropListings.length})`}
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
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-3 py-1 rounded-full border border-[#1B4332]/20">
                          {crop.status === 'Active' ? (isHindi ? 'सक्रिय (बिक्री चालू)' : 'Active') : crop.status}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#8FA396]">{crop.id}</span>
                      </div>

                      <h4 className="font-black text-[#11281E] text-base uppercase mt-3">
                        {isHindi ? (crop.hindiName || crop.cropName) : crop.cropName}
                      </h4>
                      <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                        {isHindi ? crop.cropName : (crop.hindiName || crop.cropName)}
                      </p>

                      <div className="mt-3 py-2 px-3 rounded-xl bg-white border border-[#1B4332]/10 space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>{isHindi ? 'उपलब्ध मात्रा:' : 'Stock:'}</span>
                          <span className="text-[#11281E] font-black">{crop.quantity} {isHindi ? 'क्विंटल' : 'Quintals'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>{isHindi ? 'अपेक्षित मूल्य:' : 'Price:'}</span>
                          <span className="text-[#1B4332] font-black">₹{crop.expectedPrice.toLocaleString('en-IN')} / {isHindi ? 'क्विंटल' : 'Qtl'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#4D6B53]">
                          <span>{isHindi ? 'गुणवत्ता:' : 'Grade:'}</span>
                          <span className="text-[#2D5A27] font-black">{crop.qualityGrade}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1B4332]/10 flex gap-2">
                      <button
                        onClick={() => setActiveTab('my-crops')}
                        className="w-full py-3 bg-white hover:bg-[#E8F0E5] text-[#1B4332] border-2 border-[#1B4332]/20 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors min-h-[44px]"
                      >
                        {isHindi ? 'विवरण देखें' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MANDI BENCHMARK PRICE CARDS */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1B4332]/10">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg sm:text-xl text-[#11281E] flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#1B4332]" />
                    <span>{isHindi ? 'प्रमुख मंडी भाव (ताजा रेट)' : 'Nearby Mandi Benchmark Rates'}</span>
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                    {isHindi ? 'आस-पास की प्रमुख मंडियों के भाव देखें और सही समय पर सही दाम पर फसल बेचें।' : 'Real-time indicative mandi rates compared with official MSP.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('market-prices')}
                  className="py-3 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider transition-colors min-h-[44px]"
                >
                  {isHindi ? 'विस्तृत मंडी विश्लेषण' : 'Full Market Analytics'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEMO_MANDI_PRICES.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black uppercase text-[#11281E]">{isHindi ? item.hindi : item.crop}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 font-black px-2 py-0.5 rounded-full">{item.trend}</span>
                      </div>
                      <span className="text-xs font-bold text-[#4D6B53]">{item.mandi}</span>

                      <div className="mt-3 text-2xl font-black text-[#1B4332]">
                        ₹{item.current.toLocaleString('en-IN')} <span className="text-xs text-[#4D6B53] font-bold">/ {isHindi ? 'क्विंटल' : 'Qtl'}</span>
                      </div>
                      <div className="text-xs font-bold text-[#8FA396] mt-0.5">
                        {isHindi ? 'सरकारी एमएसपी:' : 'Govt MSP:'} ₹{item.msp.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1B4332]/10 text-xs font-bold text-[#4D6B53] flex justify-between">
                      <span>{isHindi ? 'आज का न्यूनतम-अधिकतम:' : 'Today Range:'}</span>
                      <span className="font-black text-[#11281E]">₹{item.low} - ₹{item.high}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY CROPS */}
        {currentTab === 'my-crops' && (
          <MyCrops
            cropListings={cropListings}
            onAddCrop={async (newCrop) => {
              setCropListings([newCrop, ...cropListings]);
              try {
                await createCropListing(newCrop, currentUser?.uid);
              } catch (e) {
                console.warn('Create crop Firestore notice:', e);
              }
            }}
            onUpdateCrop={async (updatedCrop) => {
              setCropListings(cropListings.map((c) => (c.id === updatedCrop.id ? updatedCrop : c)));
              try {
                await updateCropListing(updatedCrop.id, updatedCrop);
              } catch (e) {
                console.warn('Update crop Firestore notice:', e);
              }
            }}
            onDeleteCrop={async (id) => {
              setCropListings(cropListings.filter((c) => c.id !== id));
              try {
                await deleteCropListing(id);
              } catch (e) {
                console.warn('Delete crop Firestore notice:', e);
              }
            }}
            onToggleSold={async (id) => {
              const target = cropListings.find(c => c.id === id);
              if (!target) return;
              const nextStatus = target.status === 'Sold' ? 'Active' : 'Sold';
              setCropListings(
                cropListings.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
              );
              try {
                await updateCropListing(id, { status: nextStatus });
              } catch (e) {
                console.warn('Toggle sold crop Firestore notice:', e);
              }
            }}
            onFindBuyers={() => {
              setActiveTab('marketplace');
            }}
            isAddModalOpenInitially={isListCropModalOpen}
            onCloseAddModal={() => setIsListCropModalOpen(false)}
          />
        )}

        {/* TAB 3: MARKETPLACE (BUYER DEMAND & LIVE EXCHANGE) */}
        {currentTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-[#1B4332]/15 w-fit">
              <button
                onClick={() => setFarmerMarketplaceSubTab('offers')}
                className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] ${
                  farmerMarketplaceSubTab === 'offers'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#F8FAF5]'
                }`}
              >
                {isHindi ? `खरीदारों के प्रस्ताव (${offers.length})` : `Incoming Buyer Offers (${offers.length})`}
              </button>
              <button
                onClick={() => setFarmerMarketplaceSubTab('all-crops')}
                className={`py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-h-[44px] ${
                  farmerMarketplaceSubTab === 'all-crops'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#F8FAF5]'
                }`}
              >
                {isHindi ? 'थोक कृषि बाज़ार देखें' : 'Browse Market Exchange'}
              </button>
            </div>

            {farmerMarketplaceSubTab === 'offers' ? (
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-6 h-6 text-[#1B4332]" />
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                        {isHindi ? 'थोक खरीदारों के प्रस्ताव' : 'Wholesale Buyer Proposals'}
                      </h2>
                    </div>
                    <p className="text-xs text-[#4D6B53] font-bold mt-1">
                      {isHindi 
                        ? 'प्रमाणित मिल मालिकों और कंपनियों से आपकी फसल के लिए सीधी मांग और बोलियां।'
                        : 'Connect directly with verified agro-processing companies, millers, and corporate procurement houses.'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F0E5] text-[#1B4332] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20">
                    <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                    <span>{isHindi ? '100% सुरक्षित एस्क्रो भुगतान' : '100% Escrow Protected'}</span>
                  </div>
                </div>

                {/* Active Buyer Inquiries */}
                <div className="mt-6 space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]">
                            {isHindi ? 'खरीदार प्रस्ताव' : 'Buyer Offer'}
                          </span>
                          <span className="text-xs font-bold text-[#8FA396]">{offer.receivedTime}</span>
                        </div>
                        <h4 className="font-black uppercase tracking-tight text-[#11281E] text-base mt-1.5">
                          {offer.company} ({offer.buyerName})
                        </h4>
                        <p className="text-xs text-[#4D6B53] font-bold">
                          {isHindi ? 'मांगी गई फसल:' : 'Interested Crop:'} <span className="font-black text-[#11281E]">{offer.cropName}</span> • {isHindi ? 'मात्रा:' : 'Requested:'} {offer.quantityRequested} {isHindi ? 'क्विंटल' : 'Quintals'}
                        </p>
                        <p className="text-xs text-[#8FA396] font-bold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>{isHindi ? 'उठाव स्थान:' : 'Pickup:'} {offer.pickupLocation}</span>
                        </p>
                      </div>

                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
                          {isHindi ? 'प्रस्तावित दर' : 'Offered Rate'}
                        </span>
                        <span className="text-xl font-black text-[#1B4332]">₹{offer.offeredPrice.toLocaleString('en-IN')} / {isHindi ? 'क्विंटल' : 'Qtl'}</span>
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="py-3 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider cursor-pointer min-h-[44px] active:scale-98"
                          >
                            {isHindi ? 'स्वीकार करें (Accept)' : 'Accept Offer'}
                          </button>
                          <button
                            onClick={() => handleDeclineOffer(offer.id)}
                            className="py-3 px-4 bg-white text-[#4D6B53] hover:text-rose-700 rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer min-h-[44px]"
                          >
                            {isHindi ? 'अस्वीकार' : 'Decline'}
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
                cropListings={cropListings}
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
              <div className="pb-6 border-b-2 border-[#1B4332]/10 flex items-center gap-3">
                <User className="w-7 h-7 text-[#1B4332]" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'किसान प्रोफ़ाइल व खाता विवरण' : 'Farmer Profile & Verification'}
                  </h2>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    {isHindi ? 'भूमि रकबा, बैंक खाता और सुरक्षित एस्क्रो भुगतान विवरण।' : 'Kisan Credit, Land Holding, and Direct Escrow Bank Details.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />
                    <span>{isHindi ? 'व्यक्तिगत व भूमि विवरण' : 'Personal & Farm Land Details'}</span>
                  </h3>
                  <div className="space-y-2.5 text-xs font-bold text-[#4D6B53]">
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'पूरा नाम:' : 'Full Name:'}</span>
                      <span className="text-[#11281E] font-black">{farmerName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'पंजीकृत मोबाइल:' : 'Registered Phone:'}</span>
                      <span className="text-[#11281E] font-black">{currentUser?.phone || '+91 98260 12345'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'स्थान व तहसील:' : 'Location / Tehsil:'}</span>
                      <span className="text-[#11281E] font-black">{location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'कुल कृषि भूमि:' : 'Total Land Area:'}</span>
                      <span className="text-[#11281E] font-black">12.5 Acres (Khasra #142/1)</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>{isHindi ? 'एफपीओ सहभागिता:' : 'FPO Affiliation:'}</span>
                      <span className="text-[#1B4332] font-black">Malwa Kisan Producer Cooperative</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#2D5A27]" />
                    <span>{isHindi ? 'सीधा भुगतान बैंक खाता (Direct Settlement)' : 'Direct Payment Settlement Account'}</span>
                  </h3>
                  <div className="space-y-2.5 text-xs font-bold text-[#4D6B53]">
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'बैंक का नाम:' : 'Bank Name:'}</span>
                      <span className="text-[#11281E] font-black">State Bank of India (SBI)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>{isHindi ? 'खाता संख्या:' : 'Account Number:'}</span>
                      <span className="text-[#11281E] font-black">•••• •••• 8812 (सत्यापित)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1B4332]/10">
                      <span>IFSC Code:</span>
                      <span className="text-[#11281E] font-black">SBIN0001234</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>{isHindi ? 'भुगतान माध्यम:' : 'Settlement Mode:'}</span>
                      <span className="text-[#2D5A27] font-black">{isHindi ? 'सीधा बैंक ट्रांसफर (तत्काल)' : 'Instant Escrow Release (T+0)'}</span>
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
                <div className="flex items-center gap-2.5">
                  <Wheat className="w-6 h-6 text-[#1B4332]" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'नई फसल लिस्ट करें (बिक्री हेतु)' : 'List New Crop Batch'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsListCropModalOpen(false)}
                  className="p-2 text-[#4D6B53] hover:text-[#11281E] rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCropListing} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    {isHindi ? 'फसल का नाम व प्रकार' : 'Crop Type & Name'}
                  </label>
                  <select
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
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
                    {isHindi ? 'किस्म / वैरायटी' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="e.g. C-306 Desi Sharbati"
                    className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      {isHindi ? 'मात्रा (क्विंटल में)' : 'Quantity (Quintals)'}
                    </label>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      min="1"
                      className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      {isHindi ? 'अपेक्षित मूल्य (₹/क्विंटल)' : 'Expected Price (₹/Qtl)'}
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. 2600"
                      min="500"
                      className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      {isHindi ? 'नमी प्रतिशत (Moisture %)' : 'Moisture %'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMoisture}
                      onChange={(e) => setNewMoisture(e.target.value)}
                      placeholder="e.g. 10.5"
                      className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                      {isHindi ? 'गुणवत्ता श्रेणी' : 'Quality Grade'}
                    </label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value as 'A+' | 'A' | 'B+')}
                      className="w-full p-4 rounded-2xl border-2 border-[#1B4332]/25 text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] min-h-[50px]"
                    >
                      <option value="A+">Grade A+ (प्रीमियम / निर्यात)</option>
                      <option value="A">Grade A (मानक मिल ग्रेड)</option>
                      <option value="B+">Grade B+ (औसत गुणवत्ता)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#1B4332]/10 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsListCropModalOpen(false)}
                    className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#1B4332]/25 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#F8FAF5] min-h-[48px]"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider shadow-xs min-h-[48px] active:scale-98"
                  >
                    {isHindi ? 'फसल बाज़ार में जोड़ें' : 'Publish Crop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation for 1-thumb touch accessibility */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onQuickSell={() => setIsListCropModalOpen(true)}
      />
    </div>
  );
};
