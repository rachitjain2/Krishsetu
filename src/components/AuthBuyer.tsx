import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Sparkles,
  Phone,
  Store,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';
import { loginWithFirebase, registerWithFirebase, loginDemoUser } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface AuthBuyerProps {
  mode: 'login' | 'register';
  onNavigate: (route: AppRoute) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthBuyer: React.FC<AuthBuyerProps> = ({
  mode,
  onNavigate,
  onLoginSuccess,
}) => {
  const isLogin = mode === 'login';
  const { isHindi } = useLanguage();
  const { showError } = useToast();

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [location, setLocation] = useState('Delhi NCR / Azadpur Mandi');
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const identifier = emailOrPhone.trim() || 'buyer@agrofoods.com';
    const finalPassword = password || 'Buyer@1234';

    try {
      if (isLogin) {
        const user = await loginWithFirebase(identifier, finalPassword, 'buyer');
        onLoginSuccess(user);
      } else {
        const finalName = businessName.trim() || 'AgroFoods Procurement Hub';
        const finalLocation = location.trim() || 'Azadpur Mandi, Delhi';

        const user = await registerWithFirebase(identifier, finalPassword, {
          name: finalName,
          phone: identifier.includes('@') ? '9811002233' : identifier,
          email: identifier.includes('@') ? identifier : `${identifier}@buyer.krishisetu.farm`,
          role: 'buyer',
          location: finalLocation,
          specializationOrBusiness: gstin || 'Bulk Food Procurement',
        });
        onLoginSuccess(user);
      }
    } catch (err: any) {
      console.error('Buyer Firebase Auth error:', err);
      let msg = err?.message || 'Authentication error. Please try again.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        msg = isHindi ? 'गलत ईमेल या पासवर्ड। कृपया पुनः जांचें।' : 'Invalid email/mobile or password. Check credentials or try Instant Demo.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = isHindi ? 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।' : 'Email already registered. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password should be at least 6 characters.';
      }
      setErrorMessage(msg);
      showError(isHindi ? 'प्रमाणीकरण त्रुटि' : 'Authentication Notice', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBuyerLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const demoUser = await loginDemoUser('buyer');
      onLoginSuccess(demoUser);
    } catch (err: any) {
      console.error('Demo buyer login error:', err);
      // Fallback local demo profile
      const demoUser: UserProfile = {
        name: 'AgroFoods Traders & Co.',
        phone: '9811099887',
        email: 'procurement@agrofoods.in',
        role: 'buyer',
        location: 'Azadpur Mandi, Delhi NCR',
        specializationOrBusiness: 'Wholesale Grain & Pulse Buyer',
      };
      onLoginSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAF5] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Navigation back and switch role */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="buyer-auth-back-btn"
            onClick={() => onNavigate('role-select')}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1B4332] hover:text-[#11281E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Role Selection</span>
          </button>

          <button
            id="buyer-auth-switch-farmer-btn"
            onClick={() => onNavigate('farmer-login')}
            className="text-xs font-black uppercase tracking-wider text-[#1B4332] hover:underline"
          >
            Farmer Portal (किसान) →
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[32px] border-2 border-[#1B4332]/20 shadow-md p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-[#E8D5B5] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#1B4332]/25 border-2 border-[#1B4332]">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black text-[#1B4332] bg-[#FAF3E0] px-3 py-1 rounded-full uppercase tracking-widest border border-[#E8D5B5]">
              Buyer Hub / खरीदार पोर्टल
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#11281E] uppercase tracking-tight mt-3">
              {isLogin ? 'Buyer Sign In' : 'Buyer Registration'}
            </h2>
            <p className="text-xs text-[#4D6B53] font-bold mt-1">
              {isLogin ? 'Direct sourcing from verified agricultural clusters' : 'Register your business for bulk farm produce'}
            </p>
          </div>

          {/* Quick Demo Login Preset Button */}
          <div className="mb-5 p-3.5 bg-[#FAF3E0]/70 border-2 border-[#E8D5B5] rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#8C6228] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8C6228]" />
                Quick Test Mode
              </span>
              <span className="text-[10px] text-[#8C6228] bg-white border border-[#E8D5B5] px-2 py-0.5 rounded-full font-black uppercase">1-Click</span>
            </div>
            <button
              id="buyer-quick-demo-btn"
              type="button"
              onClick={handleDemoBuyerLogin}
              className="mt-2.5 w-full py-2.5 px-4 bg-[#1B4332] hover:bg-[#2D5A27] text-[#E8D5B5] text-xs font-black uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 border-2 border-[#1B4332]"
            >
              <span>Instant Demo: AgroFoods Traders (Buyer)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switch Tabs (Login / Register) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F4EC] rounded-full mb-6 border-2 border-[#1B4332]/10">
            <button
              id="buyer-toggle-login-tab"
              type="button"
              onClick={() => onNavigate('buyer-login')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                isLogin ? 'bg-[#1B4332] text-white shadow-xs' : 'text-[#3A5240] hover:text-[#11281E]'
              }`}
            >
              Sign In (लॉग इन)
            </button>
            <button
              id="buyer-toggle-register-tab"
              type="button"
              onClick={() => onNavigate('buyer-register')}
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
                    Company / Firm Name (कंपनी या फर्म का नाम) *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="buyer-input-company"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. AgroFoods Commodities Pvt Ltd"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Contact Person Name (संपर्क व्यक्ति का नाम)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="buyer-input-person"
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Operating City / Mandi Hub *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="buyer-input-location"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Azadpur Mandi, Delhi"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    GSTIN / Mandi License (Optional)
                  </label>
                  <div className="relative">
                    <FileCheck2 className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="buyer-input-gstin"
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                Work Email or Registered Mobile *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="buyer-input-email"
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="procurement@agrofoods.com or 9811002233"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="buyer-input-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8FAF5] border-2 border-[#1B4332]/20 rounded-xl text-sm font-bold text-[#11281E] placeholder:text-[#8FA396] focus:outline-hidden focus:border-[#1B4332] focus:bg-white"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="buyer-auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-[#1B4332] hover:bg-[#2D5A27] disabled:opacity-70 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md shadow-[#1B4332]/20 transition-all flex items-center justify-center gap-2 border-2 border-[#1B4332] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with Firebase...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Enter Buyer Dashboard' : 'Create Buyer Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Assistance */}
          <div className="mt-6 pt-4 border-t-2 border-[#1B4332]/10 text-center">
            <p className="text-xs text-[#4D6B53] font-bold">
              Commercial Desk: <span className="font-black text-[#1B4332]">business@krishisetu.in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
