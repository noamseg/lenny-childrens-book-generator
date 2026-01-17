import { IllustrationStyle } from '@/types';

// Illustration style options with descriptions
export const ILLUSTRATION_STYLES: Array<{
  id: IllustrationStyle;
  label: string;
  description: string;
  preview: string; // Could be a preview image URL
}> = [
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft, dreamy illustrations with gentle colors and flowing brushstrokes',
    preview: '/samples/style-watercolor.jpg',
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    description: 'Bold, fun illustrations with vibrant colors and expressive characters',
    preview: '/samples/style-cartoon.jpg',
  },
  {
    id: 'storybook',
    label: 'Classic Storybook',
    description: 'Traditional children\'s book style with warm, detailed illustrations',
    preview: '/samples/style-storybook.jpg',
  },
  {
    id: 'whimsical',
    label: 'Whimsical',
    description: 'Magical, fantasy-inspired art with dreamy atmospheres',
    preview: '/samples/style-whimsical.jpg',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Clean, simple illustrations with soft colors and gentle shapes',
    preview: '/samples/style-minimalist.jpg',
  },
];

// Color palettes for each style
export const STYLE_COLOR_PALETTES: Record<IllustrationStyle, string[]> = {
  watercolor: ['#FFE4E1', '#E6E6FA', '#F0FFF0', '#FFF0F5', '#F5FFFA'],
  cartoon: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
  storybook: ['#D4A574', '#8B7355', '#F5DEB3', '#C4A484', '#E8D5B7'],
  whimsical: ['#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
  minimalist: ['#F5F5F5', '#E8E8E8', '#D3D3D3', '#FFF8DC', '#F0F8FF'],
};

// Default style
export const DEFAULT_ILLUSTRATION_STYLE: IllustrationStyle = 'storybook';
