
export enum CardSize {
  SQUARE = 'SQUARE',
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export interface CardDimensions {
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  bgUrl: string;
}

export interface CardData {
  recipientName: string;
  occasion: string;
  message: string;
  senderName: string;
  templateId: string;
  // Optional UI customizations
  fontColor?: string; // hex color string to override text/accent colors
  fontScale?: number; // percentage (100 = default) scaling for typography
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom' | 'alphabetic';
  fontStyle?: string; // e.g., 'italic'
}

export interface GeneratedCard {
  id: string;
  data: CardData;
  size: CardSize;
  imageUrl: string;
  textElements: TextElement[];
}
