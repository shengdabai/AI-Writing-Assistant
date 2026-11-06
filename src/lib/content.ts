/**
 * Content generation utilities for AI Writing Assistant
 */

import { ContentType, GenerationParams } from '../types';

/**
 * Calculate estimated word count based on content type and length
 */
export function estimateWordCount(
  type: ContentType,
  length: GenerationParams['length'],
): number {
  const base = {
    article: 800,
    report: 1200,
    email: 200,
    social: 150,
  }[type] || 500;

  const multiplier = { short: 0.5, medium: 1, long: 2 }[length] || 1;
  return Math.round(base * multiplier);
}

/**
 * Validate generation params
 */
export function validateParams(params: Partial<GenerationParams>): string[] {
  const errors: string[] = [];
  if (!params.length || !['short', 'medium', 'long'].includes(params.length)) {
    errors.push('Invalid length: must be short, medium, or long');
  }
  if (!params.tone || !['formal', 'casual', 'professional', 'friendly'].includes(params.tone)) {
    errors.push('Invalid tone');
  }
  return errors;
}

/**
 * Format word count for display
 */
export function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k words`;
  }
  return `${count} words`;
}
