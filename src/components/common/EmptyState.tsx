import React from 'react';
import { Wheat, RefreshCw, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isError?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Wheat,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isError = false,
}) => {
  const { isHindi } = useLanguage();

  const defaultTitle = isError
    ? isHindi
      ? 'जानकारी प्राप्त नहीं हो सकी'
      : 'Could not load information'
    : isHindi
    ? 'यहाँ अभी कोई डेटा नहीं है'
    : 'No data available here';

  const defaultDesc = isError
    ? isHindi
      ? 'कृपया इंटरनेट कनेक्शन जांचें या पुनः प्रयास करें।'
      : 'Please check your connection and try again.'
    : isHindi
    ? 'नई फसल जोड़ने या ताज़ा करने के लिए नीचे दिए गए बटन पर दबाएं।'
    : 'Tap the button below to add an item or refresh the page.';

  return (
    <div
      className={`w-full p-8 sm:p-12 rounded-[32px] border-2 text-center flex flex-col items-center justify-center space-y-4 ${
        isError
          ? 'bg-[#FFF5F5] border-rose-200 text-rose-950'
          : 'bg-[#F8FAF5] border-dashed border-[#1B4332]/25 text-[#11281E]'
      }`}
    >
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center border-2 ${
          isError
            ? 'bg-rose-100 border-rose-300 text-rose-700'
            : 'bg-[#E8F0E5] border-[#1B4332]/20 text-[#1B4332]'
        }`}
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">
          {title || defaultTitle}
        </h3>
        <p className="text-xs sm:text-sm font-bold text-[#4D6B53] leading-relaxed">
          {description || defaultDesc}
        </p>
      </div>

      {(onAction || onSecondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
          {onAction && (
            <button
              onClick={onAction}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 min-h-[48px] ${
                isError
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#1B4332] hover:bg-[#2D5A27] text-white'
              }`}
            >
              {isError ? <RefreshCw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{actionText || (isError ? (isHindi ? 'पुनः प्रयास करें' : 'Try Again') : (isHindi ? 'नया जोड़ें' : 'Add New'))}</span>
            </button>
          )}

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-[#1B4332] bg-white border-2 border-[#1B4332]/20 hover:bg-[#E8F0E5] transition-all min-h-[48px] flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{secondaryActionText || (isHindi ? 'ताज़ा करें' : 'Refresh')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
