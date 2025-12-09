import React from 'react';
import { motion } from 'framer-motion';

interface ClowCardProps {
  id: number;
  isSelected?: boolean;
}

const ClowCard: React.FC<ClowCardProps> = ({ id, isSelected }) => {
  return (
    <div className={`relative w-32 h-64 rounded-lg overflow-hidden shadow-2xl transition-shadow duration-300 ${isSelected ? 'shadow-yellow-400/50' : 'shadow-black/60'}`}>
      {/* Card Back Design */}
      <div className="absolute inset-0 bg-[#591c21] border-4 border-[#d4af37] flex items-center justify-center overflow-hidden">
        
        {/* Inner Border */}
        <div className="absolute inset-1 border border-[#d4af37] opacity-50 rounded-md"></div>
        
        {/* Geometric Sun/Moon Pattern (Simplified Clow Style) */}
        <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="50%" stopColor="#fcf6ba" />
                        <stop offset="100%" stopColor="#aa8c2c" />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="35" stroke="url(#goldGrad)" strokeWidth="1" fill="none" />
                <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.6" />
                <circle cx="50" cy="50" r="10" fill="url(#goldGrad)" />
            </svg>
        </div>

        {/* Top/Bottom accents */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#d4af37] rotate-45"></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#d4af37] rotate-45"></div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ClowCard;
