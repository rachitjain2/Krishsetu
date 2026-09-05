import React from 'react';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import { getScoreColorConfig } from '../utils/qualityScorer';

interface QualityScoreBadgeProps {
  score: number;
  grade?: 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  showTooltip?: boolean;
  className?: string;
  id?: string;
}

export const QualityScoreBadge: React.FC<QualityScoreBadgeProps> = ({
  score,
  grade,
  size = 'md',
  onClick,
  showTooltip = true,
  className = '',
  id,
}) => {
  const config = getScoreColorConfig(score);
  const displayGrade = grade || config.grade;

  // Size styles
  const sizeClasses = {
    sm: {
      wrapper: 'w-11 h-11 text-xs',
      scoreText: 'text-xs font-black',
      gradeText: 'text-[9px] font-black',
      svgSize: 44,
      strokeWidth: 3.5,
      radius: 17,
    },
    md: {
      wrapper: 'w-14 h-14 text-sm',
      scoreText: 'text-sm font-black tracking-tight',
      gradeText: 'text-[10px] font-black uppercase',
      svgSize: 56,
      strokeWidth: 4,
      radius: 22,
    },
    lg: {
      wrapper: 'w-18 h-18 text-base',
      scoreText: 'text-lg font-black tracking-tight',
      gradeText: 'text-xs font-black uppercase',
      svgSize: 72,
      strokeWidth: 5,
      radius: 28,
    },
  }[size];

  const circumference = 2 * Math.PI * sizeClasses.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div
      id={id || `quality-score-badge-${score}`}
      onClick={handleClick}
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
      title={`Batch Quality Score: ${score}/100 (Grade ${displayGrade}). Click to view 4-component breakdown.`}
      className={`relative inline-flex flex-col items-center justify-center rounded-full select-none transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      {/* Circular SVG Ring & Backdrop */}
      <div
        className={`relative ${sizeClasses.wrapper} rounded-full flex items-center justify-center shadow-md ${
          score >= 85
            ? 'bg-[#1B4332] text-white ring-2 ring-emerald-400/80 shadow-emerald-950/40'
            : score >= 70
            ? 'bg-amber-600 text-stone-950 ring-2 ring-amber-300 shadow-amber-950/40'
            : score >= 50
            ? 'bg-[#C9622F] text-white ring-2 ring-orange-300 shadow-orange-950/40'
            : 'bg-rose-700 text-white ring-2 ring-rose-400 shadow-rose-950/40'
        }`}
      >
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width="100%"
          height="100%"
          viewBox={`0 0 ${sizeClasses.svgSize} ${sizeClasses.svgSize}`}
        >
          {/* Background circle */}
          <circle
            cx={sizeClasses.svgSize / 2}
            cy={sizeClasses.svgSize / 2}
            r={sizeClasses.radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth={sizeClasses.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={sizeClasses.svgSize / 2}
            cy={sizeClasses.svgSize / 2}
            r={sizeClasses.radius}
            fill="none"
            stroke={
              score >= 85
                ? '#34D399' // emerald-400
                : score >= 70
                ? '#FDE047' // yellow-300
                : score >= 50
                ? '#FDBA74' // orange-300
                : '#FCA5A5' // red-300
            }
            strokeWidth={sizeClasses.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inner Content: Score & Letter Grade */}
        <div className="relative z-10 flex flex-col items-center justify-center leading-none text-center">
          <span className={`${sizeClasses.scoreText} font-black`}>{score}</span>
          <span
            className={`${sizeClasses.gradeText} font-black mt-0.5 ${
              score >= 85
                ? 'text-amber-300'
                : score >= 70
                ? 'text-stone-900 font-extrabold'
                : 'text-amber-100'
            }`}
          >
            {displayGrade}
          </span>
        </div>

        {/* Small verified spark badge */}
        {score >= 85 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#1B4332] flex items-center justify-center shadow-xs border border-[#1B4332]">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>

      {/* Subtext pill when requested */}
      {showTooltip && (
        <span
          className={`mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-tight text-center whitespace-nowrap shadow-xs ${
            score >= 85
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
              : score >= 70
              ? 'bg-amber-100 text-amber-950 border border-amber-300/80'
              : score >= 50
              ? 'bg-orange-100 text-orange-950 border border-orange-300/80'
              : 'bg-rose-100 text-rose-950 border border-rose-300/80'
          }`}
        >
          {config.label.split(' • ')[0]}
        </span>
      )}
    </div>
  );
};
