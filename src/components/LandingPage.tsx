import React from 'react';
import {
  Wheat,
  Building2,
  Tractor,
  Bot,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Coins,
  Scale
} from 'lucide-react';
import { AppRoute } from '../types';

interface LandingPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-[#F8FAF5]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F0E5]/60 via-[#F8FAF5] to-[#F8FAF5] border-b-2 border-[#1B4332]/10 py-14 md:py-24">
        {/* Subtle geometric shapes for depth */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#E8D5B5]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#E8F0E5] blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E5] border-2 border-[#1B4332]/15 text-[#1B4332] text-xs font-black uppercase tracking-widest mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2D5A27]" />
            <span>Digital Agriculture Ecosystem • डिजिटल कृषि नेटवर्क</span>
          </div>

          {/* Headline with Bold Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#11281E] max-w-4xl mx-auto leading-tight sm:leading-tight uppercase">
            Connecting Farmers Directly to Buyers with <span className="text-[#1B4332] underline decoration-[#E8D5B5] decoration-4 underline-offset-8">KrishiSetu</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#234230] max-w-2xl mx-auto font-bold leading-relaxed">
            Eliminating middlemen to ensure fair mandi prices, easy farm machinery rentals, and smart crop advisory for every grower.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-[#1B4332] font-black uppercase tracking-wider">
            खेत से सीधे खरीदार तक — उचित दाम, उपकरण किराया और डिजिटल फसल सुरक्षा
          </p>

          {/* Action Buttons (Get Started pill & Farmer login) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <button
              id="hero-get-started-btn"
              onClick={() => onNavigate('role-select')}
              className="w-full sm:w-auto px-8 py-4 bg-[#1B4332] hover:bg-[#2D5A27] text-white font-black text-sm uppercase tracking-wider rounded-full shadow-md shadow-[#1B4332]/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 border-2 border-[#1B4332]"
            >
              <span>Get Started Now / शुरुआत करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-farmer-direct-btn"
              onClick={() => onNavigate('farmer-login')}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-[#E8F0E5] text-[#1B4332] border-2 border-[#1B4332]/30 font-black text-sm uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2"
            >
              <Wheat className="w-4 h-4 text-[#2D5A27]" />
              <span>Farmer Login</span>
            </button>
          </div>

          {/* Quick Pillar Highlights */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border-2 border-[#1B4332]/15 shadow-xs flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E5] text-[#1B4332] border-2 border-[#1B4332]/20 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E]">Zero Middlemen</h4>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">100% direct payment to growers</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-[#1B4332]/15 shadow-xs flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#FAF3E0] text-[#8C6228] border-2 border-[#E8D5B5] flex items-center justify-center shrink-0">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E]">Affordable Rentals</h4>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">Tractors & harvesters on-demand</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-[#1B4332]/15 shadow-xs flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0E5] text-[#1B4332] border-2 border-[#1B4332]/20 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E]">AI Crop Insights</h4>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">Real-time pest & weather advisory</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Core Section: Farmer Section & Buyer Section */}
      <section className="py-14 md:py-20 bg-[#F8FAF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#2D5A27] bg-[#E8F0E5] px-3.5 py-1 rounded-full border-2 border-[#1B4332]/15">
              Agricultural Value Chain
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#11281E] uppercase tracking-tight mt-3">
              Designed for Both Ends of Agriculture
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4D6B53] font-bold">
              Whether you harvest high-quality crops or source fresh produce in bulk, KrishiSetu streamlines your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FARMER SECTION */}
            <div 
              id="landing-farmer-section"
              className="bg-white p-7 sm:p-9 rounded-[32px] border-2 border-[#1B4332]/20 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-md shadow-[#1B4332]/20 border-2 border-[#1B4332]">
                      <Wheat className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#1B4332] bg-[#E8F0E5] px-2.5 py-0.5 rounded-full uppercase tracking-widest border-2 border-[#1B4332]/15">
                        For Farmers (किसान भाइयों के लिए)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#11281E] mt-1 uppercase tracking-tight">Grow, Rent & Sell Directly</h3>
                    </div>
                  </div>
                </div>

                <p className="text-[#3A5240] text-sm sm:text-base mb-6 font-semibold leading-relaxed">
                  Sell your harvest straight to verified corporate buyers, wholesalers, and retail chains with guaranteed transparent pricing.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#1B4332]/20">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">Direct Price Discovery (उचित भाव)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Receive live offers from multiple buyers without agent commissions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#1B4332]/20">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">Machinery on Demand (कृषि उपकरण)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Rent tractors, sprayers, and rotavators from nearby equipment owners.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#1B4332]/20">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">AI Crop Health Guidance (फसल सुरक्षा)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Instant diagnosis of leaf diseases and localized weather warnings.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t-2 border-[#1B4332]/10 flex flex-col sm:flex-row gap-3">
                <button
                  id="farmer-section-join-btn"
                  onClick={() => onNavigate('farmer-register')}
                  className="flex-1 py-3.5 px-5 bg-[#1B4332] hover:bg-[#2D5A27] text-white font-black text-xs uppercase tracking-wider rounded-full text-center shadow-xs transition-colors flex items-center justify-center gap-2 border-2 border-[#1B4332]"
                >
                  <span>Register as Farmer (किसान पंजीकरण)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="farmer-section-login-btn"
                  onClick={() => onNavigate('farmer-login')}
                  className="py-3.5 px-6 bg-white border-2 border-[#1B4332]/30 text-[#1B4332] hover:bg-[#E8F0E5] font-black text-xs uppercase tracking-wider rounded-full text-center transition-colors"
                >
                  Farmer Login
                </button>
              </div>
            </div>

            {/* BUYER SECTION */}
            <div 
              id="landing-buyer-section"
              className="bg-white p-7 sm:p-9 rounded-[32px] border-2 border-[#1B4332]/20 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#1B4332] text-[#E8D5B5] flex items-center justify-center shadow-md shadow-[#1B4332]/20 border-2 border-[#1B4332]">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#1B4332] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full uppercase tracking-widest border-2 border-[#E8D5B5]">
                        For Buyers & Traders (व्यापारियों के लिए)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-[#11281E] mt-1 uppercase tracking-tight">Source Fresh Farm Batches</h3>
                    </div>
                  </div>
                </div>

                <p className="text-[#3A5240] text-sm sm:text-base mb-6 font-semibold leading-relaxed">
                  Procure verified, high-yield quality grain, pulses, spices, fruits, and vegetables directly from trusted farm clusters.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#E8D5B5]">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">Verified Quality & Traceability (सत्यापित गुणवत्ता)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Access batch origin records, harvesting dates, and moisture metrics.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#E8D5B5]">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">Direct Farm Gate Bidding (सीधी बोली)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Place bulk inquiries or lock contract farming agreements easily.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs border border-[#E8D5B5]">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-[#11281E]">Simplified Logistics & Invoicing (आसान लॉजिस्टिक्स)</h4>
                      <p className="text-xs sm:text-sm text-[#4D6B53] font-medium">Coordinate transportation directly from harvest locations.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t-2 border-[#1B4332]/10 flex flex-col sm:flex-row gap-3">
                <button
                  id="buyer-section-join-btn"
                  onClick={() => onNavigate('buyer-register')}
                  className="flex-1 py-3.5 px-5 bg-[#1B4332] hover:bg-[#2D5A27] text-white font-black text-xs uppercase tracking-wider rounded-full text-center shadow-xs transition-colors flex items-center justify-center gap-2 border-2 border-[#1B4332]"
                >
                  <span>Register as Buyer (खरीदार पंजीकरण)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="buyer-section-login-btn"
                  onClick={() => onNavigate('buyer-login')}
                  className="py-3.5 px-6 bg-white border-2 border-[#1B4332]/30 text-[#1B4332] hover:bg-[#FAF3E0] font-black text-xs uppercase tracking-wider rounded-full text-center transition-colors"
                >
                  Buyer Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rural Support Helpline Banner */}
      <section className="bg-[#1B4332] text-white py-10 px-4 sm:px-6 border-t-2 border-b-2 border-[#11281E]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D5A27] flex items-center justify-center text-[#E8D5B5] shrink-0 border-2 border-[#E8D5B5]/30 shadow-xs">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white uppercase tracking-wide">Need help getting started? / सहायता की आवश्यकता है?</h3>
              <p className="text-[#E8F0E5] text-xs sm:text-sm font-bold mt-1">Call our free Kisan Sahayata desk: 1800-KRISHI-SETU (Toll-Free)</p>
            </div>
          </div>
          <button
            id="landing-helpline-role-btn"
            onClick={() => onNavigate('role-select')}
            className="px-7 py-3.5 bg-[#E8D5B5] hover:bg-[#f3e7d3] text-[#11281E] font-black text-xs uppercase tracking-wider rounded-full transition-colors shadow-sm border-2 border-[#E8D5B5]"
          >
            Select Your Role
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#11281E] text-slate-400 py-10 border-t-2 border-[#1B4332] text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-[#E8F0E5] font-black uppercase tracking-widest text-sm">KrishiSetu (कृषि सेतु) — Digital Agri Network</p>
          <p className="font-medium text-slate-400">Connecting Farmers, Buyers, Farm Machinery, and Crop Intelligence.</p>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">© 2026 KrishiSetu Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
