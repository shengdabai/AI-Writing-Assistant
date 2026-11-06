import type { GenerationParams } from './types/index.js';

export function isGenerationParams(value: unknown): value is GenerationParams {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const params = value as Record<string, unknown>;
  return ['short', 'medium', 'long'].some(item => item === params.length)
    && ['formal', 'casual', 'professional', 'friendly'].some(item => item === params.tone)
    && ['general', 'professional', 'academic', 'marketing'].some(item => item === params.audience)
    && ['zh', 'en'].some(item => item === params.language)
    && (params.keywords === undefined || (Array.isArray(params.keywords)
      && params.keywords.every(item => typeof item === 'string')));
}
