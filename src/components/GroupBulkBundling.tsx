import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  CheckCircle2,
  Users,
  Truck,
  IndianRupee,
  Lock,
  Award,
  Check,
  Building2,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Share2,
  Copy
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface GroupBulkBundlingProps {
  currentUser?: UserProfile | null;
  onNavigateToMarketplace?: () => void;
}

interface NeighborFarmer {
  id: string;
  name: string;
  village: string;
  distanceKm: number;
  quantityKg: number;
  phone: string;
  harvestReadyDate: string;
}

interface CropBundleProfile {
  cropKey: string;
  cropNameHindi: string;
  cropNameEnglish: string;
  qualityGrade: 'A' | 'B';
  farmerQuantityKg: number; // Ramesh's quantity
  farmerSoloPrice: number; // ₹/kg solo
  bulkWholesalePrice: number; // ₹/kg pooled
  buyerName: string;
  buyerType: string;
  pickupDepot: string;
  neighbors: NeighborFarmer[];
}

const BUNDLE_DATA: Record<string, CropBundleProfile> = {
  Wheat: {
    cropKey: 'Wheat',
    cropNameHindi: 'शरबती गेहूं',
    cropNameEnglish: 'Sharbati Wheat',
    qualityGrade: 'A',
    farmerQuantityKg: 3500, // 35 Qtl
    farmerSoloPrice: 26.50,
    bulkWholesalePrice: 29.50, // +₹3.00/kg
    buyerName: 'ITC Agri-Business',
    buyerType: 'Direct Mill Procurement',
    pickupDepot: 'Lekoda Weighbridge Depot, Ujjain',
    neighbors: [
      {
        id: 'nb-1',
        name: 'Suresh Choudhary (सुरेश चौधरी)',
        village: 'Tajpur Khurd',
        distanceKm: 1.8,
        quantityKg: 5200,
        phone: '9826198765',
        harvestReadyDate: 'Ready Now (कल कटा)'
      },
      {
        id: 'nb-2',
        name: 'Dinesh Mukati (दिनेश मुकाती)',
        village: 'Ghatia Tehsil',
        distanceKm: 2.1,
        quantityKg: 4800,
        phone: '9425043210',
        harvestReadyDate: 'Ready in 1 Day'
      },
      {
        id: 'nb-3',
        name: 'Jagdish Gurjar (जगदीश गुर्जर)',
        village: 'Pingleshwar',
        distanceKm: 3.4,
        quantityKg: 6500,
        phone: '9752099112',
        harvestReadyDate: 'Ready Now'
      }
    ]
  },
  Mustard: {
    cropKey: 'Mustard',
    cropNameHindi: 'काली सरसों',
    cropNameEnglish: 'Mustard (Sarson)',
    qualityGrade: 'A',
    farmerQuantityKg: 3800, // 38 Qtl
    farmerSoloPrice: 54.50,
    bulkWholesalePrice: 59.50, // +₹5.00/kg
    buyerName: 'Adani Wilmar (Fortune)',
    buyerType: 'Oilseed Extraction Unit',
    pickupDepot: 'Ruchi Soya Depot, Ujjain',
    neighbors: [
      {
        id: 'nb-4',
        name: 'Bhagwan Singh (भगवान सिंह)',
        village: 'Tajpur',
        distanceKm: 1.6,
        quantityKg: 6200,
        phone: '9826311220',
        harvestReadyDate: 'Ready Now'
      },
      {
        id: 'nb-5',
        name: 'Kailash Patidar (कैलाश पाटीदार)',
        village: 'Lekoda',
        distanceKm: 1.1,
        quantityKg: 5000,
        phone: '9893044199',
        harvestReadyDate: 'Ready in 2 Days'
      }
    ]
  },
  Chana: {
    cropKey: 'Chana',
    cropNameHindi: 'देसी चना',
    cropNameEnglish: 'Desi Chana (Gram)',
    qualityGrade: 'A',
    farmerQuantityKg: 3200, // 32 Qtl
    farmerSoloPrice: 49.00,
    bulkWholesalePrice: 53.50, // +₹4.50/kg
    buyerName: 'Cargill India Agro',
    buyerType: 'Dal Mill Processing',
    pickupDepot: 'Ghatia Mandi Yard',
    neighbors: [
      {
        id: 'nb-6',
        name: 'Radheshyam Malviya (राधेश्याम मालवीय)',
        village: 'Ghatia',
        distanceKm: 2.3,
        quantityKg: 4800,
        phone: '9425881234',
        harvestReadyDate: 'Ready Now'
      },
      {
        id: 'nb-7',
        name: 'Satyanarayan Joshi (सत्यनारायण जोशी)',
        village: 'Lekoda East',
        distanceKm: 0.9,
        quantityKg: 4000,
        phone: '9752331908',
        harvestReadyDate: 'Ready Now'
      }
    ]
  },
  Soybean: {
    cropKey: 'Soybean',
    cropNameHindi: 'पीला सोयाबीन',
    cropNameEnglish: 'Yellow Soybean',
    qualityGrade: 'A',
    farmerQuantityKg: 4200, // 42 Qtl
    farmerSoloPrice: 43.50,
    bulkWholesalePrice: 48.00, // +₹4.50/kg
    buyerName: 'Patanjali Foods Ltd',
    buyerType: 'Solvent Extraction Plant',
    pickupDepot: 'Tajpur Logistics Hub',
    neighbors: [
      {
        id: 'nb-8',
        name: 'Kamal Kishore (कमल किशोर)',
        village: 'Lekoda',
        distanceKm: 1.2,
        quantityKg: 7800,
        phone: '9826077331',
        harvestReadyDate: 'Ready Now'
      },
      {
        id: 'nb-9',
        name: 'Virendra Yadav (वीरेंद्र यादव)',
        village: 'Tajpur Road',
        distanceKm: 2.0,
        quantityKg: 8000,
        phone: '9893551122',
        harvestReadyDate: 'Ready in 1 Day'
      }
    ]
  }
};

