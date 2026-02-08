
import { CardData, CardSize, GeneratedCard } from '../types';
import { DIMENSIONS, TEMPLATES } from '../constants';

interface LayoutProfile {
  vPadding: number; // Percentage of height
  hPadding: number; // Percentage of width
  textAlign: 'center' | 'left' | 'right';
}

/**
 * Maps template IDs to specific layout constraints to fit within the frames of the provided images
 */
const GET_LAYOUT_PROFILE = (templateId: string): LayoutProfile => {
  switch (templateId) {
    case 'islamic-lantern-gold':
      return { vPadding: 0.25, hPadding: 0.22, textAlign: 'center' };
    case 'birthday-gold-sparkle':
    case 'elegant-balloon-arch':
    case 'luxury-balloon-frame':
      return { vPadding: 0.18, hPadding: 0.13, textAlign: 'center' };
    case 'mandala-gold-frame':
    case 'romantic-pink-roses':
      return { vPadding: 0.20, hPadding: 0.16, textAlign: 'center' };
    case 'rustic-green-birthday':
    case 'rustic-wood-roses':
      return { vPadding: 0.22, hPadding: 0.18, textAlign: 'center' };
    case 'elegant-gold-floral':
    case 'lavender-paper-flowers':
      return { vPadding: 0.18, hPadding: 0.14, textAlign: 'center' };
    default:
      return { vPadding: 0.15, hPadding: 0.15, textAlign: 'center' };
  }
};

