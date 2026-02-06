import { CardSize, CardDimensions, Template } from './types';

export const DIMENSIONS: Record<CardSize, CardDimensions> = {
  [CardSize.SQUARE]: { width: 1080, height: 1080 },
  [CardSize.PORTRAIT]: { width: 1080, height: 1350 },
  [CardSize.LANDSCAPE]: { width: 1200, height: 628 }
};

export const TEMPLATES: Template[] = [
  {
    id: 'baby',
    name: 'Baby',
    primaryColor: '#A3D5FF',
    secondaryColor: '#FFFFFF',
    bgUrl: '/templates/1_baby.png'
  },
  {
    id: 'elegant-gold-floral',
    name: 'Elegant Gold Floral',
    primaryColor: '#D4AF37',
    secondaryColor: '#2C3E50',
    bgUrl: '/templates/2_MRG.png'
  },
  {
    id: 'mandala-gold-frame',
    name: 'Luxury Mandala Frame',
    primaryColor: '#C5A059',
    secondaryColor: '#000000',
    bgUrl: '/templates/3_MRG.png'
  },
  {
    id: 'bird-nest',
    name: 'Bird Nest',
    primaryColor: '#EFAF9C',
    secondaryColor: '#5D4037',
    bgUrl: '/templates/4_bird_nest.png'
  },
  {
    id: 'plain-white',
    name: 'Plain White',
    primaryColor: '#FFFFFF',
    secondaryColor: '#1A1A1A',
    bgUrl: '/templates/5_plainwhite.png'
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    primaryColor: '#E74C3C',
    secondaryColor: '#FFF5EE',
    bgUrl: '/templates/6_RED.svg'
  },
  {
    id: 'romantic-pink-roses',
    name: 'Romantic Pink Roses',
    primaryColor: '#FF69B4',
    secondaryColor: '#FFF0F5',
    bgUrl: '/templates/7_INV.png'
  },
  {
    id: 'lavender-frame',
    name: 'Lavender Frame',
    primaryColor: '#9B59B6',
    secondaryColor: '#F5EEF8',
    bgUrl: '/templates/8_LAVENDER_FRAME.svg'
  },
  {
    id: 'rustic-wood-roses',
    name: 'Rustic Wood Roses',
    primaryColor: '#E74C3C',
    secondaryColor: '#FFF5EE',
    bgUrl: '/templates/9_INV.png'
  },
  {
    id: 'lavender-custom',
    name: 'Lavender Custom',
    primaryColor: '#9B59B6',
    secondaryColor: '#F5EEF8',
    bgUrl: '/templates/10_LAVENDER_CUSTOM.svg'
  },
  {
    id: 'circle-card',
    name: 'Circle Card',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    bgUrl: '/templates/11_circle_card.png'
  },
  {
    id: 'floral-green',
    name: 'Floral Green',
    primaryColor: '#2ECC71',
    secondaryColor: '#145A32',
    bgUrl: '/templates/12_floral_green.png'
  },
  {
    id: 'mirror-green',
    name: 'Mirror Green',
    primaryColor: '#1E8449',
    secondaryColor: '#0B5345',
    bgUrl: '/templates/14_mirror_green.png'
  },
  {
    id: 'retro-card',
    name: 'Retro Card',
    primaryColor: '#F39C12',
    secondaryColor: '#6E2C00',
    bgUrl: '/templates/15_retro_card.png'
  },
  {
    id: 'simple-bow',
    name: 'Simple Bow',
    primaryColor: '#E67E22',
    secondaryColor: '#7D3C98',
    bgUrl: '/templates/16_simple_bow.png'
  }
];