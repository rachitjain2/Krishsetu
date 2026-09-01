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

interface RoleSelectProps {
  onNavigate: (route: AppRoute) => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer'>('farmer');

  const handleProceed = (mode: 'login' | 'register') => {
    if (selectedRole === 'farmer') {
      onNavigate(mode === 'login' ? 'farmer-login' : 'farmer-register');
    } else {
      onNavigate(mode === 'login' ? 'buyer-login' : 'buyer-register');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl">
        {/* Back Button */}
        <button
          id="role-select-back-btn"
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1B4332] hover:text-[#11281E] mb-6 px-4 py-2 bg-white rounded-full border-2 border-[#1B4332]/15 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home (वापस जाएं)</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black text-[#1B4332] bg-[#E8F0E5] px-3.5 py-1 rounded-full uppercase tracking-widest border-2 border-[#1B4332]/15">
            Step 1: Choose Account Type / भूमिका चुनें
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#11281E] uppercase tracking-tighter mt-4">
            How will you use KrishiSetu?
          </h1>
          <p className="text-sm sm:text-base text-[#4D6B53] font-bold mt-2 max-w-lg mx-auto">
            Select your role to access tailored features designed for farmers or wholesale buyers.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Farmer Card */}
          <div
            id="role-card-farmer"
            onClick={() => setSelectedRole('farmer')}
            className={`cursor-pointer relative p-7 rounded-[32px] border-2 transition-all duration-200 ${
              selectedRole === 'farmer'
                ? 'border-[#1B4332] bg-white shadow-md ring-4 ring-[#1B4332]/10'
                : 'border-[#1B4332]/15 bg-white/70 hover:border-[#1B4332]/40 hover:bg-white'
            }`}
          >
            {/* Selected Check indicator */}
            {selectedRole === 'farmer' && (
              <div className="absolute top-5 right-5 bg-[#1B4332] text-white rounded-full p-1 shadow-xs border border-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mb-5 shadow-sm shadow-[#1B4332]/30 border-2 border-[#1B4332]">
              <Wheat className="w-7 h-7" />
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">I am a Farmer</h3>
                <span className="text-[10px] bg-[#E8F0E5] text-[#1B4332] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#1B4332]/15">मैं किसान हूँ</span>
              </div>
              <p className="text-xs text-[#4D6B53] font-bold mt-1">Individual growers, FPOs, and farm owners</p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#2C4A38] font-bold border-t-2 border-[#1B4332]/10 pt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Sell produce directly without commission</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Rent nearby tractors & equipment</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Get smart crop health advisories</span>
              </li>
            </ul>
          </div>

          {/* Buyer Card */}
          <div
            id="role-card-buyer"
            onClick={() => setSelectedRole('buyer')}
            className={`cursor-pointer relative p-7 rounded-[32px] border-2 transition-all duration-200 ${
              selectedRole === 'buyer'
                ? 'border-[#1B4332] bg-white shadow-md ring-4 ring-[#1B4332]/10'
                : 'border-[#1B4332]/15 bg-white/70 hover:border-[#1B4332]/40 hover:bg-white'
            }`}
          >
            {/* Selected Check indicator */}
            {selectedRole === 'buyer' && (
              <div className="absolute top-5 right-5 bg-[#1B4332] text-[#E8D5B5] rounded-full p-1 shadow-xs border border-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#E8D5B5] flex items-center justify-center mb-5 shadow-sm shadow-[#1B4332]/30 border-2 border-[#1B4332]">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">I am a Buyer</h3>
                <span className="text-[10px] bg-[#FAF3E0] text-[#8C6228] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#E8D5B5]">मैं खरीदार हूँ</span>
              </div>
              <p className="text-xs text-[#4D6B53] font-bold mt-1">Wholesalers, retailers, food processors & traders</p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#2C4A38] font-bold border-t-2 border-[#1B4332]/10 pt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Procure fresh crops directly at source</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Verify origin & harvest quality</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Direct bids and organized delivery</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Selected Role Actions Container */}
        <div className="bg-white p-7 rounded-[32px] border-2 border-[#1B4332]/20 shadow-sm text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#4D6B53] mb-4">
            Continuing as: <span className="font-black text-[#11281E] bg-[#E8F0E5] px-3 py-1 rounded-full border border-[#1B4332]/20">
              {selectedRole === 'farmer' ? '🌾 Farmer (किसान)' : '🏢 Buyer / Business (खरीदार)'}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto">
            <button
              id="role-proceed-register-btn"
              onClick={() => handleProceed('register')}
              className="py-4 px-6 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-xs transition-colors flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#2D5A27] border-2 border-[#1B4332]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account (पंजीकरण)</span>
            </button>

            <button
              id="role-proceed-login-btn"
              onClick={() => handleProceed('login')}
              className="py-4 px-6 bg-white hover:bg-[#E8F0E5] text-[#1B4332] font-black text-xs uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 border-2 border-[#1B4332]/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In (लॉग इन करें)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
