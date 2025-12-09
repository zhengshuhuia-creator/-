export type GestureType = 'OPEN' | 'CLOSED' | 'POINTING' | 'UNKNOWN';

export interface Point {
  x: number;
  y: number;
}

export interface CardData {
  id: number;
  name: string;
}

export interface HandEvent {
  gesture: GestureType;
  pointer: Point; // Normalized 0-1
}
