import { describe, it, expect } from 'vitest';
import { estimateWordCount, validateParams, formatWordCount } from '../lib/content';

describe('estimateWordCount', () => {
  it('returns correct count for articles', () => {
    expect(estimateWordCount('article', 'short')).toBe(400);
    expect(estimateWordCount('article', 'medium')).toBe(800);
    expect(estimateWordCount('article', 'long')).toBe(1600);
  });

  it('returns correct count for emails', () => {
    expect(estimateWordCount('email', 'short')).toBe(100);
    expect(estimateWordCount('email', 'medium')).toBe(200);
  });

  it('returns correct count for reports', () => {
    expect(estimateWordCount('report', 'long')).toBe(2400);
  });

  it('defaults to 500 for unknown types', () => {
    expect(estimateWordCount('unknown' as any, 'medium')).toBe(500);
  });
});

describe('validateParams', () => {
  it('returns errors for invalid length', () => {
    const errors = validateParams({ length: 'huge' as any });
    expect(errors).toContain('Invalid length: must be short, medium, or long');
  });

  it('returns errors for invalid tone', () => {
    const errors = validateParams({ tone: 'angry' as any });
    expect(errors).toContain('Invalid tone');
  });

  it('returns no errors for valid params', () => {
    const errors = validateParams({ length: 'short', tone: 'formal' });
    expect(errors).toHaveLength(0);
  });
});

describe('formatWordCount', () => {
  it('formats under 1000 as plain number', () => {
    expect(formatWordCount(500)).toBe('500 words');
  });

  it('formats 1000+ as k', () => {
    expect(formatWordCount(1500)).toBe('1.5k words');
  });

  it('formats large numbers', () => {
    expect(formatWordCount(5000)).toBe('5.0k words');
  });
});
