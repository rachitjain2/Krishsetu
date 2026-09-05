import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  DollarSign,
  Download,
  QrCode,
  FileCheck,
  Percent,
  Sliders,
  Check,
  ArrowUpRight
} from 'lucide-react';
import { KisanMicroCreditProfile, CreditPillarScore, UserProfile } from '../types';
import { INITIAL_KISAN_CREDIT_PROFILE } from '../data/microCreditData';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface AgriCreditScoreEngineProps {
  currentUser: UserProfile | null;
  onNavigateToRental?: () => void;
  onNavigateToAuction?: () => void;
}

export const AgriCreditScoreEngine: React.FC<AgriCreditScoreEngineProps> = ({
  currentUser,
  onNavigateToRental,
  onNavigateToAuction,
}) => {
  const [profile, setProfile] = useState<KisanMicroCreditProfile>(INITIAL_KISAN_CREDIT_PROFILE);
  const [simExtraRentals, setSimExtraRentals] = useState<boolean>(false);
  const [simExtraAuctions, setSimExtraAuctions] = useState<boolean>(false);
  const [simHighNDVI, setSimHighNDVI] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'credit_overview' | 'credit_simulator' | 'agri_passport'>('credit_overview');

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  // Dynamic simulated score
  let simulatedScore = profile.overallScore;
  if (simExtraRentals) simulatedScore += 22;
  if (simExtraAuctions) simulatedScore += 18;
  if (simHighNDVI) simulatedScore += 12;
  simulatedScore = Math.min(895, simulatedScore);

  const simulatedPreApproved = Math.round((simulatedScore / 785) * profile.preApprovedLoanAmount);

  const handleApplyLoan = (offerTitle: string, amount: number) => {
    showSuccess(
      isHindi ? 'माइक्रो-लोन आवेदन स्वीकृत!' : 'Instant Micro-Credit Disbursed!',
      isHindi
        ? `₹${amount.toLocaleString('en-IN')} आपके बैंक खाते में 2 मिनट में जमा कर दिए गए हैं (4.5% ब्याज दर)।`
        : `₹${amount.toLocaleString('en-IN')} approved under Priority Sector Lending at 4.5% p.a. subsidized rate.`
    );
  };

  const handlePrintPassport = () => {
    window.print();
    showInfo('Agri-Credit Passport Exported', 'Digital identity generated for NABARD & Rural Bank integration.');
  };

  return (
    <div className="space-y-6" id="agri-credit-score-engine-root">
      {/* Header Banner */}
      <div className="bg-radial from-[#1B4332] via-[#163829] to-[#0D241A] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#1B4332] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Novel Agri-FinTech Differentiator
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider border border-white/15">
                Financial Inclusion Infrastructure
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
                NABARD / PSL Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi ? 'किसान क्रेडिट स्कोर व वित्तीय समावेशन' : 'Kisan AgriScore & Micro-Credit Engine'}
            </h1>
            <p className="text-sm text-emerald-100/80 font-medium max-w-2xl leading-relaxed">
              {isHindi
                ? 'कृषिसेतु केवल एक बाज़ार नहीं है — यह मशीनरी समयबद्धता, सैटेलाइट एनडीवीआई फसल स्वास्थ्य और एस्क्रो भुगतान इतिहास से किसान का वास्तविक क्रेडिट स्कोर बनाता है, जिससे बैंक बिना जमानत 4.5% पर त्वरित ऋण देते हैं।'
                : 'Reframes KrishiSetu from a marketplace app into financial inclusion infrastructure. Combines machinery telemetry, Sentinel-2 yield reliability, and escrow velocity into an ungameable credit rating.'}
            </p>
          </div>

          {/* Top Score Badge */}
          <div className="p-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-xs text-center min-w-[140px] shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
              Kisan AgriScore
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white my-0.5 font-mono">
              {profile.overallScore}
            </div>
            <span className="text-[10px] font-bold text-emerald-300 block">{profile.scoreTier}</span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button
            id="tab-credit-overview"
            onClick={() => setActiveTab('credit_overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'credit_overview'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'स्कोर व 5 टेलीमेट्री स्तंभ' : 'Score & 5 Telemetry Pillars'}</span>
          </button>

          <button
            id="tab-credit-simulator"
            onClick={() => setActiveTab('credit_simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'credit_simulator'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHindi ? 'इंटरएक्टिव स्कोर सिम्युलेटर (+ऋण सीमा)' : 'Interactive Credit Simulator'}</span>
          </button>

          <button
            id="tab-agri-passport"
            onClick={() => setActiveTab('agri_passport')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'agri_passport'
                ? 'bg-white text-[#11281E] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHindi ? 'डिजिटल कृषि-क्रेडिट पासपोर्ट (QR Pass)' : 'Digital Agri-Credit Passport'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SCORE & 5 TELEMETRY PILLARS */}
      {activeTab === 'credit_overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 5 Pillars Breakdown (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
              <span>5 Verifiable Platform Telemetry Pillars</span>
            </h3>

            {(Object.entries(profile.pillars) as [string, CreditPillarScore][]).map(([key, pillar]) => (
              <div
                key={key}
                className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                        Weight: {pillar.weight}%
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {pillar.status} ({pillar.score}/100)
                      </span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-[#11281E]">
                      {isHindi ? pillar.hindiName : pillar.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-[#1B4332] font-mono">{pillar.score}</span>
                    <span className="text-[10px] text-[#6C8573] block font-bold">/ 100</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pillar.score}%` }} />
                </div>

                <p className="text-xs text-[#4D6B53] font-medium leading-relaxed bg-[#F8FAF5] p-2.5 rounded-xl border border-[#1B4332]/10">
                  💡 {pillar.keyInsight}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pillar.metrics.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-bold text-[#1B4332] bg-[#E8F0E5]/60 px-2.5 py-1 rounded-lg border border-[#1B4332]/15"
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pre-Approved Micro-Loans (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Prime Pre-Approval Hero */}
            <div className="bg-radial from-[#1B4332] to-[#0E261C] rounded-3xl p-6 text-white border-2 border-[#1B4332] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Pre-Approved Credit Limit
                </span>
                <span className="text-xs font-bold text-emerald-300">4.5% p.a. Subsidized</span>
              </div>

              <div className="text-center py-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300 block">
                  Available Working Capital Line
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white my-1 font-mono">
                  ₹{profile.availableCreditLine.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-200 font-medium">
                  Zero collateral • Disbursed in 2 minutes via Aadhaar UPI
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-emerald-100">Cumulative Escrow Turnover:</span>
                  <span className="font-bold text-white">₹{profile.totalEscrowVolumeProcessed.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">On-Time Settlement Rate:</span>
                  <span className="font-bold text-emerald-300">{profile.onTimeSettlementRate}%</span>
                </div>
              </div>
            </div>

            {/* Micro-Loan Products */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
                Active Financial Inclusion Offers
              </h4>

              {profile.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl p-5 border-2 border-[#1B4332]/15 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                        {offer.badge}
                      </span>
                      <h5 className="text-sm font-black uppercase text-[#11281E] tracking-tight mt-1">
                        {offer.title}
                      </h5>
                    </div>
                    <span className="text-base font-black text-[#1B4332]">
                      ₹{offer.maxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-[#4D6B53] font-medium leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1B4332]/10">
                    <span className="text-[#6C8573] font-bold">
                      Rate: <strong className="text-[#11281E]">{offer.interestRate}% p.a.</strong> • {offer.tenureMonths} Mo
                    </span>
                    <button
                      id={`apply-loan-${offer.id}`}
                      onClick={() => handleApplyLoan(offer.title, offer.maxAmount)}
                      className="px-4 py-2 rounded-xl bg-[#1B4332] text-white font-black text-[11px] uppercase tracking-wider hover:bg-[#11281E] transition-all"
                    >
                      Instant Disburse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE SCORE SIMULATOR */}
      {activeTab === 'credit_simulator' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B4332]/15 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
              Real-Time Credit Score Simulator
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#11281E]">
              {isHindi ? 'देखें कि कैसे कृषि व्यवहार आपका क्रेडिट स्कोर बढ़ाता है' : 'Simulate Future Actions & Credit Line Boost'}
            </h2>
            <p className="text-xs text-[#4D6B53] font-medium">
              Toggle actions below to see how prompt equipment return and dispute-free auctions raise your credit score.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Simulator Toggles (Col 7) */}
            <div className="lg:col-span-7 space-y-3">
              <div
                onClick={() => setSimExtraRentals(!simExtraRentals)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  simExtraRentals
                    ? 'bg-[#F4F9F2] border-[#1B4332] shadow-xs'
                    : 'bg-[#F8FAF5] border-[#1B4332]/15'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-[#11281E]">
                    Complete 3 Upcoming Tractor Bookings with On-Time OTP
                  </h4>
                  <p className="text-[11px] text-[#4D6B53] font-medium">
                    Boosts Machinery Rental Discipline Pillar (30% weight)
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                  +22 Points
                </span>
              </div>

              <div
                onClick={() => setSimExtraAuctions(!simExtraAuctions)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  simExtraAuctions
                    ? 'bg-[#F4F9F2] border-[#1B4332] shadow-xs'
                    : 'bg-[#F8FAF5] border-[#1B4332]/15'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-[#11281E]">
                    Fulfill 2 Reverse-Auction Bulk Deliveries with NABL Grade A+
                  </h4>
                  <p className="text-[11px] text-[#4D6B53] font-medium">
                    Boosts Auction Fulfillment & Trade Reliability Pillar (25% weight)
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                  +18 Points
                </span>
              </div>

              <div
                onClick={() => setSimHighNDVI(!simHighNDVI)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  simHighNDVI
                    ? 'bg-[#F4F9F2] border-[#1B4332] shadow-xs'
                    : 'bg-[#F8FAF5] border-[#1B4332]/15'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase text-[#11281E]">
                    Maintain Sentinel-2 Plot NDVI Peak &gt; 0.80 Through Flowering
                  </h4>
                  <p className="text-[11px] text-[#4D6B53] font-medium">
                    Boosts Satellite Yield Reliability Pillar (20% weight)
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                  +12 Points
                </span>
              </div>
            </div>

            {/* Result Gauge Card (Col 5) */}
            <div className="lg:col-span-5 bg-radial from-[#1B4332] to-[#0E261C] p-6 rounded-3xl text-white border-2 border-[#1B4332] space-y-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Simulated Score Projection
              </span>

              <div className="text-5xl font-black text-white font-mono my-2">
                {simulatedScore}
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-xs space-y-1">
                <span className="text-emerald-100 block">Projected Pre-Approved Loan Limit:</span>
                <span className="text-xl font-black text-emerald-300">
                  ₹{simulatedPreApproved.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-200 block">
                  (+₹{(simulatedPreApproved - profile.preApprovedLoanAmount).toLocaleString('en-IN')} Increase)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DIGITAL AGRI-CREDIT PASSPORT */}
      {activeTab === 'agri_passport' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B4332]/15 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#1B4332]/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                Official KrishiSetu Verification Pass
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#11281E] mt-1">
                Kisan Credit Passport (Rural Bank API Ready)
              </h2>
            </div>

            <button
              id="print-passport-btn"
              onClick={handlePrintPassport}
              className="px-4 py-2.5 rounded-2xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider hover:bg-[#11281E] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download / Print Passport</span>
            </button>
          </div>

          {/* Printable Digital Passport Card */}
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FAF3E0] to-[#F3E8CE] border-4 border-[#1B4332] shadow-md text-[#11281E] space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-[#1B4332]/20 pb-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#1B4332]">
                  KrishiSetu Agri-FinTech Passport
                </h3>
                <p className="text-[11px] text-[#7F5539] font-bold">
                  Verified Rural Banking Identity • PSL Priority Code: AGRI-785
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-black text-xl">
                KS
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Farmer Name</span>
                <span className="font-black text-[#11281E] text-sm">{profile.farmerName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">AgriScore</span>
                <span className="font-black text-emerald-800 text-sm font-mono">{profile.overallScore} (AAA)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Land Area</span>
                <span className="font-black text-[#11281E] text-sm">{profile.landHoldingAcres} Acres</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Escrow Turnover</span>
                <span className="font-black text-[#11281E] text-sm">₹{profile.totalEscrowVolumeProcessed.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Delivery Fulfillment</span>
                <span className="font-black text-emerald-800 text-sm">98.6%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#6C8573] uppercase block">Pre-Approved Limit</span>
                <span className="font-black text-[#1B4332] text-sm">₹{profile.preApprovedLoanAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#1B4332]/20 flex items-center justify-between text-xs">
              <div className="font-mono text-[10px] text-[#6C8573]">
                ID: {profile.passportVerificationId}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#1B4332]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Digitally Sealed & Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
