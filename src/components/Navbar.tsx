import React, { useState } from 'react';
import { 
  Sprout, 
  Menu, 
  X, 
  User, 
  LogIn, 
  ArrowRight, 
  Home, 
  Wheat, 
  Building2, 
  LayoutDashboard,
  LogOut,
  PhoneCall
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (route: AppRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const isDashboard = currentRoute === 'farmer-dashboard' || currentRoute === 'buyer-dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAF5]/95 backdrop-blur-md border-b-2 border-[#1B4332]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            id="navbar-brand-logo"
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#1B4332] flex items-center justify-center text-white shadow-md shadow-[#1B4332]/25 group-hover:scale-105 transition-transform duration-200 border-2 border-[#1B4332]">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#11281E] uppercase">
                  Krishi<span className="text-[#2D5A27]">Setu</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#E8F0E5] text-[#1B4332] px-2.5 py-0.5 rounded-full border-2 border-[#1B4332]/15">
                  कृषि सेतु
                </span>
              </div>
              <p className="text-[10px] text-[#4D6B53] font-bold uppercase tracking-wider hidden sm:block">Direct Farmer to Buyer Network</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-white/80 p-1.5 rounded-full border-2 border-[#1B4332]/10 shadow-xs">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('landing')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                currentRoute === 'landing'
                  ? 'text-white bg-[#1B4332] shadow-xs'
                  : 'text-[#2C4A38] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              id="nav-link-farmer-section"
              onClick={() => {
                if (currentUser?.role === 'farmer') {
                  handleNavClick('farmer-dashboard');
                } else {
                  handleNavClick('farmer-login');
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                currentRoute.startsWith('farmer')
                  ? 'text-white bg-[#1B4332] shadow-xs'
                  : 'text-[#2C4A38] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Wheat className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>For Farmers</span>
            </button>

            <button
              id="nav-link-buyer-section"
              onClick={() => {
                if (currentUser?.role === 'buyer') {
                  handleNavClick('buyer-dashboard');
                } else {
                  handleNavClick('buyer-login');
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                currentRoute.startsWith('buyer')
                  ? 'text-white bg-[#1B4332] shadow-xs'
                  : 'text-[#2C4A38] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>For Buyers</span>
            </button>
          </nav>

          {/* User Account / Action CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  id="nav-dashboard-button"
                  onClick={() => handleNavClick(currentUser.role === 'farmer' ? 'farmer-dashboard' : 'buyer-dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E8F0E5] border-2 border-[#1B4332]/20 text-[#1B4332] rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#1B4332] hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{currentUser.role === 'farmer' ? 'Farmer Dashboard' : 'Buyer Dashboard'}</span>
                </button>

                <div className="flex items-center gap-2.5 pl-2 border-l-2 border-[#1B4332]/15">
                  <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-black text-xs flex items-center justify-center shadow-xs border-2 border-[#E8D5B5]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <p className="text-xs font-black text-[#11281E]">{currentUser.name}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-[#2D5A27]">{currentUser.role}</p>
                  </div>
                  <button
                    id="nav-logout-button"
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  id="nav-login-choice-button"
                  onClick={() => handleNavClick('role-select')}
                  className="px-4 py-2.5 text-[#1B4332] hover:text-[#11281E] font-black text-xs uppercase tracking-wider rounded-full hover:bg-[#E8F0E5] transition-colors inline-flex items-center gap-1.5 border-2 border-transparent hover:border-[#1B4332]/15"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  id="nav-get-started-button"
                  onClick={() => handleNavClick('role-select')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D5A27] text-white rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#1B4332] shadow-sm hover:shadow-md transition-all active:scale-98"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                id="mobile-nav-dashboard-shortcut"
                onClick={() => handleNavClick(currentUser.role === 'farmer' ? 'farmer-dashboard' : 'buyer-dashboard')}
                className="p-2.5 bg-[#E8F0E5] text-[#1B4332] rounded-full border-2 border-[#1B4332]/20 text-xs font-black flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-[#1B4332] hover:bg-[#E8F0E5] border-2 border-[#1B4332]/10 transition-colors focus:outline-hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-t-2 border-[#1B4332]/10 bg-[#F8FAF5] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <button
              id="mobile-nav-home"
              onClick={() => handleNavClick('landing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider ${
                currentRoute === 'landing' ? 'bg-[#1B4332] text-white' : 'text-[#1B4332] hover:bg-[#E8F0E5]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home (होम)</span>
            </button>

            <button
              id="mobile-nav-farmer-portal"
              onClick={() => handleNavClick(currentUser?.role === 'farmer' ? 'farmer-dashboard' : 'farmer-login')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider ${
                currentRoute.startsWith('farmer') ? 'bg-[#1B4332] text-white' : 'text-[#1B4332] hover:bg-[#E8F0E5]'
              }`}
            >
              <Wheat className="w-4 h-4" />
              <span>Farmer Section (किसान पोर्टल)</span>
            </button>

            <button
              id="mobile-nav-buyer-portal"
              onClick={() => handleNavClick(currentUser?.role === 'buyer' ? 'buyer-dashboard' : 'buyer-login')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider ${
                currentRoute.startsWith('buyer') ? 'bg-[#1B4332] text-white' : 'text-[#1B4332] hover:bg-[#E8F0E5]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Buyer Section (खरीदार पोर्टल)</span>
            </button>
          </div>

          <div className="pt-3 border-t-2 border-[#1B4332]/10 space-y-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="p-3.5 bg-[#E8F0E5] rounded-2xl border-2 border-[#1B4332]/15 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-[#11281E]">{currentUser.name}</p>
                    <p className="text-[10px] text-[#2D5A27] font-black uppercase tracking-wider">{currentUser.role} Account • {currentUser.location}</p>
                  </div>
                  <button
                    id="mobile-logout-button"
                    onClick={onLogout}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <button
                  id="mobile-goto-dashboard-btn"
                  onClick={() => handleNavClick(currentUser.role === 'farmer' ? 'farmer-dashboard' : 'buyer-dashboard')}
                  className="w-full py-3.5 bg-[#1B4332] text-white font-black uppercase tracking-wider text-xs rounded-full flex items-center justify-center gap-2 shadow-xs border-2 border-[#1B4332]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-role-select-btn"
                  onClick={() => handleNavClick('role-select')}
                  className="py-3 px-4 bg-white text-[#1B4332] font-black uppercase tracking-wider text-xs rounded-full text-center hover:bg-[#E8F0E5] border-2 border-[#1B4332]/15"
                >
                  Sign In
                </button>
                <button
                  id="mobile-register-start-btn"
                  onClick={() => handleNavClick('role-select')}
                  className="py-3 px-4 bg-[#1B4332] text-white font-black uppercase tracking-wider text-xs rounded-full text-center hover:bg-[#2D5A27] border-2 border-[#1B4332] shadow-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
