import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | undefined;

export const initializeHandLandmarker = async (): Promise<HandLandmarker> => {
  if (handLandmarker) return handLandmarker;

  console.log("Initializing HandLandmarker...");
  try {
    // Switched to specific version 0.10.14 for stability with jsdelivr
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
    });
    
    console.log("HandLandmarker initialized successfully.");
    return handLandmarker;
  } catch (error) {
    console.error("Critical Error initializing HandLandmarker:", error);
    throw error;
  }
};

// Helper to calculate distance between two 3D points
const distance = (p1: any, p2: any) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
  );
};

export const detectGesture = (landmarks: any[]): 'OPEN' | 'CLOSED' | 'UNKNOWN' => {
  if (!landmarks || landmarks.length === 0) return 'UNKNOWN';

  // Indices for finger tips and dips (lower joint)
  // Thumb is distinct logic, fingers 1-4 are similar
  // Tips: 4, 8, 12, 16, 20
  // PIPs (Proximal Interphalangeal): 2, 6, 10, 14, 18
  
  const wrist = landmarks[0];
  
  let extendedFingers = 0;

  // Thumb
  // Compare tip(4) distance to wrist vs ip(3) distance to wrist
  if (distance(wrist, landmarks[4]) > distance(wrist, landmarks[3]) * 1.1) extendedFingers++;

  // Fingers (Index to Pinky)
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];

  for (let i = 0; i < tips.length; i++) {
    // If tip is further from wrist than the PIP joint, it's likely extended
    if (distance(wrist, landmarks[tips[i]]) > distance(wrist, landmarks[pips[i]])) {
      extendedFingers++;
    }
  }

  if (extendedFingers >= 4) return 'OPEN';
  if (extendedFingers <= 1) return 'CLOSED';
  
  return 'UNKNOWN'; 
};