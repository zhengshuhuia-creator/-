import React, { useState } from 'react';
import WebcamHandler from './components/WebcamHandler';
import CardManager from './components/CardManager';
import { GestureType, Point, HandEvent } from './types';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureType>('CLOSED');
  const [pointer, setPointer] = useState<Point>({ x: 0.5, y: 0.5 });
  const [isStarted, setIsStarted] = useState(false);

  const handleHandEvent = (event: HandEvent) => {
    setPointer(event.pointer);
    
    // Smooth transition for gesture
    if (event.gesture !== 'UNKNOWN') {
      setGesture(event.gesture);
    }
  };

  const isSpread = gesture === 'OPEN';

  return (
    <div className="relative w-screen h-[100dvh] bg-[#0f0f16] overflow-hidden text-white">
      {/* Dynamic Starry Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a1b3d_0%,_#0f0f16_100%)] z-0"></div>
      
      {/* Intro Overlay */}
      {!isStarted && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm px-4">
           <h1 className="text-3xl md:text-6xl text-[#d4af37] font-bold mb-6 tracking-widest text-center">
             CLOW CARDS
           </h1>
           <p className="text-gray-300 mb-8 text-sm md:text-base max-w-md text-center leading-relaxed">
             Release your inner magic.<br/><br/>
             1. Allow Camera Access.<br/>
             2. <strong>Open Palm</strong> to release the cards.<br/>
             3. <strong>Fist</strong> to return them.<br/>
             4. <strong>Point</strong> to select.
           </p>
           <button 
             onClick={() => setIsStarted(true)}
             className="px-8 py-3 bg-[#591c21] border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#591c21] transition-colors duration-300 font-bold uppercase tracking-wider rounded text-sm md:text-base"
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
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-50 pointer-events-none">
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isSpread ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                <span className="text-xs tracking-widest uppercase text-white/60">
                  {isSpread ? 'RELEASED' : 'SEALED'}
                </span>
             </div>
          </div>
          
          {/* Virtual Cursor Visualizer with Trail Effect */}
          <div 
             className="absolute pointer-events-none z-50 transition-transform duration-75 ease-out"
             style={{
                left: `${pointer.x * 100}%`,
                top: `${pointer.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${isSpread ? 1 : 0})`
             }}
          >
              <div className="w-4 h-4 rounded-full border-2 border-white/80 bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
              <div className="absolute inset-0 w-4 h-4 rounded-full border border-white/40 animate-ping"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;