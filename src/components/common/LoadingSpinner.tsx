import React from 'react';
import { Sprout, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  subMessage,
  size = 'md',
}) => {
  const { isHindi } = useLanguage();

  const defaultMessage = isHindi
    ? 'जानकारी लोड हो रही है...'
    : 'Loading information...';
  const defaultSubMessage = isHindi
    ? 'कृपया कुछ पल प्रतीक्षा करें'
    : 'Please wait a moment';

  const sizeClasses = {
    sm: 'p-6 min-h-[140px]',
    md: 'p-10 min-h-[220px]',
    lg: 'p-16 min-h-[340px]',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex flex-col items-center justify-center text-center bg-white rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs ${sizeClasses[size]}`}
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#E8F0E5] border-t-[#1B4332] animate-spin flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sprout className="w-7 h-7 text-[#2D5A27] animate-pulse" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#11281E]">
        {message || defaultMessage}
      </h3>
      <p className="text-xs sm:text-sm font-bold text-[#4D6B53] mt-1 max-w-sm">
        {subMessage || defaultSubMessage}
      </p>
    </div>
  );
};
