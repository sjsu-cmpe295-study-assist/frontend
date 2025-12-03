/**
 * Color utility functions and constants
 * Helper functions for working with Notion colors
 */

import { notionColors, type NotionColorName } from './notion-colors';

/**
 * CSS variable names for Notion colors
 */
export const colorVarNames = {
  default: {
    bg: '--notion-default-bg',
    bgHover: '--notion-default-bg-hover',
    text: '--notion-default-text',
    textHover: '--notion-default-text-hover',
    border: '--notion-default-border',
  },
  gray: {
    bg: '--notion-gray-bg',
    bgHover: '--notion-gray-bg-hover',
    text: '--notion-gray-text',
    textHover: '--notion-gray-text-hover',
    border: '--notion-gray-border',
  },
  brown: {
    bg: '--notion-brown-bg',
    bgHover: '--notion-brown-bg-hover',
    text: '--notion-brown-text',
    textHover: '--notion-brown-text-hover',
    border: '--notion-brown-border',
  },
  orange: {
    bg: '--notion-orange-bg',
    bgHover: '--notion-orange-bg-hover',
    text: '--notion-orange-text',
    textHover: '--notion-orange-text-hover',
    border: '--notion-orange-border',
  },
  yellow: {
    bg: '--notion-yellow-bg',
    bgHover: '--notion-yellow-bg-hover',
    text: '--notion-yellow-text',
    textHover: '--notion-yellow-text-hover',
    border: '--notion-yellow-border',
  },
  green: {
    bg: '--notion-green-bg',
    bgHover: '--notion-green-bg-hover',
    text: '--notion-green-text',
    textHover: '--notion-green-text-hover',
    border: '--notion-green-border',
  },
  blue: {
    bg: '--notion-blue-bg',
    bgHover: '--notion-blue-bg-hover',
    text: '--notion-blue-text',
    textHover: '--notion-blue-text-hover',
    border: '--notion-blue-border',
  },
  purple: {
    bg: '--notion-purple-bg',
    bgHover: '--notion-purple-bg-hover',
    text: '--notion-purple-text',
    textHover: '--notion-purple-text-hover',
    border: '--notion-purple-border',
  },
  pink: {
    bg: '--notion-pink-bg',
    bgHover: '--notion-pink-bg-hover',
    text: '--notion-pink-text',
    textHover: '--notion-pink-text-hover',
    border: '--notion-pink-border',
  },
  red: {
    bg: '--notion-red-bg',
    bgHover: '--notion-red-bg-hover',
    text: '--notion-red-text',
    textHover: '--notion-red-text-hover',
    border: '--notion-red-border',
  },
} as const;

/**
 * Generate Tailwind CSS classes for a Notion color
 */
export function getNotionColorClasses(
  color: NotionColorName,
  type: 'bg' | 'text' | 'border' = 'bg'
): string {
  const baseClass = `notion-${color}-${type}`;
  return baseClass;
}

