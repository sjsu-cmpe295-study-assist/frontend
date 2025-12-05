/**
 * Utility functions for calculating content statistics
 */

/**
 * Extract plain text from TipTap/ProseMirror JSONContent
 */
export function extractTextFromJSONContent(content: any): string {
  if (!content || typeof content !== 'object') {
    return '';
  }

  let text = '';

  // Recursively extract text from content nodes
  function traverse(node: any) {
    if (!node) return;

    // Extract text from text nodes
    if (node.type === 'text' && node.text) {
      text += node.text + ' ';
    }

    // Traverse content array
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => traverse(child));
    }
  }

  traverse(content);
  return text.trim();
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  // Split by whitespace and filter out empty strings
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate reading time in minutes
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  const minutes = wordCount / wordsPerMinute;
  // Round to nearest 0.1 minute, minimum 0.1
  return Math.max(0.1, Math.round(minutes * 10) / 10);
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  } else if (minutes === 1) {
    return '1 min';
  } else {
    return `${Math.round(minutes)} min`;
  }
}

/**
 * Get statistics from JSONContent
 */
export function getContentStats(content: any): {
  wordCount: number;
  readingTime: number;
  readingTimeFormatted: string;
} {
  const text = extractTextFromJSONContent(content);
  const wordCount = countWords(text);
  const readingTime = calculateReadingTime(wordCount);
  const readingTimeFormatted = formatReadingTime(readingTime);

  return {
    wordCount,
    readingTime,
    readingTimeFormatted,
  };
}

