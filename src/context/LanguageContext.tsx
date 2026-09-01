import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isHindi: boolean;
  t: (key: string, defaultText?: string) => string;
}

export const DICTIONARY: Record<string, { hi: string; en: string }> = {
  // Brand & General
  appName: { hi: 'कृषि सेतु', en: 'KrishiSetu' },
  tagline: { hi: 'किसानों और खरीदारों का सीधा बाज़ार', en: 'Direct Farmer to Buyer Network' },
  home: { hi: 'मुख्य पृष्ठ / होम', en: 'Home' },
  forFarmers: { hi: 'किसान भाईयों के लिए', en: 'For Farmers' },
  forBuyers: { hi: 'व्यापारी / खरीदार', en: 'For Buyers' },
  signIn: { hi: 'लॉग इन करें', en: 'Sign In' },
  signOut: { hi: 'लॉग आउट', en: 'Sign Out' },
  getStarted: { hi: 'शुरू करें (मुफ़्त)', en: 'Get Started (Free)' },
  farmerDashboard: { hi: 'किसान डैशबोर्ड', en: 'Farmer Dashboard' },
  buyerDashboard: { hi: 'खरीदार डैशबोर्ड', en: 'Buyer Dashboard' },
  
  // Navigation Actions
  myCrops: { hi: 'मेरी फसलें व बिक्री', en: 'My Crops & Listings' },
  addCrop: { hi: '+ नई फसल जोड़ें / बेचें', en: '+ Sell New Crop' },
  orders: { hi: 'मेरे ऑर्डर व सौदे', en: 'My Orders & Deals' },
  aiAdvisor: { hi: 'फसल डॉक्टर व सलाह', en: 'Crop Doctor & AI Advisor' },
  machinery: { hi: 'ट्रैक्टर व मशीन किराया', en: 'Machinery Rental' },
  marketPrices: { hi: 'मंडी भाव व बाज़ार', en: 'Mandi Rates & Market' },
  profile: { hi: 'मेरी प्रोफ़ाइल', en: 'My Profile' },
  help: { hi: 'मदद व हेल्पलाइन', en: 'Helpline & Support' },

  // Quick Action Buttons
  sellCropQuick: { hi: 'फसल बेचें', en: 'Sell Crop' },
  checkRatesQuick: { hi: 'मंडी भाव देखें', en: 'Check Rates' },
  rentTractorQuick: { hi: 'ट्रैक्टर बुक करें', en: 'Rent Tractor' },
  askDoctorQuick: { hi: 'फसल डॉक्टर', en: 'Crop Doctor' },
  trackOrderQuick: { hi: 'ऑर्डर देखें', en: 'Track Orders' },

  // Terminology Replacements
  escrowPayment: { hi: '100% सुरक्षित सीधा भुगतान', en: '100% Secure Direct Payment' },
  verifiedFarmer: { hi: 'प्रमाणित किसान', en: 'Verified Farmer' },
  directMandi: { hi: 'सीधा खेत से सौदा', en: 'Direct Farmgate Deal' },
  callFarmer: { hi: 'किसान को कॉल करें', en: 'Call Farmer' },
  callBuyer: { hi: 'खरीदार को कॉल करें', en: 'Call Buyer' },
  acceptOrder: { hi: 'ऑर्डर स्वीकार करें', en: 'Accept Order' },
  rejectOrder: { hi: 'ऑर्डर अस्वीकार करें', en: 'Decline Order' },
  dispatchProduce: { hi: 'गाड़ी रवाना करें (In Transit)', en: 'Dispatch Produce' },
  confirmDelivery: { hi: 'डिलीवरी और भुगतान पुष्टि', en: 'Confirm Delivery & Pay' },
  
  // States & Feedback
  loadingData: { hi: 'जानकारी लोड हो रही है, कृपया प्रतीक्षा करें...', en: 'Loading information, please wait...' },
  noDataFound: { hi: 'यहाँ कोई जानकारी नहीं मिली', en: 'No data found' },
  tryAgain: { hi: 'पुनः प्रयास करें', en: 'Try Again' },
  refresh: { hi: 'ताज़ा करें (Refresh)', en: 'Refresh' },
  save: { hi: 'सुरक्षित करें (Save)', en: 'Save' },
  cancel: { hi: 'रद्द करें', en: 'Cancel' },
  success: { hi: 'सफल हुआ!', en: 'Success!' },
  error: { hi: 'त्रुटि हुई', en: 'Something went wrong' },

  // Demo Notice
  demoNotice: { hi: 'डेमो बाज़ार डेटा', en: 'Demo Market Data' },
  demoNoticeDesc: { hi: 'यह केवल अभ्यास और परीक्षण के लिए बनाया गया नमूना डेटा है।', en: 'This is sample demonstration data for testing purposes.' }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'hi',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isHindi: true,
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('krishisetu_language') as Language;
      return saved === 'en' || saved === 'hi' ? saved : 'hi'; // Default to Hindi for rural accessibility
    } catch {
      return 'hi';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('krishisetu_language', language);
    } catch (e) {
      console.warn('Unable to persist language in localStorage', e);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return defaultText || key;
    return entry[language] || defaultText || key;
  };

  const isHindi = language === 'hi';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isHindi,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