function isColorDark(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export async function renderCardToDataUrl(
  bgUrl: string,
  textElements: import('../types').TextElement[],
  width: number,
  height: number,
  bgColor: string = '#ffffff'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw Background
  let bgImage: HTMLImageElement | null = null;
  try {
    bgImage = await loadImage(bgUrl);
  } catch (e) {
    console.warn("Failed to load template background", e);
  }

  if (bgImage) {
    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = canvas.width / canvas.height;
    let dW, dH, oX, oY;

    if (imgRatio > canvasRatio) {
      dH = canvas.height;
      dW = canvas.height * imgRatio;
      oX = (canvas.width - dW) / 2;
      oY = 0;
    } else {
      dW = canvas.width;
      dH = canvas.width / imgRatio;
      oX = 0;
      oY = (canvas.height - dH) / 2;
    }
    ctx.drawImage(bgImage, oX, oY, dW, dH);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw Text Elements
  textElements.forEach(el => {
    ctx.font = `${el.fontStyle || ''} ${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`;
    ctx.fillStyle = el.fontColor;
    ctx.textAlign = el.align;
    ctx.textBaseline = el.baseline;
    ctx.fillText(el.text, el.x, el.y);
  });

  return canvas.toDataURL('image/png');
}

export async function generateCardsLocally(dataList: CardData[]): Promise<GeneratedCard[]> {
  const allGenerated: GeneratedCard[] = [];

  for (const data of dataList) {
    const template = TEMPLATES.find(t => t.id === data.templateId) || TEMPLATES[0];
    const profile = GET_LAYOUT_PROFILE(template.id);
    const isDarkBg = isColorDark(template.secondaryColor);

    // Pre-load background to get dimensions for aspect ratio logic if needed, 
    // but we use fixed dimensions based on sizes.

    const sizes = [CardSize.SQUARE, CardSize.PORTRAIT, CardSize.LANDSCAPE];

    for (const size of sizes) {
      const dimensions = DIMENSIONS[size];
      // We still use a temp canvas to generate the background-only image URL for the preview
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) continue;

      const isLandscape = size === CardSize.LANDSCAPE;

      // 1. Draw Template Background (Only)
      let bgImage: HTMLImageElement | null = null;
      try {
        bgImage = await loadImage(template.bgUrl);
      } catch (e) { console.warn(e) }

      if (bgImage) {
        // Same cover logic
        const imgRatio = bgImage.width / bgImage.height;
        const canvasRatio = canvas.width / canvas.height;
        let dW, dH, oX, oY;
        if (imgRatio > canvasRatio) {
          dH = canvas.height; dW = canvas.height * imgRatio; oX = (canvas.width - dW) / 2; oY = 0;
        } else {
          dW = canvas.width; dH = canvas.width / imgRatio; oX = 0; oY = (canvas.height - dH) / 2;
        }
        ctx.drawImage(bgImage, oX, oY, dW, dH);
      } else {
        ctx.fillStyle = template.secondaryColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const bgOnlyUrl = canvas.toDataURL('image/png');

      // 2. Setup Dynamic Typography Positions
      const textElements: import('../types').TextElement[] = [];

      const centerX = canvas.width / 2;
      const hPadding = canvas.width * profile.hPadding;
      const vPadding = canvas.height * profile.vPadding;
      const maxWidth = canvas.width - (hPadding * 2);

      const headerY = vPadding + (isLandscape ? canvas.height * 0.05 : canvas.height * 0.08);
      const footerY = canvas.height - vPadding - (isLandscape ? canvas.height * 0.02 : canvas.height * 0.05);

      // Handle custom font color and scale
      const scale = (data.fontScale ?? 100) / 100;
      const effectiveFontColor = (data.fontColor && data.fontColor.trim()) ? data.fontColor : (isDarkBg ? '#FFFFFF' : '#1A1A1A');

      // --- Occasion ---
      const hSize = Math.round((isLandscape ? canvas.height * 0.05 : canvas.height * 0.035) * scale);

      textElements.push({
        id: `occasion-${Math.random()}`,
        text: data.occasion.toUpperCase(),
        x: centerX,
        y: headerY - hSize,
        fontSize: hSize,
        fontFamily: 'Inter',
        fontColor: effectiveFontColor,
        fontWeight: 'bold',
        align: 'center',
        baseline: 'top'
      });

      // --- Recipient Name ---
      const rSize = Math.round((isLandscape ? canvas.height * 0.1 : canvas.height * 0.07) * scale);
      const recipientY = headerY + (rSize * 1.5);

      textElements.push({
        id: `recipient-${Math.random()}`,
        text: `Dear ${data.recipientName},`,
        x: centerX,
        y: recipientY - rSize,
        fontSize: rSize,
        fontFamily: '"Playfair Display", serif',
        fontColor: effectiveFontColor,
        fontWeight: '700',
        align: 'center',
        baseline: 'top'
      });

      // --- Message ---
      const spaceStart = recipientY + (rSize * 0.5);
      const spaceEnd = footerY - (isLandscape ? canvas.height * 0.15 : canvas.height * 0.1);

      // Reserve space for details if they exist
      const hasDetails = (data.date || data.time || data.venue || data.extra1 || data.extra2);
      const detailsHeight = hasDetails ? (canvas.height * (isLandscape ? 0.25 : 0.2)) : 0;

      const availableHeight = Math.max(0, spaceEnd - spaceStart - detailsHeight);
      const initialMSize = Math.round((isLandscape ? canvas.height * 0.05 : canvas.height * 0.038) * scale);
      const minMSize = Math.round(initialMSize * 0.6);

      const fit = fitTextToBox(ctx, data.message, 'Inter', initialMSize, minMSize, maxWidth, availableHeight);

      const lHeight = Math.round(fit.fontSize * 1.38);
      const totalH = fit.lines.length * lHeight;
      let startY = spaceStart + Math.round((availableHeight - totalH) / 2);
      if (startY < spaceStart + 8) startY = spaceStart + 8;

      fit.lines.forEach((line, i) => {
        textElements.push({
          id: `message-${i}-${Math.random()}`,
          text: line,
          x: centerX,
          y: startY + (i * lHeight),
          fontSize: fit.fontSize,
          fontFamily: 'Inter',
          fontColor: effectiveFontColor,
          fontWeight: '400',
          align: 'center',
          baseline: 'top'
        });
      });

      // --- Details Section (Date, Time, Venue, Extras) ---
      if (hasDetails) {
        const detailsStartY = startY + totalH + (canvas.height * 0.03);
        const detailFontSize = Math.round((isLandscape ? canvas.height * 0.035 : canvas.height * 0.025) * scale);
        const detailLineHeight = Math.round(detailFontSize * 1.5);
        let currentDetailY = detailsStartY;

        const detailLines: string[] = [];
        if (data.date || data.time) detailLines.push([data.date, data.time].filter(Boolean).join(' | '));
        if (data.venue) detailLines.push(data.venue);
        if (data.extra1) detailLines.push(data.extra1);
        if (data.extra2) detailLines.push(data.extra2);

        detailLines.forEach((line, i) => {
          textElements.push({
            id: `detail-${i}-${Math.random()}`,
            text: line,
            x: centerX,
            y: currentDetailY + (i * detailLineHeight),
            fontSize: detailFontSize,
            fontFamily: 'Inter',
            fontColor: effectiveFontColor,
            fontWeight: '600',
            align: 'center',
            baseline: 'top'
          });
        });
      }

      // --- Sender ---
      const fSize = Math.round((isLandscape ? canvas.height * 0.08 : canvas.height * 0.055) * scale);

      textElements.push({
        id: `sender-${Math.random()}`,
        text: data.senderName, // Removed "With love," prefix to be more generic, handled in Input if needed or user types it
        x: centerX,
        y: footerY - fSize,
        fontSize: fSize,
        fontFamily: '"Dancing Script", cursive',
        fontColor: effectiveFontColor,
        fontWeight: '600',
        align: 'center',
        baseline: 'top'
      });

      allGenerated.push({
        id: Math.random().toString(36).substr(2, 9),
        data,
        size,
        imageUrl: bgOnlyUrl,
        textElements
      });
    }
  }

  return allGenerated;
}

function splitLongWord(word: string, ctx: CanvasRenderingContext2D, maxWidth: number): string[] {
  const chars: string[] = [];
  let chunk = '';
  for (const ch of word) {
    const width = ctx.measureText(chunk + ch).width;
    if (width <= maxWidth) {
      chunk += ch;
    } else {
      if (chunk) chars.push(chunk);
      chunk = ch;
    }
  }
  if (chunk) chars.push(chunk);
  return chars;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      // If a single word is too long, split it
      const singleWordWidth = ctx.measureText(word).width;
      if (!currentLine && singleWordWidth > maxWidth) {
        const parts = splitLongWord(word, ctx, maxWidth);
        for (let p = 0; p < parts.length - 1; p++) lines.push(parts[p]);
        currentLine = parts[parts.length - 1];
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function fitTextToBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  startSize: number,
  minSize: number,
  maxWidth: number,
  maxHeight: number
): { fontSize: number; lines: string[] } {
  let fontSize = startSize;
  let lines = [] as string[];
  const minAllowed = Math.max(10, minSize);

  while (fontSize >= minAllowed) {
    ctx.font = `400 ${Math.round(fontSize)}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth);
    const lineHeight = Math.round(fontSize * 1.38);
    const totalH = lines.length * lineHeight;
    if (totalH <= maxHeight || fontSize === minAllowed) {
      break;
    }
    fontSize -= 2; // step down until it fits
  }

  return { fontSize: Math.round(fontSize), lines };
}

export function generatePreviewCard(
  data: CardData,
  size: CardSize = CardSize.PORTRAIT
): GeneratedCard {
  const template = TEMPLATES.find(t => t.id === data.templateId) || TEMPLATES[0];
  const profile = GET_LAYOUT_PROFILE(template.id);
  const isDarkBg = isColorDark(template.secondaryColor);
  const dimensions = DIMENSIONS[size];
  const isLandscape = size === CardSize.LANDSCAPE;

  // Mock canvas context for text measurement (approximate)
  // We can't easily do accurate text measurement without a real canvas context
  // But for a "Live Preview", creating a temporary canvas context is cheap enough just for measurement
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d');

  const textElements: import('../types').TextElement[] = [];

  if (ctx) {
    const centerX = canvas.width / 2;
    const hPadding = canvas.width * profile.hPadding;
    const vPadding = canvas.height * profile.vPadding;
    const maxWidth = canvas.width - (hPadding * 2);

    const headerY = vPadding + (isLandscape ? canvas.height * 0.05 : canvas.height * 0.08);
    const footerY = canvas.height - vPadding - (isLandscape ? canvas.height * 0.02 : canvas.height * 0.05);

    // Handle custom font color and scale
    const scale = (data.fontScale ?? 100) / 100;
    const effectiveFontColor = (data.fontColor && data.fontColor.trim()) ? data.fontColor : (isDarkBg ? '#FFFFFF' : '#1A1A1A');

    // --- Occasion ---
    const hSize = Math.round((isLandscape ? canvas.height * 0.05 : canvas.height * 0.035) * scale);

    if (data.occasion) {
      textElements.push({
        id: `occasion-preview`,
        text: data.occasion.toUpperCase(),
        x: centerX,
        y: headerY - hSize,
        fontSize: hSize,
        fontFamily: 'Inter',
        fontColor: effectiveFontColor,
        fontWeight: 'bold',
        align: 'center',
        baseline: 'top'
      });
    }

    // --- Recipient Name ---
    const rSize = Math.round((isLandscape ? canvas.height * 0.1 : canvas.height * 0.07) * scale);
    const recipientY = headerY + (rSize * 1.5);

    if (data.recipientName) {
      textElements.push({
        id: `recipient-preview`,
        text: `Dear ${data.recipientName},`,
        x: centerX,
        y: recipientY - rSize,
        fontSize: rSize,
        fontFamily: '"Playfair Display", serif',
        fontColor: effectiveFontColor,
        fontWeight: '700',
        align: 'center',
        baseline: 'top'
      });
    }

    // --- Message ---
    const spaceStart = recipientY + (rSize * 0.5);
    const spaceEnd = footerY - (isLandscape ? canvas.height * 0.15 : canvas.height * 0.1);

    // Reserve space for details
    const hasDetails = (data.date || data.time || data.venue || data.extra1 || data.extra2);
    const detailsHeight = hasDetails ? (canvas.height * (isLandscape ? 0.25 : 0.2)) : 0;

    const availableHeight = Math.max(0, spaceEnd - spaceStart - detailsHeight);
    const initialMSize = Math.round((isLandscape ? canvas.height * 0.05 : canvas.height * 0.038) * scale);
    const minMSize = Math.round(initialMSize * 0.6);

    if (data.message) {
      const fit = fitTextToBox(ctx, data.message, 'Inter', initialMSize, minMSize, maxWidth, availableHeight);
      const lHeight = Math.round(fit.fontSize * 1.38);
      const totalH = fit.lines.length * lHeight;
      let startY = spaceStart + Math.round((availableHeight - totalH) / 2);
      if (startY < spaceStart + 8) startY = spaceStart + 8;

      fit.lines.forEach((line, i) => {
        textElements.push({
          id: `message-${i}-preview`,
          text: line,
          x: centerX,
          y: startY + (i * lHeight),
          fontSize: fit.fontSize,
          fontFamily: 'Inter',
          fontColor: effectiveFontColor,
          fontWeight: '400',
          align: 'center',
          baseline: 'top'
        });
      });

      // --- Details Section (Date, Time, Venue, Extras) ---
      if (hasDetails) {
        const detailsStartY = startY + totalH + (canvas.height * 0.03);
        const detailFontSize = Math.round((isLandscape ? canvas.height * 0.035 : canvas.height * 0.025) * scale);
        const detailLineHeight = Math.round(detailFontSize * 1.5);
        let currentDetailY = detailsStartY;

        const detailLines: string[] = [];
        if (data.date || data.time) detailLines.push([data.date, data.time].filter(Boolean).join(' | '));
        if (data.venue) detailLines.push(data.venue);
        if (data.extra1) detailLines.push(data.extra1);
        if (data.extra2) detailLines.push(data.extra2);

        detailLines.forEach((line, i) => {
          textElements.push({
            id: `detail-${i}-preview`,
            text: line,
            x: centerX,
            y: currentDetailY + (i * detailLineHeight),
            fontSize: detailFontSize,
            fontFamily: 'Inter',
            fontColor: effectiveFontColor,
            fontWeight: '600',
            align: 'center',
            baseline: 'top'
          });
        });
      }
    }

    // --- Sender ---
    const fSize = Math.round((isLandscape ? canvas.height * 0.08 : canvas.height * 0.055) * scale);

    if (data.senderName) {
      textElements.push({
        id: `sender-preview`,
        text: data.senderName,
        x: centerX,
        y: footerY - fSize,
        fontSize: fSize,
        fontFamily: '"Dancing Script", cursive',
        fontColor: effectiveFontColor,
        fontWeight: '600',
        align: 'center',
        baseline: 'top'
      });
    }
  }

  return {
    id: 'live-preview',
    data,
    size,
    imageUrl: template.bgUrl, // Use raw URL for preview
    textElements
  };
}
