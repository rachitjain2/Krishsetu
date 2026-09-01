import React, { useState } from 'react';
import {
  Wheat,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  LogIn,
  UserPlus
} from 'lucide-react';
import { AppRoute } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RoleSelectProps {
  onNavigate: (route: AppRoute) => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer'>('farmer');
  const { isHindi } = useLanguage();

  const handleProceed = (mode: 'login' | 'register') => {
    if (selectedRole === 'farmer') {
      onNavigate(mode === 'login' ? 'farmer-login' : 'farmer-register');
    } else {
      onNavigate(mode === 'login' ? 'buyer-login' : 'buyer-register');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl">
        {/* Back Button */}
        <button
          id="role-select-back-btn"
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1B4332] hover:text-[#11281E] mb-6 px-5 py-3 bg-white rounded-full border-2 border-[#1B4332]/15 shadow-xs transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHindi ? '← मुख्य पृष्ठ (वापस जाएं)' : '← Back to Home'}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-black text-[#1B4332] bg-[#E8F0E5] px-4 py-1.5 rounded-full uppercase tracking-wider border-2 border-[#1B4332]/15 inline-block">
            {isHindi ? 'चरण 1: खाता प्रकार चुनें' : 'Step 1: Choose Account Type'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#11281E] uppercase tracking-tight mt-3">
            {isHindi ? 'आप कृषि सेतु का उपयोग कैसे करना चाहते हैं?' : 'How will you use KrishiSetu?'}
          </h1>
          <p className="text-sm sm:text-base text-[#4D6B53] font-bold mt-2 max-w-lg mx-auto">
            {isHindi 
              ? 'किसान भाई अपनी फसल बेचने या उपकरण किराए पर लेने के लिए किसान चुनें। व्यापारी व मिल मालिक खरीदार चुनें।'
              : 'Select your role to access tailored features designed for farmers or wholesale buyers.'}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Farmer Card */}
          <div
            id="role-card-farmer"
            onClick={() => setSelectedRole('farmer')}
            className={`cursor-pointer relative p-6 sm:p-7 rounded-[32px] border-2 transition-all duration-200 min-h-[220px] flex flex-col justify-between ${
              selectedRole === 'farmer'
                ? 'border-[#1B4332] bg-white shadow-lg ring-4 ring-[#1B4332]/10 scale-[1.01]'
                : 'border-[#1B4332]/20 bg-white/80 hover:border-[#1B4332]/40 hover:bg-white'
            }`}
          >
            {/* Selected Check indicator */}
            {selectedRole === 'farmer' && (
              <div className="absolute top-5 right-5 bg-[#1B4332] text-white rounded-full p-1 shadow-xs border border-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mb-4 shadow-sm shadow-[#1B4332]/30 border-2 border-[#1B4332]">
                <Wheat className="w-7 h-7" />
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'मैं किसान हूँ' : 'I am a Farmer'}
                  </h3>
                  <span className="text-[10px] bg-[#E8F0E5] text-[#1B4332] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                    किसान
                  </span>
                </div>
                <p className="text-xs text-[#4D6B53] font-bold mt-1">
                  {isHindi ? 'फसल उत्पादक, एफपीओ और खेत मालिक' : 'Individual growers, FPOs, and farm owners'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#2C4A38] font-bold border-t-2 border-[#1B4332]/10 pt-3.5">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? 'बिना दलाली के सीधे अच्छे दाम पर फसल बेचें' : 'Sell produce directly without commission'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? 'पास के ट्रैक्टर व मशीनरी किराए पर लें' : 'Rent nearby tractors & equipment'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? 'फसल डॉक्टर से कीट व खाद की सलाह पाएं' : 'Get smart crop health advisories'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buyer Card */}
          <div
            id="role-card-buyer"
            onClick={() => setSelectedRole('buyer')}
            className={`cursor-pointer relative p-6 sm:p-7 rounded-[32px] border-2 transition-all duration-200 min-h-[220px] flex flex-col justify-between ${
              selectedRole === 'buyer'
                ? 'border-[#1B4332] bg-white shadow-lg ring-4 ring-[#1B4332]/10 scale-[1.01]'
                : 'border-[#1B4332]/20 bg-white/80 hover:border-[#1B4332]/40 hover:bg-white'
            }`}
          >
            {/* Selected Check indicator */}
            {selectedRole === 'buyer' && (
              <div className="absolute top-5 right-5 bg-[#1B4332] text-white rounded-full p-1 shadow-xs border border-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#FAF3E0] flex items-center justify-center mb-4 shadow-sm shadow-[#1B4332]/30 border-2 border-[#1B4332]">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                    {isHindi ? 'मैं खरीदार / व्यापारी हूँ' : 'I am a Buyer'}
                  </h3>
                  <span className="text-[10px] bg-[#FAF3E0] text-[#8C6228] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#E8D5B5]">
                    व्यापारी
                  </span>
                </div>
                <p className="text-xs text-[#4D6B53] font-bold mt-1">
                  {isHindi ? 'थोक व्यापारी, दाल/तेल मिल, निर्यातक व खुदरा विक्रेता' : 'Wholesalers, retailers, food processors & traders'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#2C4A38] font-bold border-t-2 border-[#1B4332]/10 pt-3.5">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? 'सीधे खेत से ताज़ा व जाँची-परखी फसल खरीदें' : 'Procure fresh crops directly at source'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? 'गुणवत्ता व नमी की पूरी जानकारी देखें' : 'Verify origin & harvest quality'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                  <span>{isHindi ? '100% सुरक्षित भुगतान और गाड़ी ट्रैकिंग' : 'Direct bids and organized delivery'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selected Role Actions Container */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/20 shadow-sm text-center">
          <p className="text-xs font-black uppercase tracking-wider text-[#4D6B53] mb-4">
            {isHindi ? 'चुना गया खाता:' : 'Continuing as:'}{' '}
            <span className="font-black text-[#11281E] bg-[#E8F0E5] px-3.5 py-1.5 rounded-full border border-[#1B4332]/20 inline-block mt-1 sm:mt-0">
              {selectedRole === 'farmer' ? (isHindi ? '🌾 किसान खाता (Farmer)' : '🌾 Farmer') : (isHindi ? '🏢 व्यापारी / फर्म खाता (Buyer)' : '🏢 Buyer / Business')}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto">
            <button
              id="role-proceed-register-btn"
              onClick={() => handleProceed('register')}
              className="py-4 px-6 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#2D5A27] border-2 border-[#1B4332] min-h-[52px] active:scale-98"
            >
              <UserPlus className="w-5 h-5" />
              <span>{isHindi ? 'नया खाता बनाएं (पंजीकरण)' : 'Create Account'}</span>
            </button>

            <button
              id="role-proceed-login-btn"
              onClick={() => handleProceed('login')}
              className="py-4 px-6 bg-white hover:bg-[#E8F0E5] text-[#1B4332] font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 border-2 border-[#1B4332]/25 min-h-[52px] active:scale-98"
            >
              <LogIn className="w-5 h-5" />
              <span>{isHindi ? 'लॉग इन करें (Sign In)' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
