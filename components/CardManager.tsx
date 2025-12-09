import React, { useMemo, useState, useEffect } from 'react';
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
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update dimensions on resize for responsive radius
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic radius based on the smaller screen dimension
  // Covers ~35% of the screen min dimension, ensuring it fits on mobile
  const radius = Math.min(dimensions.width, dimensions.height) * 0.35;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden perspective-[1000px]">
      <AnimatePresence>
        {cards.map((id, index) => {
          // Circular Layout Calculation
          const angle = (index / TOTAL_CARDS) * 360; // Full circle
          const radian = (angle * Math.PI) / 180;
          
          // Spread positions
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;
          const rotation = angle + 90; // Rotate card to face outward

          // Distance check for Hover Effect
          // Convert pointer (0-1) to approx px relative to center
          // Screen Center is (0,0) in our relative calculation context if we offset
          // But Pointer is (0-1) screen space. 
          const pX = (pointer.x - 0.5) * dimensions.width;
          const pY = (pointer.y - 0.5) * dimensions.height;
          
          // Current Card Pos (Approximate for hit testing)
          // When spread: (x, y). When closed: (0,0)
          const cardX = isSpread ? x : 0;
          const cardY = isSpread ? y : 0;
          
          const dist = Math.sqrt(Math.pow(pX - cardX, 2) + Math.pow(pY - cardY, 2));
          // Dynamic hover threshold based on screen size (touch targets need to be forgiving)
          const hoverThreshold = Math.max(80, radius * 0.4); 
          const isHovered = isSpread && dist < hoverThreshold;

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
              className="absolute transform-gpu cursor-pointer will-change-transform"
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
         <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-500/20 rounded-full animate-[spin_20s_linear_infinite]"
            style={{ width: radius * 2.4, height: radius * 2.4 }}
         ></div>
         <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"
            style={{ width: radius * 2.0, height: radius * 2.0 }}
         ></div>
      </div>
    </div>
  );
};

export default CardManager;