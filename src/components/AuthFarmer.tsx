import React, { useState } from 'react';
import {
  Wheat,
  Phone,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';

interface AuthFarmerProps {
  mode: 'login' | 'register';
  onNavigate: (route: AppRoute) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthFarmer: React.FC<AuthFarmerProps> = ({
  mode,
  onNavigate,
  onLoginSuccess,
}) => {
  const isLogin = mode === 'login';

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Indore, Madhya Pradesh');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat & Soybean');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isLogin ? (name.trim() || 'Ramesh Kumar') : (name.trim() || 'Kisan User');
    const finalLocation = location.trim() || 'Sehore, Madhya Pradesh';

    const user: UserProfile = {
      name: finalName,
      phone: phone || '9876543210',
      role: 'farmer',
      location: finalLocation,
      specializationOrBusiness: primaryCrop || 'Wheat & Gram'
    };

    onLoginSuccess(user);
  };

  const handleDemoFarmerLogin = () => {
    const demoUser: UserProfile = {
      name: 'Ramesh Patel',
      phone: '9826012345',
      role: 'farmer',
      location: 'Ujjain, Madhya Pradesh',
      specializationOrBusiness: 'Wheat, Mustard & Chickpea'
    };
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Navigation back and switch role */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="farmer-auth-back-btn"
            onClick={() => onNavigate('role-select')}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1B4332] hover:text-[#11281E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Role Selection</span>
          </button>

          <button
            id="farmer-auth-switch-buyer-btn"
            onClick={() => onNavigate('buyer-login')}
            className="text-xs font-black uppercase tracking-wider text-[#1B4332] hover:underline"
          >
            Buyer Portal (व्यापारी) →
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[32px] border-2 border-[#1B4332]/20 shadow-md p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#1B4332]/25 border-2 border-[#1B4332]">
              <Wheat className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-[#1B4332] bg-[#E8F0E5] px-3 py-1 rounded-full uppercase tracking-widest border border-[#1B4332]/15">
              Farmer Portal / किसान सेवा
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#11281E] uppercase tracking-tight mt-3">
              {isLogin ? 'Farmer Sign In' : 'Farmer Registration'}
            </h2>
            <p className="text-xs text-[#4D6B53] font-bold mt-1">
              {isLogin ? 'लॉग इन करें और अपनी फसल के सही दाम पाएं' : 'पंजीकरण करें और देश भर के खरीदारों से जुड़ें'}
            </p>
          </div>

          {/* Quick Demo Login Preset Button */}
          <div className="mb-5 p-3.5 bg-[#E8F0E5]/70 border-2 border-[#1B4332]/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                Quick Test Mode
              </span>
              <span className="text-[10px] text-[#1B4332] bg-[#FAF3E0] border border-[#E8D5B5] px-2 py-0.5 rounded-full font-black uppercase">1-Click</span>
            </div>
            <button
              id="farmer-quick-demo-btn"
              type="button"
              onClick={handleDemoFarmerLogin}
              className="mt-2.5 w-full py-2.5 px-4 bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 border-2 border-[#1B4332]"
            >
              <span>Instant Demo: Ramesh Patel (Farmer)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switch Tabs (Login / Register) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F4EC] rounded-full mb-6 border-2 border-[#1B4332]/10">
            <button
              id="farmer-toggle-login-tab"
              type="button"
              onClick={() => onNavigate('farmer-login')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                isLogin ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#3A5240] hover:text-[#11281E]'
              }`}
            >
              Sign In (लॉग इन)
            </button>
            <button
              id="farmer-toggle-register-tab"
              type="button"
              onClick={() => onNavigate('farmer-register')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                !isLogin ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#3A5240] hover:text-[#11281E]'
              }`}
            >
              Register (नया खाता)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Farmer Full Name (किसान का पूरा नाम) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="farmer-input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Patel"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    District & State (ज़िला एवं राज्य) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="farmer-input-location"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Ujjain, Madhya Pradesh"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Primary Crops Grown (मुख्य फसलें)
                  </label>
                  <input
                    id="farmer-input-crop"
                    type="text"
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    placeholder="e.g. Wheat, Gram, Mustard, Soybean"
                    className="w-full px-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                Mobile Number (मोबाइल नंबर) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#1B4332]">
                  +91
                </span>
                <input
                  id="farmer-input-phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#4D6B53] font-bold">Login Method:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`font-black uppercase tracking-wider text-[11px] ${authMethod === 'password' ? 'text-[#1B4332] underline' : 'text-[#4D6B53]'}`}
                  >
                    Password
                  </button>
                  <span className="text-[#1B4332]/30">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('otp');
                      setOtpSent(true);
                    }}
                    className={`font-black uppercase tracking-wider text-[11px] ${authMethod === 'otp' ? 'text-[#1B4332] underline' : 'text-[#4D6B53]'}`}
                  >
                    Mobile OTP (ओटीपी)
                  </button>
                </div>
              </div>
            )}

            {authMethod === 'password' || !isLogin ? (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                  {isLogin ? 'Password (पासवर्ड) *' : 'Create PIN / Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="farmer-input-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                  Enter 4-Digit OTP sent to mobile *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="farmer-input-otp"
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm tracking-widest font-black text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-[#1B4332] mt-1 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OTP simulated (enter any 4 digits to proceed)
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="farmer-auth-submit-btn"
              type="submit"
              className="w-full mt-2 py-4 bg-[#1B4332] hover:bg-[#2D5A27] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md shadow-[#1B4332]/20 transition-all flex items-center justify-center gap-2 border-2 border-[#1B4332]"
            >
              <span>{isLogin ? 'Enter Farmer Dashboard / प्रवेश करें' : 'Complete Registration / खाता बनाएं'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Assistance */}
          <div className="mt-6 pt-4 border-t-2 border-[#1B4332]/10 text-center">
            <p className="text-xs text-[#4D6B53] font-bold">
              Need assistance? Call helpline: <span className="font-black text-[#1B4332]">1800-KRISHI-SETU</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
