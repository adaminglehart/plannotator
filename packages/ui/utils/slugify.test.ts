import { describe, test, expect } from 'bun:test';
import { slugifyHeading } from './slugify';

describe('slugifyHeading', () => {
  test('lowercases plain text', () => {
    expect(slugifyHeading('Installation')).toBe('installation');
  });

  test('strips bold and italic markers', () => {
    expect(slugifyHeading('**Install** _now_')).toBe('install-now');
  });

  test('strips inline code backticks', () => {
    expect(slugifyHeading('Install `bun`')).toBe('install-bun');
  });

  test('strips link syntax, keeps label', () => {
    expect(slugifyHeading('See [the docs](https://example.com)')).toBe('see-the-docs');
  });

  test('strips wiki-link brackets, keeps text', () => {
    expect(slugifyHeading('[[reference]] page')).toBe('reference-page');
  });

  test('collapses runs of special characters', () => {
    expect(slugifyHeading('CI / CD & deploy')).toBe('ci-cd-deploy');
  });

  test('trims leading and trailing hyphens', () => {
    expect(slugifyHeading('   Leading and trailing   ')).toBe('leading-and-trailing');
  });

  test('preserves unicode letters', () => {
    expect(slugifyHeading('Café & résumé')).toBe('café-résumé');
  });

  test('returns empty string for empty input', () => {
    expect(slugifyHeading('')).toBe('');
  });

  test('returns empty string for all-symbol input', () => {
    expect(slugifyHeading('***')).toBe('');
  });
});
