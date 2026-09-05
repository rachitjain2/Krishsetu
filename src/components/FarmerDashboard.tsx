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
  CloudSun,
  Mic,
  Gavel,
  Zap,
  Activity,
  Users,
  Lock,
  Building2,
  Award,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MyCrops } from './MyCrops';
import { Marketplace } from './Marketplace';
import { FarmerOrders } from './FarmerOrders';
import { AICropAdvisor } from './AICropAdvisor';
import { MachineryRental } from './MachineryRental';
import { MarketIntelligence } from './MarketIntelligence';
import { ReverseAuctionRoom } from './ReverseAuctionRoom';
import { LiveGPSMachineryRental } from './LiveGPSMachineryRental';
import { AgriCreditScoreEngine } from './AgriCreditScoreEngine';
import { GroupBulkBundling } from './GroupBulkBundling';
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
  onOpenVoiceAssistant?: () => void;
  initialTab?: string;
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
  onOpenVoiceAssistant,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
  const [dashboardLotLocked, setDashboardLotLocked] = useState(false);

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
        onOpenVoiceAssistant={onOpenVoiceAssistant}
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Action 1: List New Crop */}
            <button
              id="btn-list-new-crop"
              onClick={() => setIsListCropModalOpen(true)}
              className="p-4 sm:p-5 rounded-2xl bg-white text-[#11281E] hover:bg-[#E8F0E5] transition-all flex flex-col items-start justify-between border-2 border-[#1B4332]/25 group cursor-pointer min-h-[96px] active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center mb-2 border border-[#1B4332]/20 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'फसल बेचें' : 'List Crop'}
                </span>
                <span className="block text-[10px] text-[#4D6B53] font-bold mt-0.5">
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

            {/* FARM SERVICES & TOOLS SECTION - CLEAN COHESIVE AGRI-TECH COMMAND SUITE */}
            <div
              id="farmer-services-tools-section"
              className="bg-[#F4F8F3] p-6 sm:p-7 rounded-[32px] border-2 border-[#1B4332]/20 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b-2 border-[#1B4332]/15">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#1B4332] text-amber-300 shadow-xs flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isHindi ? 'हाई-टेक कृषि सेवाएं व टूल्स' : 'Smart Agri-Tech Suite & Tools'}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{isHindi ? '3 मुख्य सेवाएं लाइव' : '3 Core Services Live'}</span>
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'विशेष कृषि तकनीक व सेवाएं' : 'Specialized Farm Services & Tools'}
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-medium max-w-3xl mt-0.5">
                    {isHindi
                      ? 'सीधी पारदर्शी मंडी नीलामी, लाइव जीपीएस मशीनरी व किसान क्रेडिट स्कोर।'
                      : 'Reverse auctions, live GPS machinery rental, and verified AgriScore.'}
                  </p>
                </div>
              </div>

              {/* 3-Column Clean Cohesive Suite */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Reverse Auction */}
                <div
                  id="service-card-reverse-auction"
                  onClick={() => setActiveTab('reverse-auction')}
                  className="bg-white p-5 rounded-2xl border-2 border-stone-200/90 hover:border-[#1B4332] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Gavel className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300/70 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        <span>{isHindi ? 'लाइव बोली' : 'Live Floor'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-[#11281E] group-hover:text-amber-900 transition-colors">
                        {isHindi ? 'रिवर्स ऑक्शन' : 'Reverse Auction'}
                      </h4>
                      <p className="text-xs text-stone-600 font-medium leading-relaxed mt-1 line-clamp-2">
                        {isHindi
                          ? 'न्यूनतम आरक्षित मूल्य तय करें। संस्थागत थोक खरीदार बिना बिचौलियों के लाइव पारदर्शी बोली लगाते हैं।'
                          : 'Set reserve floor price; institutional buyers place live competing bids with zero brokerage.'}
                      </p>
                    </div>

                    {/* Live Telemetry Pill */}
                    <div className="bg-stone-50 group-hover:bg-amber-50/60 border border-stone-200 group-hover:border-amber-200 rounded-xl p-2.5 text-[11px] font-bold text-stone-800 flex items-center justify-between transition-colors">
                      <span>{isHindi ? 'उच्चतम बोली:' : 'Top Live Bid:'} ₹2,580/Qtl</span>
                      <span className="text-amber-800 font-black">3 Buyers</span>
                    </div>
                  </div>

                  <div className="w-full py-2.5 px-3 rounded-xl bg-stone-100 group-hover:bg-[#1B4332] text-[#1B4332] group-hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between">
                    <span>{isHindi ? 'ऑक्शन रूम में जाएं' : 'Enter Auction Floor'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Machinery Rental */}
                <div
                  id="service-card-live-gps"
                  onClick={() => setActiveTab('live-gps-machinery')}
                  className="bg-white p-5 rounded-2xl border-2 border-stone-200/90 hover:border-[#1B4332] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#8C6228] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Tractor className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C6228] animate-pulse" />
                        <span>{isHindi ? 'जीपीएस फ्लीट' : 'Live Fleet'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-[#11281E] group-hover:text-[#8C6228] transition-colors">
                        {isHindi ? 'मशीनरी किराया' : 'Machinery Rental'}
                      </h4>
                      <p className="text-xs text-stone-600 font-medium leading-relaxed mt-1 line-clamp-2">
                        {isHindi
                          ? 'निकटतम ट्रैक्टर, कंबाइन हार्वेस्टर व ड्रोन मैप पर लाइव देखें और प्रति घंटा सुरक्षित बुक करें।'
                          : 'Hire verified tractors, harvesters, and sprayers with real-time GPS tracking and OTP escrow.'}
                      </p>
                    </div>

                    {/* Live Telemetry Pill */}
                    <div className="bg-stone-50 group-hover:bg-[#FAF3E0]/60 border border-stone-200 group-hover:border-[#E8D5B5] rounded-xl p-2.5 text-[11px] font-bold text-stone-800 flex items-center justify-between transition-colors">
                      <span>14 Machines Nearby</span>
                      <span className="text-[#8C6228] font-black">From ₹650/hr</span>
                    </div>
                  </div>

                  <div className="w-full py-2.5 px-3 rounded-xl bg-stone-100 group-hover:bg-[#1B4332] text-[#1B4332] group-hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between">
                    <span>{isHindi ? 'किराए पर लें' : 'Book GPS Machinery'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Kisan Credit Score */}
                <div
                  id="service-card-micro-credit"
                  onClick={() => setActiveTab('micro-credit')}
                  className="bg-white p-5 rounded-2xl border-2 border-stone-200/90 hover:border-[#1B4332] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300/70 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{isHindi ? 'बैंक प्रमाणित' : 'AgriScore'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-[#11281E] group-hover:text-[#1B4332] transition-colors">
                        {isHindi ? 'क्रेडिट स्कोर व ऋण' : 'Kisan AgriScore'}
                      </h4>
                      <p className="text-xs text-stone-600 font-medium leading-relaxed mt-1 line-clamp-2">
                        {isHindi
                          ? 'व्यापार इतिहास व मशीनरी उपयोग से निष्पक्ष क्रेडिट रेटिंग बनाएं और कम ब्याज पर कृषि ऋण पाएं।'
                          : 'Build verified 300–900 credit rating from trading consistency to unlock low-interest farm loans.'}
                      </p>
                    </div>

                    {/* Live Telemetry Pill */}
                    <div className="bg-stone-50 group-hover:bg-[#E8F0E5]/60 border border-stone-200 group-hover:border-[#1B4332]/20 rounded-xl p-2.5 text-[11px] font-bold text-stone-800 flex items-center justify-between transition-colors">
                      <span>Score: 785 / 900</span>
                      <span className="text-emerald-900 font-black">₹3.5L Limit</span>
                    </div>
                  </div>

                  <div className="w-full py-2.5 px-3 rounded-xl bg-stone-100 group-hover:bg-[#1B4332] text-[#1B4332] group-hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between">
                    <span>{isHindi ? 'स्कोर देखें' : 'View Credit Rating'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* DEDICATED 5KM COOPERATIVE BULK-BUNDLING SECTION */}
            <div id="dedicated-bulk-bundling-section" className="bg-white p-6 sm:p-7 rounded-[32px] border-2 border-[#1B4332]/20 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]/15">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isHindi ? '5 किमी सहकारी थोक बंडलिंग' : '5km Cooperative Bulk-Bundling'}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {isHindi ? '20 MT पूरा ट्रक लॉट तैयार' : '20 MT Full-Truckload Ready'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'पड़ोसी किसानों के साथ संयुक्त थोक लॉट (+12% प्रीमियम)' : 'Pool Harvest with Nearby Farmers (+12% Institutional Bonus)'}
                  </h3>

                  <p className="text-xs text-[#4D6B53] font-medium max-w-3xl">
                    {isHindi
                      ? '5 किमी के दायरे में लेकोड़ा व ताजपुर के 3 किसानों के साथ मिलकर 20 टन गेहूं का पूरा ट्रक भरें और ITC Agri-Business को ₹29.50/kg पर बेचें।'
                      : 'Aggregate wheat batches with 3 nearby Lekoda & Tajpur farms into a 20 MT full-truckload to sell directly to ITC Agri-Business at ₹29.50/kg.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('group-bundling')}
                    className="py-3 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>{isHindi ? 'पूरा बंडलिंग कक्ष खोलें' : 'Open Bundling Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spotlight Live Match Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. Your Contribution (3 cols) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#1B4332]/15 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                        Your Batch
                      </span>
                      <span className="text-xs font-bold text-[#4D6B53]">Lekoda Hub</span>
                    </div>

                    <h4 className="text-base font-black text-[#11281E] mt-2">
                      Sharbati Wheat (शरबती गेहूं)
                    </h4>
                    <p className="text-xs text-[#4D6B53]">Grade A • Cleaned & Moisture Tested (10.0%)</p>

                    <div className="mt-3 p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Your Volume:</span>
                        <span className="font-black text-[#11281E]">35 Qtl (3,500 kg)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Solo Farmgate:</span>
                        <span className="font-bold text-gray-500">₹26.50 / kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#4D6B53] font-medium">
                    {isHindi ? 'आप इस 5 किमी क्लस्टर के मुख्य एंकर किसान हैं।' : 'You are the cluster anchor for this 5km radius lot.'}
                  </div>
                </div>

                {/* 2. Pooled Neighbors (4 cols) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#1B4332]/15 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        3 Nearby Farms
                      </span>
                      <span className="text-xs font-bold text-emerald-700">16,500 kg Pooled</span>
                    </div>

                    <h4 className="text-sm font-black uppercase tracking-tight text-[#11281E] mt-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#1B4332]" />
                      <span>{isHindi ? 'शामिल पड़ोसी किसान' : 'Matched 5km Neighbors'}</span>
                    </h4>

                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F8FAF5]">
                        <div>
                          <div className="font-bold text-[#11281E]">Suresh Choudhary</div>
                          <div className="text-[10px] text-[#4D6B53]">Tajpur Khurd (1.8 km)</div>
                        </div>
                        <span className="font-black text-[#1B4332]">52 Qtl</span>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F8FAF5]">
                        <div>
                          <div className="font-bold text-[#11281E]">Dinesh Mukati</div>
                          <div className="text-[10px] text-[#4D6B53]">Ghatia Tehsil (2.1 km)</div>
                        </div>
                        <span className="font-black text-[#1B4332]">48 Qtl</span>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F8FAF5]">
                        <div>
                          <div className="font-bold text-[#11281E]">Jagdish Gurjar</div>
                          <div className="text-[10px] text-[#4D6B53]">Pingleshwar (3.4 km)</div>
                        </div>
                        <span className="font-black text-[#1B4332]">65 Qtl</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1B4332]/10 text-xs font-bold text-[#11281E]">
                    <span>Total Truckload:</span>
                    <span className="text-[#1B4332] font-black">20.0 MT (200 Quintals)</span>
                  </div>
                </div>

                {/* 3. Pre-Approved Buyer & Profit (4 cols) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl border-2 border-emerald-600/40 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>ITC Agri-Business</span>
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">Escrow Ready</span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D6B53] block">
                        {isHindi ? 'थोक भाव व अतिरिक्त लाभ' : 'Wholesale Rate & Gain'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-[#1B4332]">₹29.50 / kg</span>
                        <span className="text-xs text-gray-400 line-through font-bold">₹26.50</span>
                      </div>
                      <div className="text-xs font-black text-emerald-700 mt-1">
                        +₹3.00/kg Institutional Bonus
                      </div>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-900 font-bold block">
                        {isHindi ? 'आपकी सीधी अतिरिक्त कमाई:' : 'Your Net Extra Bonus:'}
                      </span>
                      <span className="text-lg font-black text-[#2D5A27]">+₹10,500</span>
                      <span className="text-[10px] text-[#4D6B53] block mt-0.5">
                        Free weighbridge pickup at Lekoda Depot
                      </span>
                    </div>
                  </div>

                  <div>
                    {dashboardLotLocked ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{isHindi ? 'लॉट सुरक्षित व लॉक है' : 'Lot Locked (#LOT-MP-7721)'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setDashboardLotLocked(true);
                          showSuccess(
                            isHindi ? '20 MT थोक बंडल सफलतापूर्वक लॉक हुआ!' : '20 MT Bulk Lot Confirmed & Locked!',
                            isHindi
                              ? 'ITC Agri-Business के साथ ₹29.50/kg पर सुरक्षित। आपका अतिरिक्त लाभ: +₹10,500!'
                              : 'Locked with ITC Agri-Business at ₹29.50/kg. Your extra bonus: +₹10,500!'
                          );
                        }}
                        className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-[#11281E] rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{isHindi ? '20 MT लॉट लॉक करें' : 'Lock 20 MT Lot (₹29.50/kg)'}</span>
                      </button>
                    )}
                  </div>
                </div>
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

        {/* TAB: REVERSE AUCTION MARKETPLACE */}
        {currentTab === 'reverse-auction' && (
          <ReverseAuctionRoom currentUser={currentUser} userRole="farmer" />
        )}

        {/* TAB: LIVE GPS MACHINERY RENTAL */}
        {(currentTab === 'live-gps-machinery' || currentTab === 'machinery') && (
          <LiveGPSMachineryRental
            currentUser={currentUser}
            onNavigateToCredit={() => setActiveTab('micro-credit')}
          />
        )}

        {/* TAB: NOVEL AGRI-FINTECH MICRO-CREDIT ENGINE */}
        {currentTab === 'micro-credit' && (
          <AgriCreditScoreEngine
            currentUser={currentUser}
            onNavigateToRental={() => setActiveTab('live-gps-machinery')}
            onNavigateToAuction={() => setActiveTab('reverse-auction')}
          />
        )}

        {/* TAB: GROUP BULK-BUNDLING ENGINE (5KM RADIUS / 3-DAY CLUSTER) */}
        {(currentTab === 'group-bundling' || currentTab === 'suggested-bundles') && (
          <GroupBulkBundling
            currentUser={currentUser}
            onNavigateToMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {/* TAB 5: AI CROP ADVISOR */}
        {currentTab === 'advisory' && (
          <AICropAdvisor defaultLocation={currentUser?.location} />
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
