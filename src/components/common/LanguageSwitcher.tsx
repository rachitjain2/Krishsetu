import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'button' | 'pill' | 'minimal';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, toggleLanguage, isHindi } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`px-4 py-2.5 rounded-full border-2 border-[#1B4332]/25 bg-white text-[#1B4332] hover:bg-[#E8F0E5] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all active:scale-95 ${className}`}
        aria-label="Toggle language between Hindi and English"
      >
        <Languages className="w-4 h-4 text-[#2D5A27]" />
        <span>{isHindi ? 'English (अंग्रेज़ी में बदलें)' : 'हिन्दी (Switch to Hindi)'}</span>
      </button>
    );
  }

  // Pill toggle with both options visible
  return (
    <div
      className={`inline-flex items-center p-1 bg-[#F8FAF5] rounded-full border-2 border-[#1B4332]/20 shadow-2xs ${className}`}
    >
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
          isHindi
            ? 'bg-[#1B4332] text-white shadow-xs'
            : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
        }`}
        aria-pressed={isHindi}
      >
        <span>🇮🇳 हिन्दी</span>
        {isHindi && <Check className="w-3 h-3 text-[#FAF3E0]" />}
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
          !isHindi
            ? 'bg-[#1B4332] text-white shadow-xs'
            : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
        }`}
        aria-pressed={!isHindi}
      >
        <span>🇬🇧 English</span>
        {!isHindi && <Check className="w-3 h-3 text-[#FAF3E0]" />}
      </button>
    </div>
  );
};
