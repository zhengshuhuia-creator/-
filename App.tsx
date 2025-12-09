import React, { useState, useEffect } from 'react';
import WebcamHandler from './components/WebcamHandler';
import CardManager from './components/CardManager';
import { GestureType, Point, HandEvent } from './types';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureType>('CLOSED');
  const [pointer, setPointer] = useState<Point>({ x: 0.5, y: 0.5 });
  const [isStarted, setIsStarted] = useState(false);

  // Background Audio (Optional placeholder logic)
  // const playSound = (type: 'open' | 'close') => { ... }

  const handleHandEvent = (event: HandEvent) => {
    // Only update state if it changed significantly to prevent React render trashing
    // But for smooth hover, we pass pointer continuously
    setPointer(event.pointer);
    
    // Smooth transition for gesture
    if (event.gesture !== 'UNKNOWN') {
      setGesture(event.gesture);
    }
  };

  const isSpread = gesture === 'OPEN';

  return (
    <div className="relative w-screen h-screen bg-[#0f0f16] overflow-hidden text-white">
      {/* Dynamic Starry Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a1b3d_0%,_#0f0f16_100%)] z-0"></div>
      
      {/* Intro Overlay */}
      {!isStarted && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
           <h1 className="text-4xl md:text-6xl text-[#d4af37] font-bold mb-8 tracking-widest text-center">
             CLOW CARDS
           </h1>
           <p className="text-gray-300 mb-8 max-w-md text-center leading-relaxed">
             Release your inner magic.<br/>
             1. Allow Camera Access.<br/>
             2. <strong>Open Palm</strong> to release the cards.<br/>
             3. <strong>Fist</strong> to return them.<br/>
             4. <strong>Point</strong> to select.
           </p>
           <button 
             onClick={() => setIsStarted(true)}
             className="px-8 py-3 bg-[#591c21] border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#591c21] transition-colors duration-300 font-bold uppercase tracking-wider rounded"
           >
             Initialize Sealing Wand
           </button>
        </div>
      )}

      {/* Main Experience */}
      {isStarted && (
        <>
          <WebcamHandler onHandEvent={handleHandEvent} />
          
          <div className="relative z-10 w-full h-full">
            <CardManager isSpread={isSpread} pointer={pointer} />
          </div>

          {/* HUD Info */}
          <div className="absolute bottom-8 left-8 z-50 pointer-events-none">
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isSpread ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                <span className="text-xs tracking-widest uppercase text-white/60">
                  Status: {isSpread ? 'RELEASED' : 'SEALED'}
                </span>
             </div>
             <div className="mt-2 text-xs text-white/30">
               Pointer: ({pointer.x.toFixed(2)}, {pointer.y.toFixed(2)})
             </div>
          </div>
          
          {/* Virtual Cursor Visualizer (Optional, helps user know where they are pointing) */}
          <div 
             className="absolute w-4 h-4 rounded-full border-2 border-white/50 bg-white/20 pointer-events-none z-50 transition-transform duration-75"
             style={{
                left: `${pointer.x * 100}%`,
                top: `${pointer.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${isSpread ? 1 : 0})`
             }}
          />
        </>
      )}
    </div>
  );
};

export default App;
