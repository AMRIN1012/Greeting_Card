
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
  tags?: string[];
}

export interface CardData {
  recipientName: string;
  occasion: string; // Used as the "Title" or "Event Name"
  message: string;
  senderName: string;
  templateId: string;

  // Optional detailed fields
  date?: string;
  time?: string;
  venue?: string;
  extra1?: string; // Flexible field (e.g., RSVP, Award Title)
  extra2?: string; // Flexible field (e.g., Dress Code, Signature)

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

export interface VideoFrame {
  id: string;
  imageFile: File; // Store the raw file for now
  imageUrl: string; // Preview URL
  textOverlay: string;
  order: number;
}

export interface GeneratedVideo {
  id: string;
  frames: VideoFrame[];
  gifUrl?: string; // Blob URL for the generated GIF
  createdAt: Date;
}
