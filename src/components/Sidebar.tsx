import React from 'react';
import {
  LayoutDashboard,
  Wheat,
  Tractor,
  Bot,
  ShoppingBag,
  TrendingUp,
  Users,
  Store,
  FileText,
  LogOut,
  ArrowLeftRight,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  X,
  User
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface SidebarItem {
  id: string;
  label: string;
  hindiLabel: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  role: 'farmer' | 'buyer';
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSwitchRole: (targetRoute: AppRoute) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onSwitchRole,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isFarmer = role === 'farmer';
  const { isHindi } = useLanguage();

  const farmerItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', hindiLabel: 'डैशबोर्ड व मुख्य मेनू', icon: LayoutDashboard },
    { id: 'my-crops', label: 'My Crops', hindiLabel: 'मेरी फसलें व बिक्री', icon: Wheat, badge: '3 Active' },
    { id: 'marketplace', label: 'Marketplace', hindiLabel: 'थोक कृषि बाज़ार', icon: Store, badge: 'Live' },
    { id: 'orders', label: 'Orders & Deals', hindiLabel: 'ऑर्डर्स और सौदे', icon: ShoppingBag, badge: '2 Active' },
    { id: 'advisory', label: 'Crop Doctor (AI)', hindiLabel: 'फसल डॉक्टर व सलाह', icon: Bot, badge: 'Smart' },
    { id: 'machinery', label: 'Machinery Rental', hindiLabel: 'ट्रैक्टर व मशीन किराया', icon: Tractor, badge: 'Nearby' },
    { id: 'market-prices', label: 'Mandi Rates', hindiLabel: 'मंडी भाव व बाज़ार', icon: TrendingUp, badge: 'Demo Data' },
    { id: 'profile', label: 'Profile', hindiLabel: 'किसान प्रोफ़ाइल', icon: User },
  ];

  const buyerItems: SidebarItem[] = [
    { id: 'overview', label: 'Buyer Overview', hindiLabel: 'खरीद केंद्र अवलोकन', icon: LayoutDashboard },
    { id: 'browse-produce', label: 'Browse Crops', hindiLabel: 'ताज़ा फसल खोजें', icon: Store, badge: 'Live' },
    { id: 'my-orders', label: 'Procurement Orders', hindiLabel: 'खरीद ऑर्डर स्थिति', icon: ShoppingBag, badge: '4 Pending' },
    { id: 'bids', label: 'Direct Farm Bids', hindiLabel: 'सीधी बोली व मोलभाव', icon: TrendingUp },
    { id: 'market-intelligence', label: 'Mandi Intelligence', hindiLabel: 'बाज़ार व मांग विश्लेषण', icon: TrendingUp, badge: 'Demo Data' },
    { id: 'verified-farmers', label: 'Verified Farmers', hindiLabel: 'प्रमाणित किसान सूची', icon: Users, badge: '500+' },
  ];

  const navItems = isFarmer ? farmerItems : buyerItems;

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#11281E]/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id={`${role}-dashboard-sidebar`}
        className={`fixed md:sticky top-20 z-40 h-[calc(100vh-5rem)] w-72 bg-white border-r-2 border-[#1B4332]/15 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 shadow-xs ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Header Role Badge */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1B4332]/10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-bold shadow-xs border-2 border-[#1B4332]">
                {isFarmer ? <Wheat className="w-5 h-5 text-[#FAF3E0]" /> : <Store className="w-5 h-5 text-[#FAF3E0]" />}
              </div>
              <div>
                <p className="text-[10px] font-black text-[#4D6B53] uppercase tracking-wider">
                  {isHindi ? 'वर्तमान पोर्टल' : 'Portal Mode'}
                </p>
                <h3 className="text-xs font-black uppercase tracking-tight text-[#11281E] flex items-center gap-1.5 mt-0.5">
                  <span>{isFarmer ? (isHindi ? 'किसान सेवा' : 'Farmer Portal') : (isHindi ? 'खरीदार सेवा' : 'Buyer Hub')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-[#E8F0E5] text-[#1B4332] border border-[#1B4332]/20">
                    {isFarmer ? 'किसान' : 'व्यापारी'}
                  </span>
                </h3>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                id="sidebar-close-mobile-btn"
                onClick={onCloseMobile}
                className="md:hidden p-2 text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links with large touch targets */}
          <div className="space-y-2 flex-1">
            <p className="px-3 text-[10px] font-black text-[#4D6B53] uppercase tracking-wider mb-1">
              {isHindi ? 'मुख्य सेवाएं' : 'Main Menu'}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all min-h-[48px] group ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-xs border-2 border-[#1B4332]'
                      : 'text-[#2C4A38] hover:bg-[#E8F0E5] hover:text-[#11281E] border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#FAF3E0]' : 'text-[#2D5A27] group-hover:text-[#1B4332]'}`} />
                    <div className="truncate">
                      <span className="block truncate leading-tight text-sm">
                        {isHindi ? item.hindiLabel : item.label}
                      </span>
                      <span className={`text-[10px] block truncate mt-0.5 font-bold ${isActive ? 'text-[#FAF3E0]/80' : 'text-[#6C8573]'}`}>
                        {isHindi ? item.label : item.hindiLabel}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-1 border ${
                        isActive
                          ? 'bg-[#FAF3E0] text-[#11281E] border-[#FAF3E0]'
                          : 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Card - User & Role Actions */}
          <div className="pt-3 mt-3 border-t-2 border-[#1B4332]/10 space-y-2">
            {/* User details capsule */}
            {currentUser && (
              <div className="p-3 bg-[#F8FAF5] rounded-2xl border-2 border-[#1B4332]/15 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-[#FAF3E0] flex items-center justify-center font-black text-sm shrink-0 border border-[#1B4332]">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-tight text-[#11281E] truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#4D6B53] font-bold truncate flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>{currentUser.location}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Switch Role Quick Link */}
            <button
              id="sidebar-switch-role-btn"
              onClick={() => onSwitchRole(isFarmer ? 'buyer-dashboard' : 'farmer-dashboard')}
              className="w-full py-3 px-3.5 rounded-full border-2 border-[#1B4332]/25 bg-white text-xs font-black uppercase tracking-wider text-[#1B4332] hover:bg-[#E8F0E5] flex items-center justify-center gap-2 transition-colors min-h-[44px]"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#2D5A27]" />
              <span>{isHindi ? (isFarmer ? 'व्यापारी मोड में बदलें' : 'किसान मोड में बदलें') : `Switch to ${isFarmer ? 'Buyer Hub' : 'Farmer'}`}</span>
            </button>

            {/* Logout button */}
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full py-2.5 px-3 rounded-full text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHindi ? 'लॉग आउट (Sign Out)' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
