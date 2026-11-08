import { describe, expect, it } from 'vitest';
import { dictionaries, formatPrice, translate } from './i18n';

describe('i18n', () => {
  it('has the same keys in EN and FA with no empty values', () => {
    const en = Object.keys(dictionaries.en).sort();
    expect(Object.keys(dictionaries.fa).sort()).toEqual(en);
    for (const k of en) expect(dictionaries.fa[k as keyof typeof dictionaries.fa].length).toBeGreaterThan(0);
  });
  it('interpolates variables', () => {
    expect(translate('en', 'minutes', { n: 25 })).toBe('25 min');
  });
  it('uses Persian digits in FA', () => {
    expect(formatPrice('fa', '4.5')).toMatch(/^[۰-۹]+[٫.][۰-۹]+$/);
    expect(formatPrice('en', '4.5')).toBe('4.50');
  });
});
