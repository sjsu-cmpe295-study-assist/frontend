/**
 * Tailwind CSS class utilities for Notion colors
 * Provides helper functions to generate Tailwind classes for Notion colors
 */

import { type NotionColorName } from './notion-colors';

/**
 * Get Tailwind classes for a Notion color background
 */
export function getBgClass(color: NotionColorName): string {
  return `bg-[var(--notion-${color}-bg)]`;
}

/**
 * Get Tailwind classes for a Notion color background hover
 */
export function getBgHoverClass(color: NotionColorName): string {
  return `hover:bg-[var(--notion-${color}-bg-hover)]`;
}

/**
 * Get Tailwind classes for a Notion color text
 */
export function getTextClass(color: NotionColorName): string {
  return `text-[var(--notion-${color}-text)]`;
}

/**
 * Get Tailwind classes for a Notion color text hover
 */
export function getTextHoverClass(color: NotionColorName): string {
  return `hover:text-[var(--notion-${color}-text-hover)]`;
}

/**
 * Get Tailwind classes for a Notion color border
 */
export function getBorderClass(color: NotionColorName): string {
  return `border-[var(--notion-${color}-border)]`;
}

/**
 * Get all Tailwind classes for a Notion color (background, text, border)
 */
export function getNotionColorClasses(color: NotionColorName): string {
  return `${getBgClass(color)} ${getTextClass(color)} ${getBorderClass(color)}`;
}

