import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { initializeHandLandmarker, detectGesture } from '../services/visionService';
import { HandEvent, Point } from '../types';

interface WebcamHandlerProps {
  onHandEvent: (event: HandEvent) => void;
}

const WebcamHandler: React.FC<WebcamHandlerProps> = ({ onHandEvent }) => {
  const webcamRef = useRef<Webcam>(null);
  const requestRef = useRef<number | null>(null);
  const [isVisionReady, setIsVisionReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const lastGestureRef = useRef<'OPEN' | 'CLOSED' | 'UNKNOWN'>('UNKNOWN');

  // Load the vision model on mount
  useEffect(() => {
    let mounted = true;
    const loadModel = async () => {
      try {
        await initializeHandLandmarker();
        if (mounted) {
          setIsVisionReady(true);
          console.log("MediaPipe HandLandmarker loaded successfully.");
        }
      } catch (e) {
        console.error("Failed to load MediaPipe model:", e);
        if (mounted) setCameraError("Failed to load AI Vision Model.");
      }
    };
    loadModel();
    return () => { mounted = false; };
  }, []);

  const predictWebcam = useCallback(async () => {
    // Stop loop if camera failed
    if (cameraError) return;

    // Wait for model to be ready
    if (!isVisionReady) {
       requestRef.current = requestAnimationFrame(predictWebcam);
       return;
    }

    try {
        const handLandmarker = await initializeHandLandmarker();
        
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4 &&
          webcamRef.current.video.videoWidth > 0 && 
          webcamRef.current.video.videoHeight > 0
        ) {
          const video = webcamRef.current.video;
          const startTimeMs = performance.now();
          const results = handLandmarker.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0]; // Assume 1 hand
            
            // 1. Detect Gesture
            const gesture = detectGesture(landmarks);
            
            // 2. Get Pointer (Index Finger Tip - Index 8)
            const rawX = landmarks[8].x;
            const rawY = landmarks[8].y;

            // Mirror X for natural interaction
            const pointer: Point = {
              x: 1 - rawX,
              y: rawY
            };

            onHandEvent({
                gesture: gesture === 'UNKNOWN' ? lastGestureRef.current : gesture,
                pointer
            });

            if (gesture !== 'UNKNOWN') {
                lastGestureRef.current = gesture;
            }
          }
        }
    } catch (e) {
        console.error("Prediction error:", e);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [onHandEvent, isVisionReady, cameraError]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(predictWebcam);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [predictWebcam]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
      console.error("Webcam Access Error:", error);
      const msg = typeof error === 'string' ? error : error.message;
      setCameraError(`Camera Error: ${msg}. Please allow camera access.`);
  }, []);

  const handleUserMedia = useCallback(() => {
      console.log("Webcam stream started successfully.");
      setIsStreamReady(true);
  }, []);

  return (
    <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-50 bg-black">
      {/* Loading Overlay - Only show if stream is NOT ready */}
      {(!isStreamReady && !cameraError) && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs bg-black z-20 space-y-2 pointer-events-none">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[9px]">Camera...</span>
         </div>
      )}
      
      {/* Vision Loading Overlay - Semi-transparent if stream is ready but vision is not */}
      {(isStreamReady && !isVisionReady && !cameraError) && (
         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] p-1 text-center z-20 pointer-events-none">
            Loading AI...
         </div>
      )}

      {/* Error Overlay */}
      {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-[10px] bg-black p-2 text-center z-30 leading-tight">
              {cameraError}
          </div>
      )}

      {/* Webcam Component - Forced Styles */}
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 10,
            opacity: isStreamReady ? 1 : 0 
        }}
        onUserMediaError={handleUserMediaError}
        onUserMedia={handleUserMedia}
        playsInline={true}
        autoPlay={true}
        videoConstraints={{
            facingMode: "user"
        }}
      />
      
      <div className="absolute bottom-1 left-2 text-[8px] text-white/50 pointer-events-none z-30 font-mono drop-shadow-md">
        {isVisionReady ? 'ONLINE' : '...'}
      </div>
    </div>
  );
};

export default WebcamHandler;