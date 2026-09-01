import React from 'react';
import {
  Wheat,
  PlusCircle,
  TrendingUp,
  Tractor,
  Bot,
  ShoppingBag,
  Store,
  Users,
  Home
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { UserProfile } from '../../types';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  currentUser?: UserProfile | null;
  onQuickSell?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onQuickSell,
}) => {
  const { isHindi } = useLanguage();

  const isFarmer = currentUser?.role === 'farmer';
  const isBuyer = currentUser?.role === 'buyer';

  if (!currentUser) return null;

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8FAF5]/95 backdrop-blur-md border-t-2 border-[#1B4332]/15 shadow-2xl px-2 py-2 safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {isFarmer ? (
          <>
            {/* Tab 1: My Crops */}
            <button
              onClick={() => onTabChange('my-crops')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                currentTab === 'my-crops'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <Wheat className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'फसलें' : 'Crops'}
              </span>
            </button>

            {/* Tab 2: Mandi Rates */}
            <button
              onClick={() => onTabChange('market-prices')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                currentTab === 'market-prices'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'मंडी भाव' : 'Rates'}
              </span>
            </button>

            {/* Center Call to Action: Quick Sell */}
            <button
              onClick={() => {
                if (onQuickSell) {
                  onQuickSell();
                } else {
                  onTabChange('my-crops');
                }
              }}
              className="flex flex-col items-center justify-center -mt-5 bg-[#2D5A27] text-white p-2.5 rounded-full shadow-lg border-3 border-white ring-2 ring-[#1B4332]/20 active:scale-95 transition-transform min-w-[56px] min-h-[56px]"
              aria-label="Sell New Crop"
            >
              <PlusCircle className="w-6 h-6 text-[#FAF3E0]" />
              <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">
                {isHindi ? '+ बेचें' : '+ Sell'}
              </span>
            </button>

            {/* Tab 4: Machinery */}
            <button
              onClick={() => onTabChange('machinery')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                currentTab === 'machinery'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <Tractor className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'ट्रैक्टर' : 'Rent'}
              </span>
            </button>

            {/* Tab 5: Crop Doctor */}
            <button
              onClick={() => onTabChange('advisory')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                currentTab === 'advisory'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <Bot className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'सलाह' : 'Doctor'}
              </span>
            </button>

            {/* Tab 6: Orders */}
            <button
              onClick={() => onTabChange('orders')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                currentTab === 'orders'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'ऑर्डर' : 'Orders'}
              </span>
            </button>
          </>
        ) : isBuyer ? (
          <>
            {/* Tab 1: Browse Produce */}
            <button
              onClick={() => onTabChange('browse-produce')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] min-h-[48px] ${
                currentTab === 'browse-produce'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'फसलें' : 'Browse'}
              </span>
            </button>

            {/* Tab 2: Market Intelligence */}
            <button
              onClick={() => onTabChange('market-intelligence')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] min-h-[48px] ${
                currentTab === 'market-intelligence'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'मंडी भाव' : 'Rates'}
              </span>
            </button>

            {/* Tab 3: Bids */}
            <button
              onClick={() => onTabChange('bids')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] min-h-[48px] ${
                currentTab === 'bids'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'बोलियां' : 'Bids'}
              </span>
            </button>

            {/* Tab 4: Orders */}
            <button
              onClick={() => onTabChange('my-orders')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] min-h-[48px] ${
                currentTab === 'my-orders'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'ऑर्डर' : 'Orders'}
              </span>
            </button>

            {/* Tab 5: Verified Farmers */}
            <button
              onClick={() => onTabChange('verified-farmers')}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] min-h-[48px] ${
                currentTab === 'verified-farmers'
                  ? 'bg-[#1B4332] text-white font-black shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E]'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-black uppercase">
                {isHindi ? 'किसान' : 'Farmers'}
              </span>
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};