export const GroupBulkBundling: React.FC<GroupBulkBundlingProps> = ({
  currentUser,
  onNavigateToMarketplace,
}) => {
  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [activeTab, setActiveTab] = useState<'my_cluster' | 'regional_lots'>('my_cluster');
  const [lockedLots, setLockedLots] = useState<Record<string, { lotId: string; lockedAt: string }>>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const currentProfile = BUNDLE_DATA[selectedCrop] || BUNDLE_DATA.Wheat;

  // Calculate totals
  const neighborsTotalKg = currentProfile.neighbors.reduce((acc, n) => acc + n.quantityKg, 0);
  const totalLotKg = currentProfile.farmerQuantityKg + neighborsTotalKg;
  const totalFarmersCount = currentProfile.neighbors.length + 1;
  const pricePremiumPerKg = currentProfile.bulkWholesalePrice - currentProfile.farmerSoloPrice;
  const farmerExtraEarnings = Math.round(currentProfile.farmerQuantityKg * pricePremiumPerKg);
  const totalLotValue = Math.round(totalLotKg * currentProfile.bulkWholesalePrice);

  const isCurrentLotLocked = Boolean(lockedLots[selectedCrop]);
  const currentLotId = lockedLots[selectedCrop]?.lotId || `LOT-MP-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleLockLot = () => {
    const lotId = `LOT-MP-${Math.floor(7000 + Math.random() * 2000)}`;
    setLockedLots((prev) => ({
      ...prev,
      [selectedCrop]: {
        lotId,
        lockedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    }));

    showSuccess(
      isHindi ? 'थोक बंडल सफलतापूर्वक लॉक व सुरक्षित हुआ!' : 'Wholesale Bulk Lot Locked & Confirmed!',
      isHindi
        ? `लॉट #${lotId}: ${(totalLotKg / 1000).toFixed(1)} MT माल ₹${currentProfile.bulkWholesalePrice}/kg पर ${currentProfile.buyerName} के साथ बुक हो गया। आपका बोनस: +₹${farmerExtraEarnings.toLocaleString('en-IN')}!`
        : `Lot #${lotId}: ${(totalLotKg / 1000).toFixed(1)} MT booked at ₹${currentProfile.bulkWholesalePrice}/kg with ${currentProfile.buyerName}. Your extra bonus: +₹${farmerExtraEarnings.toLocaleString('en-IN')}!`
    );
  };

  const getShareText = () => {
    return isHindi
      ? `कृषिसेतु सूचना: हमारा ${(totalLotKg / 1000).toFixed(1)} मीट्रिक टन ${currentProfile.cropNameHindi} का थोक बंडल ₹${currentProfile.bulkWholesalePrice}/kg पर ${currentProfile.buyerName} के साथ लॉक हो गया है। लेकोड़ा धर्मकांटे पर लोडिंग कल सुबह होगी। संपर्क: ${currentUser?.phone || '9826012345'}`
      : `KrishiSetu Alert: Our ${(totalLotKg / 1000).toFixed(1)} MT ${currentProfile.cropNameEnglish} lot is locked at ₹${currentProfile.bulkWholesalePrice}/kg with ${currentProfile.buyerName}. Hub: ${currentProfile.pickupDepot}. Contact: ${currentUser?.phone || '9826012345'}`;
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(getShareText());
    showSuccess(
      isHindi ? 'संदेश कॉपी हो गया!' : 'Message Copied!',
      isHindi ? 'व्हाट्सएप या एसएमएस द्वारा अन्य किसानों को भेजें।' : 'Share this update with your cluster neighbors.'
    );
  };

  return (
    <div id="group-bulk-bundling-workspace" className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#1B4332] text-white p-6 sm:p-7 rounded-[28px] border border-emerald-900/60 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isHindi ? '5 किमी सहकारी थोक बंडलिंग' : '5km Cooperative Bulk-Bundling'}</span>
              </span>
              <span className="text-xs text-emerald-200/90 font-medium">
                {isHindi ? 'उज्जैन व लेकोड़ा क्लस्टर' : 'Ujjain & Lekoda Cluster'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi ? 'पड़ोसी किसानों के साथ संयुक्त थोक लॉट' : 'Smart Wholesale Bundling'}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/80 font-normal max-w-2xl leading-relaxed">
              {isHindi
                ? '5 किमी के दायरे में समान फसल वाले किसानों के साथ मिलकर 10 से 20 टन का पूरा ट्रक भरें और बड़े मिल खरीदारों (ITC, Adani) से +₹3 से +₹5 प्रति किलो अधिक थोक भाव पाएं।'
                : 'Pool harvest with nearby farmers within 5km to assemble 10–20 MT full truckload batches and secure direct institutional procurement premiums.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-right">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {isHindi ? 'औसत अतिरिक्त लाभ' : 'Average Premium'}
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300">
                +₹3.00 to +₹5.00 / kg
              </div>
              <div className="text-[10px] text-emerald-100/70">
                {isHindi ? '+12% तक अधिक आय' : 'Up to +12% Net Revenue'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CROP SELECTOR (SIMPLE 4 BUTTONS) */}
      <div className="bg-white p-5 rounded-[24px] border-2 border-[#1B4332]/15 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E]">
              {isHindi ? '1. अपनी फसल चुनें' : '1. Select Your Crop Batch'}
            </h3>
            <p className="text-xs text-[#4D6B53] font-medium">
              {isHindi
                ? 'जिस फसल का बंडल देखना या लॉक करना है, उस पर क्लिक करें:'
                : 'Click a crop to inspect instant 5km matched neighbors and bonus pricing:'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4332] bg-[#E8F0E5] px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>4 {isHindi ? 'क्लस्टर सक्रिय' : 'Clusters Live'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {Object.entries(BUNDLE_DATA).map(([key, data]) => {
            const isSelected = selectedCrop === key;
            const isLocked = Boolean(lockedLots[key]);
            const extra = Math.round(data.farmerQuantityKg * (data.bulkWholesalePrice - data.farmerSoloPrice));

            return (
              <button
                key={key}
                onClick={() => setSelectedCrop(key)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#E8F0E5] border-[#1B4332] shadow-xs'
                    : 'bg-[#F8FAF5] hover:bg-white border-[#1B4332]/15'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                      Grade {data.qualityGrade}
                    </span>
                    <h4 className="text-base font-black uppercase tracking-tight text-[#11281E] mt-1.5">
                      {isHindi ? data.cropNameHindi : data.cropNameEnglish}
                    </h4>
                    <p className="text-xs text-[#4D6B53] font-bold">
                      {(data.farmerQuantityKg / 100).toFixed(0)} Qtl • ₹{data.farmerSoloPrice}/kg
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'border-[#1B4332]/30 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1B4332]/15 flex items-center justify-between text-xs">
                  {isLocked ? (
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Locked</span>
                    </span>
                  ) : (
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {data.neighbors.length} Neighbors
                    </span>
                  )}
                  <span className="font-black text-[#1B4332]">+₹{extra.toLocaleString('en-IN')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('my_cluster')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'my_cluster'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'bg-white text-[#4D6B53] hover:bg-[#E8F0E5] border border-[#1B4332]/15'
          }`}
        >
          {isHindi ? 'मेरा 5 किमी क्लस्टर व लॉट' : 'My 5km Cluster & Match'}
        </button>
        <button
          onClick={() => setActiveTab('regional_lots')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'regional_lots'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'bg-white text-[#4D6B53] hover:bg-[#E8F0E5] border border-[#1B4332]/15'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{isHindi ? 'अन्य खुले क्षेत्रीय लॉट' : 'Other Regional Open Lots'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B4332]/10 font-black">
            3 Active
          </span>
        </button>
      </div>

      {/* 4. ACTIVE TAB CONTENT */}
      {activeTab === 'my_cluster' ? (
        <div className="space-y-6">
          {/* THE BUNDLE MASTER CARD */}
          <div className="bg-white rounded-[28px] border-2 border-[#1B4332] shadow-sm overflow-hidden">
            {/* Top Bar */}
            <div className="bg-[#1B4332] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white/20 text-emerald-200">
                    {isCurrentLotLocked ? `Lot ID: #${currentLotId}` : '5km Cluster Match'}
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">
                    {totalFarmersCount} {isHindi ? 'किसान एक साथ' : 'Farmers Pooled'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  {isHindi ? currentProfile.cropNameHindi : currentProfile.cropNameEnglish} (Grade {currentProfile.qualityGrade}) - {(totalLotKg / 1000).toFixed(1)} MT Full Truckload
                </h3>

                <p className="text-xs text-emerald-100/80 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{currentProfile.pickupDepot}</span>
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {isCurrentLotLocked ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{isHindi ? 'लॉट सुरक्षित व लॉक है' : 'Lot Locked & Confirmed'}</span>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Share Update"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLockLot}
                    className="bg-amber-400 hover:bg-amber-300 text-[#11281E] px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isHindi ? 'थोक लॉट लॉक करें (+12%)' : 'Lock & Confirm 20 MT Lot'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Metrics Cards */}
            <div className="p-5 sm:p-6 bg-[#F8FAF5] border-b border-[#1B4332]/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#1B4332]/15">
                <span className="text-[10px] font-bold text-[#4D6B53] uppercase tracking-wider block">
                  {isHindi ? 'कुल संयुक्त वजन (वॉल्यूम)' : 'Total Aggregated Volume'}
                </span>
                <div className="text-2xl font-black text-[#11281E] mt-1 flex items-baseline gap-1.5">
                  <span>{(totalLotKg / 1000).toFixed(1)} MT</span>
                  <span className="text-xs font-bold text-[#4D6B53]">
                    ({(totalLotKg / 100).toFixed(0)} Quintals)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>10-Wheeler Full Truckload Batch</span>
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#1B4332]/15">
                <span className="text-[10px] font-bold text-[#4D6B53] uppercase tracking-wider block">
                  {isHindi ? 'थोक भाव तुलना' : 'Price Advantage'}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-[#1B4332]">
                    ₹{currentProfile.bulkWholesalePrice.toFixed(2)}/kg
                  </span>
                  <span className="text-xs text-gray-400 line-through font-bold">
                    ₹{currentProfile.farmerSoloPrice.toFixed(2)}/kg
                  </span>
                </div>
                <span className="text-[11px] font-black text-amber-700 mt-1 block">
                  +₹{pricePremiumPerKg.toFixed(2)}/kg (+{Math.round((pricePremiumPerKg / currentProfile.farmerSoloPrice) * 100)}% Institutional Bonus)
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#1B4332]/15">
                <span className="text-[10px] font-bold text-[#4D6B53] uppercase tracking-wider block">
                  {isHindi ? 'आपकी सीधी अतिरिक्त कमाई' : 'Your Extra In-Pocket Profit'}
                </span>
                <div className="text-2xl font-black text-[#2D5A27] mt-1">
                  +₹{farmerExtraEarnings.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] font-bold text-[#4D6B53] mt-1 block">
                  Total cluster value: ₹{totalLotValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Verified Institutional Buyer Box */}
            <div className="p-5 sm:p-6 bg-amber-50/60 border-b border-amber-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#11281E]">
                        {currentProfile.buyerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Pre-Approved Escrow
                      </span>
                    </div>
                    <p className="text-xs text-[#4D6B53] font-medium mt-0.5">
                      {currentProfile.buyerType} • Ready to procure the entire {(totalLotKg / 1000).toFixed(1)} MT lot directly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Offer Rate</span>
                    <span className="text-base font-black text-[#1B4332]">₹{currentProfile.bulkWholesalePrice}/kg</span>
                  </div>
                  <div className="text-right border-l pl-4 border-amber-200">
                    <span className="text-[10px] text-gray-500 block">Transport</span>
                    <span className="text-xs font-bold text-emerald-700">Free Weighbridge Pickup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Farmers List in this 5km Cluster */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1B4332]" />
                  <span>{isHindi ? 'क्लस्टर में शामिल किसान (5 किमी दायरा)' : 'Farmers Pooled in 5km Radius'}</span>
                </h4>
                <span className="text-xs text-[#4D6B53] font-bold">
                  {totalFarmersCount} Farms Contributing
                </span>
              </div>

              <div className="divide-y divide-[#1B4332]/10 border border-[#1B4332]/15 rounded-2xl bg-white overflow-hidden">
                {/* Farmer 1: Current User (You) */}
                <div className="p-4 bg-emerald-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-white flex items-center justify-center text-xs font-black">
                      You
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#11281E]">
                        {currentUser?.name || 'Ramesh Patel (You)'}
                      </div>
                      <div className="text-[11px] text-[#4D6B53]">
                        {currentUser?.location || 'Lekoda Village, Ujjain'} (Cluster Anchor)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-bold">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Your Contribution:</span>
                      <span className="text-[#11281E] font-black">
                        {(currentProfile.farmerQuantityKg / 100).toFixed(0)} Qtl ({currentProfile.farmerQuantityKg.toLocaleString()} kg)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Your Bonus:</span>
                      <span className="text-emerald-700 font-black">+₹{farmerExtraEarnings.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#1B4332] text-white text-[10px] font-black uppercase">
                      Anchor
                    </span>
                  </div>
                </div>

                {/* Neighbors */}
                {currentProfile.neighbors.map((nb) => (
                  <div
                    key={nb.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAF5] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">
                        {nb.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#11281E]">{nb.name}</div>
                        <div className="text-[11px] text-[#4D6B53] flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#1B4332]" />
                          <span>{nb.village}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-emerald-700 font-bold">{nb.distanceKm} km away</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{nb.harvestReadyDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs font-bold">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Stock:</span>
                        <span className="text-[#11281E] font-black">
                          {(nb.quantityKg / 100).toFixed(0)} Qtl ({nb.quantityKg.toLocaleString()} kg)
                        </span>
                      </div>

                      <a
                        href={`tel:${nb.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0E5] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all text-xs font-bold cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{nb.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Instructions */}
              <div className="p-4 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4D6B53]">
                <div className="flex items-center gap-2 font-medium">
                  <FileCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
                  <span>
                    {isHindi
                      ? 'लॉट लॉक होते ही लेकोड़ा धर्मकांटे पर खाली ट्रक भेजा जाएगा। तौल होते ही सीधे आपके बैंक खाते में 24 घंटे में भुगतान होगा।'
                      : 'Upon locking, a truck is dispatched to the designated local weighbridge. Payment is processed directly to bank accounts within 24 hours.'}
                  </span>
                </div>
                {isCurrentLotLocked && (
                  <button
                    onClick={handleCopyShareText}
                    className="shrink-0 flex items-center gap-1.5 font-bold text-[#1B4332] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'अपडेट कॉपी करें' : 'Copy Dispatch Pass'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGIONAL OPEN LOTS TAB */
        <div className="bg-white p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B4332]/10">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#11281E]">
                {isHindi ? 'उज्जैन क्षेत्र के अन्य खुले सहकारी बंडल' : 'Other Regional Open Bundles'}
              </h3>
              <p className="text-xs text-[#4D6B53]">
                {isHindi
                  ? 'आसपास के गांवों में बन रहे अन्य थोक लॉट जिन्हें आप सीधे जॉइन कर सकते हैं:'
                  : 'Open lots currently assembling in neighboring clusters:'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1B4332] bg-[#E8F0E5] px-3 py-1 rounded-full">
              3 Lots Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lot 1 */}
            <div className="p-4 rounded-2xl border border-[#1B4332]/15 bg-[#F8FAF5] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                    #LOT-MP-5120
                  </span>
                  <span className="text-xs font-bold text-emerald-700">18.0 MT Total</span>
                </div>
                <h4 className="text-base font-black text-[#11281E] mt-2">
                  Mustard (काली सरसों)
                </h4>
                <p className="text-xs text-[#4D6B53]">
                  Hub: Tajpur Khurd (3.2 km away)
                </p>
                <div className="mt-2 text-xs font-bold text-[#1B4332]">
                  ₹58.50/kg (Adani Wilmar Procurement)
                </div>
              </div>

              <div className="pt-3 border-t border-[#1B4332]/10 flex items-center justify-between">
                <span className="text-xs text-gray-500">3 Farmers Joined</span>
                <button
                  onClick={() => {
                    setSelectedCrop('Mustard');
                    setActiveTab('my_cluster');
                  }}
                  className="px-3 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-bold hover:bg-[#2D5A27] transition cursor-pointer"
                >
                  View Lot
                </button>
              </div>
            </div>

            {/* Lot 2 */}
            <div className="p-4 rounded-2xl border border-[#1B4332]/15 bg-[#F8FAF5] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                    #LOT-MP-6340
                  </span>
                  <span className="text-xs font-bold text-emerald-700">22.0 MT Total</span>
                </div>
                <h4 className="text-base font-black text-[#11281E] mt-2">
                  Yellow Soybean (सोयाबीन)
                </h4>
                <p className="text-xs text-[#4D6B53]">
                  Hub: Ghatia Mandi Yard (4.1 km away)
                </p>
                <div className="mt-2 text-xs font-bold text-[#1B4332]">
                  ₹48.00/kg (Patanjali Solvent Unit)
                </div>
              </div>

              <div className="pt-3 border-t border-[#1B4332]/10 flex items-center justify-between">
                <span className="text-xs text-gray-500">4 Farmers Joined</span>
                <button
                  onClick={() => {
                    setSelectedCrop('Soybean');
                    setActiveTab('my_cluster');
                  }}
                  className="px-3 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-bold hover:bg-[#2D5A27] transition cursor-pointer"
                >
                  View Lot
                </button>
              </div>
            </div>

            {/* Lot 3 */}
            <div className="p-4 rounded-2xl border border-[#1B4332]/15 bg-[#F8FAF5] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1B4332] text-white">
                    #LOT-MP-8910
                  </span>
                  <span className="text-xs font-bold text-emerald-700">12.0 MT Total</span>
                </div>
                <h4 className="text-base font-black text-[#11281E] mt-2">
                  Desi Chana (चना)
                </h4>
                <p className="text-xs text-[#4D6B53]">
                  Hub: Lekoda East (1.5 km away)
                </p>
                <div className="mt-2 text-xs font-bold text-[#1B4332]">
                  ₹53.50/kg (Cargill India Procurement)
                </div>
              </div>

              <div className="pt-3 border-t border-[#1B4332]/10 flex items-center justify-between">
                <span className="text-xs text-gray-500">2 Farmers Joined</span>
                <button
                  onClick={() => {
                    setSelectedCrop('Chana');
                    setActiveTab('my_cluster');
                  }}
                  className="px-3 py-1.5 bg-[#1B4332] text-white rounded-lg text-xs font-bold hover:bg-[#2D5A27] transition cursor-pointer"
                >
                  View Lot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / NOTIFY NEIGHBORS MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 border-2 border-[#1B4332]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-[#11281E] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#1B4332]" />
                <span>{isHindi ? 'किसानों को सूचना भेजें' : 'Notify Cluster Neighbors'}</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#4D6B53]">
              {isHindi
                ? 'यह संदेश कॉपी करें या व्हाट्सएप से अपने 5 किमी क्लस्टर के किसानों को भेजें:'
                : 'Share this pre-written confirmation update with your neighbor farmers:'}
            </p>

            <div className="p-4 bg-[#F8FAF5] rounded-xl border border-[#1B4332]/15 text-xs text-[#11281E] font-mono leading-relaxed">
              {getShareText()}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCopyShareText}
                className="flex-1 py-3 bg-[#1B4332] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#2D5A27] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{isHindi ? 'संदेश कॉपी करें' : 'Copy Message'}</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="py-3 px-5 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
