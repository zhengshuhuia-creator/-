import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Point } from '../types';
import ClowCard from './ClowCard';

interface CardManagerProps {
  isSpread: boolean; // Derived from gesture 'OPEN'
  pointer: Point; // 0-1 normalized
}

const TOTAL_CARDS = 12; // Number of Clow cards to spawn

const CardManager: React.FC<CardManagerProps> = ({ isSpread, pointer }) => {
  const cards = useMemo(() => Array.from({ length: TOTAL_CARDS }, (_, i) => i), []);

  // Screen dimensions (approximate for calculation, using percentages in CSS is safer but we need math for circle)
  // We'll use CSS transform for positions to be responsive-ish.
  
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden perspective-[1000px]">
      <AnimatePresence>
        {cards.map((id, index) => {
          // Circular Layout Calculation
          const angle = (index / TOTAL_CARDS) * 360; // Full circle
          const radius = 300; // Radius in pixels
          const radian = (angle * Math.PI) / 180;
          
          // Spread positions
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;
          const rotation = angle + 90; // Rotate card to face outward

          // Distance check for Hover Effect
          // Convert pointer (0-1) to approx px relative to center
          // Screen Center is (0,0) in our relative calculation context if we offset
          // But Pointer is (0-1) screen space. 
          // Let's assume window center is 0.5, 0.5.
          const pX = (pointer.x - 0.5) * window.innerWidth;
          const pY = (pointer.y - 0.5) * window.innerHeight;
          
          // Current Card Pos (Approximate for hit testing)
          // When spread: (x, y). When closed: (0,0)
          const cardX = isSpread ? x : 0;
          const cardY = isSpread ? y : 0;
          
          const dist = Math.sqrt(Math.pow(pX - cardX, 2) + Math.pow(pY - cardY, 2));
          const isHovered = isSpread && dist < 80; // Threshold for hover

          return (
            <motion.div
              key={id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                x: isSpread ? x : index * 0.5, // Slight offset when stacked
                y: isSpread ? y : -index * 0.5,
                rotate: isSpread ? rotation : index * 2, // Slight fanning when stacked
                scale: isHovered ? 1.3 : 1,
                zIndex: isHovered ? 50 : index,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                mass: 1,
                delay: isSpread ? index * 0.05 : 0 // Ripple effect on release
              }}
              className="absolute transform-gpu cursor-pointer"
              style={{
                transformOrigin: "center center",
              }}
            >
              <ClowCard id={id} isSelected={isHovered} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Floating particles or magic circle SVG could go here */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpread ? 'opacity-100' : 'opacity-0'}`}>
         {/* Simple Magic Circle visual in background */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-2 border-yellow-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
      </div>
    </div>
  );
};

export default CardManager;
