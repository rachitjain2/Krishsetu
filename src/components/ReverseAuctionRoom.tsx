import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Clock,
  TrendingUp,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  IndianRupee,
  Flame,
  Zap,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Award,
  DollarSign,
  Layers,
  ArrowRight,
  Info,
  Check,
  Lock,
  UserCheck
} from 'lucide-react';
import { ReverseAuctionLot, LiveAuctionBid, UserProfile } from '../types';
import { INITIAL_AUCTION_LOTS } from '../data/auctionData';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface ReverseAuctionRoomProps {
  currentUser: UserProfile | null;
  userRole: 'farmer' | 'buyer';
  onNavigateToEscrow?: (orderId: string) => void;
}

export const ReverseAuctionRoom: React.FC<ReverseAuctionRoomProps> = ({
  currentUser,
  userRole,
}) => {
  const [lots, setLots] = useState<ReverseAuctionLot[]>(INITIAL_AUCTION_LOTS);
  const [selectedLotId, setSelectedLotId] = useState<string>(INITIAL_AUCTION_LOTS[0].id);
  const [isSimulatingBids, setIsSimulatingBids] = useState<boolean>(false);
  const [customBidIncrement, setCustomBidIncrement] = useState<number>(50);
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bidding_floor' | 'middlemen_comparison' | 'all_lots'>('bidding_floor');

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  const activeLot = lots.find((l) => l.id === selectedLotId) || lots[0];

  // Realtime countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLots((prevLots) =>
        prevLots.map((lot) => {
          if (lot.status === 'live' || lot.status === 'ending_soon') {
            const nextRemaining = Math.max(0, lot.remainingSeconds - 1);
            return {
              ...lot,
              remainingSeconds: nextRemaining,
              status: nextRemaining === 0 ? 'completed' : nextRemaining < 120 ? 'ending_soon' : 'live',
            };
          }
          return lot;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Live Auto-Bidding Simulation Engine (Highest Demo Impact)
  useEffect(() => {
    if (!isSimulatingBids) return;

    const competitorBidders = [
      { name: 'Kunal Singhania', company: 'Adani Wilmar Agri Procurement', location: 'Pithampur Hub, MP', rating: 4.9 },
      { name: 'Vikram Mehta', company: 'ITC Choupal Saagar Mega Mill', location: 'Indore Mandi Hub', rating: 4.8 },
      { name: 'Harish Chawla', company: 'Patanjali Agro Industries', location: 'Haridwar / Jaipur', rating: 4.7 },
      { name: 'Sanjay Deshpande', company: 'Tata Consumer Products Ltd.', location: 'Bhopal Central Depot', rating: 5.0 },
      { name: 'Prakash Goyal', company: 'Haldiram Direct Farm Sourcing', location: 'Nagpur Central Hub', rating: 4.9 },
    ];

    const simInterval = setInterval(() => {
      setLots((prevLots) => {
        return prevLots.map((lot) => {
          if (lot.id !== selectedLotId || lot.status === 'completed') return lot;

          // Increment bid by ₹20 - ₹50
          const increment = Math.floor(Math.random() * 3 + 1) * 15;
          const newBidPrice = lot.currentHighestBid + increment;
          const bidder = competitorBidders[Math.floor(Math.random() * competitorBidders.length)];

          const newBid: LiveAuctionBid = {
            id: `BID-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            bidderId: `buyer-${Math.floor(Math.random() * 100)}`,
            bidderName: bidder.name,
            bidderCompany: bidder.company,
            bidderLocation: bidder.location,
            bidderRating: bidder.rating,
            bidAmountPerUnit: newBidPrice,
            totalLotAmount: newBidPrice * lot.quantity,
            timestamp: 'Just now',
            isAutoBid: true,
            status: 'winning',
          };

          const updatedBidsHistory: LiveAuctionBid[] = [
            newBid,
            ...lot.bidsHistory.map((b) => ({ ...b, status: 'outbid' as const })),
          ];

          return {
            ...lot,
            currentHighestBid: newBidPrice,
            totalBidsCount: lot.totalBidsCount + 1,
            leadingBidderName: bidder.name,
            leadingBidderCompany: bidder.company,
            bidsHistory: updatedBidsHistory,
            remainingSeconds: Math.min(lot.remainingSeconds + 15, 600), // Extend slightly on late bid
          };
        });
      });
    }, 3200);

    return () => clearInterval(simInterval);
  }, [isSimulatingBids, selectedLotId]);

  // Place a buyer bid
  const handlePlaceBid = (incrementAmount: number) => {
    const targetPrice = activeLot.currentHighestBid + incrementAmount;
    const buyerName = currentUser?.name || 'AgroFoods Procurement Hub';
    const buyerCompany = currentUser?.specializationOrBusiness || 'Direct Buyer Enterprise';
    const buyerLocation = currentUser?.location || 'Indore/Delhi Logistics Hub';

    const newBid: LiveAuctionBid = {
      id: `BID-MANUAL-${Date.now()}`,
      bidderId: currentUser?.uid || 'buyer-active',
      bidderName: buyerName,
      bidderCompany: buyerCompany,
      bidderLocation: buyerLocation,
      bidderRating: 4.9,
      bidAmountPerUnit: targetPrice,
      totalLotAmount: targetPrice * activeLot.quantity,
      timestamp: 'Just now',
      status: 'winning',
    };

    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id === activeLot.id) {
          return {
            ...lot,
            currentHighestBid: targetPrice,
            totalBidsCount: lot.totalBidsCount + 1,
            leadingBidderName: buyerName,
            leadingBidderCompany: buyerCompany,
            bidsHistory: [newBid, ...lot.bidsHistory.map((b) => ({ ...b, status: 'outbid' as const }))],
            remainingSeconds: Math.max(lot.remainingSeconds, 90), // ensure at least 90s remains
          };
        }
        return lot;
      })
    );

    showSuccess(
      isHindi ? `बोली सफलतापूर्वक दर्ज हुई: ₹${targetPrice}/क्विंटल` : `Live Bid Placed: ₹${targetPrice}/Qtl`,
      isHindi ? `कुल लॉट मूल्य: ₹${(targetPrice * activeLot.quantity).toLocaleString('en-IN')}` : `Total Lot: ₹${(targetPrice * activeLot.quantity).toLocaleString('en-IN')}`
    );
    setCustomBidAmount('');
  };

  // Farmer accepts current highest bid & locks escrow
  const handleAcceptWinningBid = () => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id === activeLot.id) {
          return {
            ...lot,
            status: 'completed',
            remainingSeconds: 0,
            escrowStatus: 'Locked & Funded',
          };
        }
        return lot;
      })
    );

    showSuccess(
      isHindi ? 'सौदे की पुष्टि व एस्क्रो लॉक!' : 'Deal Locked & 100% Escrow Funded!',
      isHindi
        ? `विजेता खरीदार (${activeLot.leadingBidderCompany}) से ₹${(activeLot.currentHighestBid * activeLot.quantity).toLocaleString('en-IN')} एस्क्रो में सुरक्षित जमा कर दिए गए हैं।`
        : `₹${(activeLot.currentHighestBid * activeLot.quantity).toLocaleString('en-IN')} safely deposited into KrishiSetu Escrow from ${activeLot.leadingBidderCompany}.`
    );
  };

  // Extend auction time
  const handleExtendAuction = () => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id === activeLot.id) {
          return {
            ...lot,
            remainingSeconds: lot.remainingSeconds + 300,
            status: 'live',
          };
        }
        return lot;
      })
    );
    showInfo(
      isHindi ? 'ऑक्शन 5 मिनट बढ़ाया गया' : 'Auction Extended by 5 Minutes',
      isHindi ? 'अधिक खरीदारों को बोली लगाने का अवसर दिया गया।' : 'Gives more bulk buyers time to outbid.'
    );
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Middleman comparison math
  const quantity = activeLot.quantity;
  const mandiBenchmarkPrice = activeLot.mandiBenchmarkPrice; // e.g. ₹2310
  const mandiGross = quantity * mandiBenchmarkPrice;
  const mandiCommission = mandiGross * 0.06; // 6% APMC commission
  const mandiBrokerage = mandiGross * 0.04; // 4% Adhat & brokerage
  const mandiDelayedPaymentDeduction = mandiGross * 0.03; // 3% unofficial discount for delayed cash
  const mandiNetFarmerRealization = mandiGross - (mandiCommission + mandiBrokerage + mandiDelayedPaymentDeduction);
  const mandiNetPerQtl = Math.round(mandiNetFarmerRealization / quantity);

  const directAuctionPrice = activeLot.currentHighestBid;
  const directAuctionTotal = quantity * directAuctionPrice;
  const directAuctionNetFarmerRealization = directAuctionTotal; // 0 middleman cut
  const directAuctionNetPerQtl = directAuctionPrice;

  const extraFarmerProfit = directAuctionNetFarmerRealization - mandiNetFarmerRealization;
  const extraProfitPercent = ((extraFarmerProfit / mandiNetFarmerRealization) * 100).toFixed(1);

  return (
    <div className="space-y-6" id="reverse-auction-marketplace-root">
      {/* Header Banner */}
      <div className="bg-radial from-[#1B4332] to-[#0F281E] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#1B4332] shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                {isHindi ? 'लाइव रिवर्स-ऑक्शन मंडी' : 'Live Reverse-Auction Marketplace'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider border border-white/15 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isHindi ? '100% एस्क्रो सुरक्षित' : '100% Escrow Protected'}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-black uppercase tracking-wider border border-amber-400/30">
                {isHindi ? 'शून्य दलाल कमीशन' : '0% Middleman Cut'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi ? 'थोक खरीदार लाइव बोली केंद्र' : 'Farmer Produce Reverse-Auction Room'}
            </h1>
            <p className="text-sm text-emerald-100/80 font-medium max-w-2xl leading-relaxed">
              {isHindi
                ? 'किसान न्यूनतम आरक्षित मूल्य (Floor Price) तय करते हैं, कॉर्पोरेट व थोक खरीदार लाइव प्रतिस्पर्धा में बोली बढ़ाते हैं। बिचौलियों का 12-15% कमीशन सीधे किसान के खाते में बचता है।'
                : 'Farmers set a floor price, institutional & bulk buyers bid live in real-time. Price ticks up competitively with guaranteed instant escrow release on dispatch.'}
            </p>
          </div>

          {/* Quick Stats / Action Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="simulate-bids-toggle-btn"
              onClick={() => {
                setIsSimulatingBids(!isSimulatingBids);
                showInfo(
                  isSimulatingBids ? 'लाइव सिमुलेशन रोका गया' : 'लाइव बोली सिमुलेशन शुरू!',
                  isSimulatingBids
                    ? 'Simulation paused.'
                    : 'Watch buyers dynamically outbid each other in real-time!'
                );
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md min-h-[44px] ${
                isSimulatingBids
                  ? 'bg-amber-400 text-[#11281E] border-2 border-amber-300 ring-2 ring-amber-300/40 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isSimulatingBids ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-300" />}
              <span>{isSimulatingBids ? (isHindi ? 'सिमुलेशन रोकें' : 'Pause Live Bidding') : (isHindi ? '⚡ लाइव बोली सिमुलेट करें (Demo)' : '⚡ Simulate Live Bidding (Demo)')}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button
            id="tab-bidding-floor"
            onClick={() => setActiveTab('bidding_floor')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'bidding_floor'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>{isHindi ? 'सक्रिय बोली हॉल (Live Hall)' : 'Live Bidding Room'}</span>
          </button>

          <button
            id="tab-middlemen-comparison"
            onClick={() => setActiveTab('middlemen_comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'middlemen_comparison'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'दलाल बनाम सीधी नीलामी तुलना (+30% लाभ)' : 'Eliminate Middlemen Matrix (+30.8% Profit)'}</span>
          </button>

          <button
            id="tab-all-lots"
            onClick={() => setActiveTab('all_lots')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'all_lots'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isHindi ? `सभी सक्रिय लॉट (${lots.length})` : `All Active Lots (${lots.length})`}</span>
          </button>
        </div>
      </div>

      {/* Lot Selector Horizontal Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {lots.map((lot) => {
          const isSelected = lot.id === selectedLotId;
          const isCompleted = lot.status === 'completed';

          return (
            <button
              key={lot.id}
              id={`select-lot-${lot.id}`}
              onClick={() => setSelectedLotId(lot.id)}
              className={`p-3.5 rounded-2xl text-left transition-all shrink-0 min-w-[240px] max-w-[280px] border-2 ${
                isSelected
                  ? 'bg-white border-[#1B4332] shadow-sm ring-2 ring-[#1B4332]/15'
                  : 'bg-[#F8FAF5] border-[#1B4332]/10 hover:border-[#1B4332]/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                  {lot.category}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-700'
                      : lot.status === 'ending_soon'
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-slate-500' : 'bg-emerald-600 animate-ping'}`} />
                  {isCompleted ? 'Completed' : formatTime(lot.remainingSeconds)}
                </span>
              </div>

              <h4 className="text-xs font-black uppercase tracking-tight text-[#11281E] truncate">
                {isHindi ? lot.hindiName : lot.cropName}
              </h4>
              <p className="text-[11px] text-[#4D6B53] font-bold">
                {lot.quantity} {lot.unit} • {lot.cluster}
              </p>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#1B4332]/10">
                <div>
                  <span className="text-[9px] font-bold uppercase text-[#6C8573] block">Current Bid</span>
                  <span className="text-sm font-black text-[#1B4332]">
                    ₹{lot.currentHighestBid.toLocaleString('en-IN')}/{lot.unit === 'Quintals' ? 'Qtl' : 'Unit'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase text-[#6C8573] block">Floor MSP</span>
                  <span className="text-xs font-black text-[#6C8573]">₹{lot.floorPrice}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: ACTIVE BIDDING ROOM */}
      {activeTab === 'bidding_floor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lot Display & Live Price Ticker (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#1B4332]/15 shadow-xs relative">
              {/* Top Meta */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-[#1B4332]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332] border border-[#1B4332]/20">
                      {activeLot.id}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      {activeLot.qualityGrade}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? activeLot.hindiName : activeLot.cropName}
                  </h2>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    {isHindi ? 'किसान' : 'Listed by'}: <span className="text-[#11281E]">{activeLot.farmerName}</span> • {activeLot.cluster}
                  </p>
                </div>

                {/* Countdown Box */}
                <div className="p-3 bg-[#F8FAF5] rounded-2xl border-2 border-[#1B4332]/15 text-center min-w-[120px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                    {isHindi ? 'शेष समय (Timer)' : 'Time Remaining'}
                  </span>
                  <span
                    className={`text-xl font-black tracking-tight ${
                      activeLot.remainingSeconds < 120 ? 'text-rose-600 animate-pulse' : 'text-[#1B4332]'
                    }`}
                  >
                    {formatTime(activeLot.remainingSeconds)}
                  </span>
                  <span className="text-[9px] font-bold text-[#6C8573] block mt-0.5">
                    {activeLot.totalBidsCount} {isHindi ? 'बोलियां दर्ज' : 'Bids Placed'}
                  </span>
                </div>
              </div>

              {/* LIVE PRICE HERO TICKER */}
              <div className="my-6 p-6 rounded-3xl bg-radial from-[#F4F9F2] to-[#E9F3E6] border-2 border-[#1B4332]/20 text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-[#1B4332]">
                    {isHindi ? 'वर्तमान उच्चतम बोली (Current High Bid)' : 'Current Highest Bid (Ticks Up Live)'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-4xl sm:text-5xl font-black tracking-tight text-[#11281E] my-2">
                  <span className="text-2xl sm:text-3xl text-[#2D5A27]">₹</span>
                  <span className="transition-all duration-300 font-mono">{activeLot.currentHighestBid.toLocaleString('en-IN')}</span>
                  <span className="text-sm sm:text-base font-bold text-[#4D6B53]">/ {activeLot.unit === 'Quintals' ? 'Quintal' : 'MT'}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#4D6B53] mt-3 pt-3 border-t border-[#1B4332]/10">
                  <span>
                    {isHindi ? 'न्यूनतम आरक्षित मूल्य' : 'Floor MSP'}: <strong className="text-[#11281E]">₹{activeLot.floorPrice}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {isHindi ? 'कुल लॉट मूल्य' : 'Total Value'}:{' '}
                    <strong className="text-[#1B4332]">
                      ₹{(activeLot.currentHighestBid * activeLot.quantity).toLocaleString('en-IN')}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    {isHindi ? 'अग्रणी खरीदार' : 'Leading Bidder'}:{' '}
                    <strong className="text-[#11281E]">{activeLot.leadingBidderCompany || 'Direct Buyer'}</strong>
                  </span>
                </div>
              </div>

              {/* Interactive Bidding Controls for Buyers & Farmers */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{isHindi ? 'त्वरित बोली लगाएं (+INR / क्विंटल)' : 'Instant 1-Click Bid Increments'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#4D6B53]">
                    {isHindi ? 'अगली न्यूनतम वैध बोली' : 'Next Valid Bid'}: ₹{activeLot.currentHighestBid + 25}
                  </span>
                </div>

                {/* Quick Increment Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[25, 50, 100, 200].map((inc) => (
                    <button
                      key={inc}
                      id={`bid-inc-btn-${inc}`}
                      onClick={() => handlePlaceBid(inc)}
                      disabled={activeLot.status === 'completed'}
                      className="py-3 px-3 rounded-2xl bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#1B4332] font-black text-xs uppercase tracking-wider border-2 border-[#1B4332]/20 hover:border-[#1B4332] transition-all flex flex-col items-center justify-center min-h-[52px] shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-sm font-black">+₹{inc}</span>
                      <span className="text-[9px] font-bold text-[#6C8573]">₹{activeLot.currentHighestBid + inc}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Bid Input */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="relative flex-1">
                    <IndianRupee className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="custom-bid-input"
                      type="number"
                      placeholder={`Enter custom bid > ₹${activeLot.currentHighestBid}`}
                      value={customBidAmount}
                      onChange={(e) => setCustomBidAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-black text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-white min-h-[44px]"
                    />
                  </div>
                  <button
                    id="submit-custom-bid-btn"
                    onClick={() => {
                      const val = Number(customBidAmount);
                      if (val > activeLot.currentHighestBid) {
                        handlePlaceBid(val - activeLot.currentHighestBid);
                      } else {
                        showInfo('Invalid Bid', `Must be strictly greater than current ₹${activeLot.currentHighestBid}`);
                      }
                    }}
                    disabled={!customBidAmount || Number(customBidAmount) <= activeLot.currentHighestBid || activeLot.status === 'completed'}
                    className="px-5 py-3 rounded-2xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider hover:bg-[#11281E] transition-all min-h-[44px] shadow-sm disabled:opacity-50 shrink-0"
                  >
                    {isHindi ? 'बोली सबमिट करें' : 'Submit Bid'}
                  </button>
                </div>

                {/* Farmer Controls: Accept & Lock Escrow */}
                <div className="pt-4 border-t-2 border-[#1B4332]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-bold text-[#4D6B53] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#2D5A27]" />
                    <span>
                      {isHindi ? 'एस्क्रो स्थिति' : 'Escrow Status'}: <strong className="text-[#1B4332]">{activeLot.escrowStatus}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="extend-auction-btn"
                      onClick={handleExtendAuction}
                      className="px-3.5 py-2.5 rounded-xl border border-[#1B4332]/25 text-[#1B4332] font-black text-[11px] uppercase tracking-wider hover:bg-[#E8F0E5] transition-colors"
                    >
                      {isHindi ? '+5 मिनट बढ़ाएं' : '+5 Mins'}
                    </button>
                    <button
                      id="accept-winning-bid-btn"
                      onClick={handleAcceptWinningBid}
                      disabled={activeLot.status === 'completed'}
                      className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1B4332] text-white font-black text-[11px] uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{isHindi ? 'बोली स्वीकारें व एस्क्रो लॉक करें' : 'Accept Bid & Lock Escrow'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middleman Elimination Quick Callout Card */}
            <div className="bg-[#FAF3E0] rounded-3xl p-5 border-2 border-[#D4A373]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B4332] text-[#FAF3E0]">
                  Middleman Elimination Impact
                </span>
                <h4 className="text-sm font-black text-[#11281E]">
                  {isHindi ? 'पारंपरिक मंडी की तुलना में किसान को सीधा अतिरिक्त लाभ' : 'Farmer Net Realization vs Traditional Mandi'}
                </h4>
                <p className="text-xs text-[#7F5539] font-semibold">
                  Mandi Net: ₹{mandiNetPerQtl}/Qtl ➔ Reverse Auction Net: <strong>₹{directAuctionNetPerQtl}/Qtl</strong>
                </p>
              </div>
              <div className="text-right shrink-0 bg-white p-3 rounded-2xl border border-[#D4A373]/30 shadow-xs">
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Extra Farmer Profit</span>
                <span className="text-lg font-black text-emerald-700">
                  +₹{extraFarmerProfit.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-black text-emerald-600 block">(+{extraProfitPercent}% More)</span>
              </div>
            </div>
          </div>

          {/* Live Bids Feed & Lot Specifications (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Bids Activity Stream */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1B4332]/10 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
                    {isHindi ? 'लाइव बोली इतिहास (Live Feed)' : 'Live Bids Activity Stream'}
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                  {activeLot.bidsHistory.length} Bids
                </span>
              </div>

              {/* Bids List */}
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {activeLot.bidsHistory.map((bid, idx) => {
                  const isWinning = idx === 0 && bid.status === 'winning';

                  return (
                    <div
                      key={bid.id}
                      className={`p-3.5 rounded-2xl transition-all border ${
                        isWinning
                          ? 'bg-[#F4F9F2] border-[#1B4332] shadow-xs'
                          : 'bg-[#F8FAF5] border-[#1B4332]/10 opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black uppercase tracking-tight text-[#11281E] truncate">
                              {bid.bidderCompany}
                            </span>
                            {isWinning && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-[#1B4332] text-white shrink-0">
                                Leading
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#4D6B53] font-bold truncate">
                            {bid.bidderName} • {bid.bidderLocation}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-[#1B4332] block">
                            ₹{bid.bidAmountPerUnit.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-bold text-[#6C8573] block">{bid.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lot Specification Meta */}
              <div className="mt-4 pt-4 border-t-2 border-[#1B4332]/10 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1B4332]/5">
                  <span className="text-[#6C8573] font-bold">Total Batch Size:</span>
                  <span className="font-black text-[#11281E]">
                    {activeLot.quantity} {activeLot.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1B4332]/5">
                  <span className="text-[#6C8573] font-bold">Moisture Content:</span>
                  <span className="font-black text-[#11281E]">{activeLot.moisturePercent}% (Verified)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1B4332]/5">
                  <span className="text-[#6C8573] font-bold">Quality Certification:</span>
                  <span className="font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NABL Certified
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#6C8573] font-bold">Delivery Terms:</span>
                  <span className="font-medium text-[#11281E] text-right truncate max-w-[200px]">{activeLot.deliveryTerms}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ELIMINATE MIDDLEMEN COMPARATIVE PROFIT MATRIX */}
      {activeTab === 'middlemen_comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B4332]/15 shadow-xs">
            <div className="max-w-3xl mb-6">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332] border border-[#1B4332]/20">
                Visual Proof of Middleman Elimination
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E] mt-1">
                {isHindi ? 'पारंपरिक मंडी बनाम कृषिसेतु सीधी नीलामी (पारदर्शिता तुलना)' : 'Traditional Mandi vs KrishiSetu Reverse Auction Matrix'}
              </h2>
              <p className="text-xs text-[#4D6B53] font-medium mt-1">
                {isHindi
                  ? 'पारंपरिक कृषि मंडियों में किसान से 6% आढ़त/कमीशन, 4% दलाली और 3% नकद छूट काटी जाती है। कृषिसेतु पर कॉर्पोरेट खरीदार सीधे बोली लगाते हैं और पूरा पैसा किसान को मिलता है।'
                  : 'Traditional APMC mandis extract 12-15% through intermediary commissions, weighbridge cuts, and deferred payment losses. KrishiSetu routes 100% of the institutional buyer bid directly to the farmer.'}
              </p>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Mandi Route */}
              <div className="p-6 rounded-3xl bg-rose-50/70 border-2 border-rose-200/80 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                    Traditional APMC Mandi
                  </span>
                  <span className="text-xs font-bold text-rose-700">Delayed 30-45 Days</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs py-1 border-b border-rose-200/60">
                    <span className="text-[#6C8573] font-bold">Mandi Benchmark Rate:</span>
                    <span className="font-black text-[#11281E]">₹{mandiBenchmarkPrice} / Qtl</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-rose-200/60 text-rose-700">
                    <span>APMC Mandi Commission (6%):</span>
                    <span className="font-black">-₹{Math.round(mandiCommission / quantity)} / Qtl</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-rose-200/60 text-rose-700">
                    <span>Adhatiya Brokerage (4%):</span>
                    <span className="font-black">-₹{Math.round(mandiBrokerage / quantity)} / Qtl</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-rose-200/60 text-rose-700">
                    <span>Cash Liquidity Discount (3%):</span>
                    <span className="font-black">-₹{Math.round(mandiDelayedPaymentDeduction / quantity)} / Qtl</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-rose-200 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
                    Farmer Net Realization (After Cuts)
                  </span>
                  <span className="text-2xl font-black text-rose-900">
                    ₹{mandiNetPerQtl} <span className="text-xs font-bold">/ Quintal</span>
                  </span>
                  <p className="text-xs font-bold text-rose-800 mt-1">
                    Total Net: ₹{mandiNetFarmerRealization.toLocaleString('en-IN')} (on {quantity} Qtl)
                  </p>
                </div>
              </div>

              {/* KrishiSetu Reverse Auction Route */}
              <div className="p-6 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 space-y-4 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    KrishiSetu Live Reverse-Auction
                  </span>
                  <span className="text-xs font-bold text-emerald-700">Instant T+0 Escrow</span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs py-1 border-b border-emerald-200">
                    <span className="text-[#4D6B53] font-bold">Bulk Buyer Winning Bid:</span>
                    <span className="font-black text-[#11281E]">₹{directAuctionPrice} / Qtl</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-emerald-200 text-emerald-700">
                    <span>Mandi Middleman Commission:</span>
                    <span className="font-black">₹0 (Zero Cut)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-emerald-200 text-emerald-700">
                    <span>Brokerage & Under-Weighing:</span>
                    <span className="font-black">₹0 (Digital Weighbridge)</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-emerald-200 text-emerald-700">
                    <span>Escrow Settlement Guarantee:</span>
                    <span className="font-black">100% Protected</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-emerald-300 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Farmer Net Realization (Direct to Bank)
                  </span>
                  <span className="text-2xl font-black text-emerald-950">
                    ₹{directAuctionNetPerQtl} <span className="text-xs font-bold">/ Quintal</span>
                  </span>
                  <p className="text-xs font-black text-emerald-900 mt-1">
                    Total Net: ₹{directAuctionNetFarmerRealization.toLocaleString('en-IN')} (on {quantity} Qtl)
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bottomline Banner */}
            <div className="mt-6 p-6 rounded-3xl bg-[#1B4332] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  Net Value Created For This Farmer Batch
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                  +₹{extraFarmerProfit.toLocaleString('en-IN')} Extra Cash in Farmer's Pocket
                </h3>
                <p className="text-xs text-emerald-200 font-medium">
                  {isHindi
                    ? `सीधी नीलामी से किसान की आय में ${extraProfitPercent}% की वास्तविक वृद्धि हुई।`
                    : `Direct bulk auction increased farmer take-home profit by ${extraProfitPercent}%.`}
                </p>
              </div>

              <button
                id="lock-auction-deal-from-matrix-btn"
                onClick={handleAcceptWinningBid}
                className="px-6 py-3.5 rounded-2xl bg-amber-400 text-[#11281E] font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md shrink-0"
              >
                {isHindi ? 'यह सौदा स्वीकार करें' : 'Lock This Winning Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ALL LOTS DIRECTORY */}
      {activeTab === 'all_lots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs space-y-4 hover:border-[#1B4332] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                    {lot.category}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {formatTime(lot.remainingSeconds)}
                  </span>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 relative">
                  <img src={lot.imageUrl} alt={lot.cropName} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    {lot.quantity} {lot.unit}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase text-[#11281E] tracking-tight">
                    {isHindi ? lot.hindiName : lot.cropName}
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">{lot.farmerName} • {lot.cluster}</p>
                </div>

                <div className="p-3 bg-[#F8FAF5] rounded-2xl border border-[#1B4332]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-[#6C8573] uppercase block">Current Bid</span>
                    <span className="text-base font-black text-[#1B4332]">₹{lot.currentHighestBid}/Qtl</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-[#6C8573] uppercase block">Floor MSP</span>
                    <span className="text-xs font-black text-[#6C8573]">₹{lot.floorPrice}</span>
                  </div>
                </div>
              </div>

              <button
                id={`view-lot-details-${lot.id}`}
                onClick={() => {
                  setSelectedLotId(lot.id);
                  setActiveTab('bidding_floor');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider hover:bg-[#11281E] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isHindi ? 'लाइव बोली कक्ष में प्रवेश करें' : 'Enter Live Bidding Room'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
