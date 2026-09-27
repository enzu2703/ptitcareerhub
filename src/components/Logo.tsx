import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'white';
  showSubtext?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  showSubtext = false,
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="relative flex items-center font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Full Logo Typography & Curved Red Arrow Swoosh */}
        <div className="relative inline-flex items-baseline">
          <span className="text-[#E31A22] font-black text-2xl tracking-tight mr-1.5">
            PTIT
          </span>
          <span
            className={`font-black text-2xl tracking-tight ${
              variant === 'white' ? 'text-white' : 'text-[#283044]'
            }`}
          >
            Career
          </span>
          <span
            className={`font-black text-2xl tracking-tight ml-1.5 ${
              variant === 'white' ? 'text-white' : 'text-[#283044]'
            }`}
          >
            Hub
          </span>

          {/* Upward Red Arrow Arc Swoosh matching Image 1 */}
          <svg
            className="absolute -bottom-1.5 left-[34%] w-[58%] h-6 pointer-events-none overflow-visible"
            viewBox="0 0 140 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 10 26 C 45 32, 95 24, 126 5"
              stroke="#B90013"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 116 3 L 130 3 L 126 15 Z"
              fill="#B90013"
            />
          </svg>
        </div>
      </div>
      {showSubtext && (
        <span className="hidden sm:inline-block ml-3 pl-3 border-l border-slate-300 text-xs text-slate-500 font-medium leading-none">
          Học viện Công nghệ Bưu chính Viễn thông
        </span>
      )}
    </div>
  );
};
