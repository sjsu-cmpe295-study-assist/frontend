/**
 * Notion Color Palette
 * Based on Notion's color system with light and dark variants
 */

export const notionColors = {
  default: {
    light: {
      background: '#FFFFFF',
      backgroundHover: '#F5F5F5',
      text: '#373530',
      textHover: '#2E2D29',
      border: '#E9E9E7',
    },
    dark: {
      background: '#191919',
      backgroundHover: '#252525',
      text: '#D4D4D4',
      textHover: '#FFFFFF',
      border: '#404040',
    },
  },
  gray: {
    light: {
      background: '#F1F1EF',
      backgroundHover: '#E9E9E7',
      text: '#787774',
      textHover: '#6B6B69',
      border: '#E0E0DE',
    },
    dark: {
      background: '#252525',
      backgroundHover: '#2E2E2E',
      text: '#9B9B9B',
      textHover: '#B0B0B0',
      border: '#404040',
    },
  },
  brown: {
    light: {
      background: '#F3EEEE',
      backgroundHover: '#EDE8E8',
      text: '#976D57',
      textHover: '#8A604A',
      border: '#E8E0E0',
    },
    dark: {
      background: '#2E2724',
      backgroundHover: '#3A322F',
      text: '#A27763',
      textHover: '#B58973',
      border: '#3A322F',
    },
  },
  orange: {
    light: {
      background: '#F8ECDF',
      backgroundHover: '#F2E0CF',
      text: '#CC782F',
      textHover: '#B8691F',
      border: '#EDD9C7',
    },
    dark: {
      background: '#36291F',
      backgroundHover: '#423529',
      text: '#CB7B37',
      textHover: '#D98B47',
      border: '#423529',
    },
  },
  yellow: {
    light: {
      background: '#FAF3DD',
      backgroundHover: '#F4EBC9',
      text: '#C29343',
      textHover: '#B08433',
      border: '#F0E5C4',
    },
    dark: {
      background: '#372E20',
      backgroundHover: '#433A2C',
      text: '#C19138',
      textHover: '#D1A148',
      border: '#433A2C',
    },
  },
  green: {
    light: {
      background: '#EEF3ED',
      backgroundHover: '#E4EDE1',
      text: '#548164',
      textHover: '#4A7254',
      border: '#DAE5D7',
    },
    dark: {
      background: '#242B26',
      backgroundHover: '#303732',
      text: '#4F9768',
      textHover: '#5AA778',
      border: '#303732',
    },
  },
  blue: {
    light: {
      background: '#E9F3F7',
      backgroundHover: '#DFEDF1',
      text: '#487CA5',
      textHover: '#3E6D95',
      border: '#D5E5EB',
    },
    dark: {
      background: '#1F282D',
      backgroundHover: '#2B3439',
      text: '#447ACB',
      textHover: '#548ADB',
      border: '#2B3439',
    },
  },
  purple: {
    light: {
      background: '#F6F3F8',
      backgroundHover: '#F0EBF2',
      text: '#8A67AB',
      textHover: '#7D5A9B',
      border: '#E8E0ED',
    },
    dark: {
      background: '#2A2430',
      backgroundHover: '#363040',
      text: '#865DBB',
      textHover: '#966DCB',
      border: '#363040',
    },
  },
  pink: {
    light: {
      background: '#F9F2F5',
      backgroundHover: '#F3E8ED',
      text: '#B35488',
      textHover: '#A64478',
      border: '#EDDCE3',
    },
    dark: {
      background: '#2E2328',
      backgroundHover: '#3A2F34',
      text: '#BA4A78',
      textHover: '#CA5A88',
      border: '#3A2F34',
    },
  },
  red: {
    light: {
      background: '#FAECEC',
      backgroundHover: '#F4E0E0',
      text: '#C4554D',
      textHover: '#B5453D',
      border: '#F0D8D8',
    },
    dark: {
      background: '#332523',
      backgroundHover: '#3F312F',
      text: '#BE524B',
      textHover: '#CE625B',
      border: '#3F312F',
    },
  },
} as const;

export type NotionColorName = keyof typeof notionColors;
export type ColorVariant = 'light' | 'dark';

/**
 * Get color values for a specific Notion color
 */
export function getNotionColor(
  color: NotionColorName,
  variant: ColorVariant = 'light'
) {
  return notionColors[color][variant];
}

/**
 * Get all color names
 */
export function getNotionColorNames(): NotionColorName[] {
  return Object.keys(notionColors) as NotionColorName[];
}

