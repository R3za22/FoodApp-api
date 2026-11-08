import { describe, expect, it } from 'vitest';
import { filterByTitle, parseIds, validateRecipeForm } from './hooks';

describe('parseIds', () => {
  it('parses comma lists and drops junk', () => {
    expect(parseIds('1,3,x,-2,0,4')).toEqual([1, 3, 4]);
    expect(parseIds(null)).toEqual([]);
  });
});

describe('filterByTitle', () => {
  const items = [{ title: 'Lentil soup' }, { title: 'Shakshuka' }];
  it('matches case-insensitively and trims', () => {
    expect(filterByTitle(items, '  SOUP ')).toEqual([items[0]]);
    expect(filterByTitle(items, '')).toHaveLength(2);
  });
});

describe('validateRecipeForm', () => {
  const ok = { title: 'x', time: '25', price: '4.50', link: '' };
  it('accepts a valid form', () => expect(validateRecipeForm(ok)).toEqual({}));
  it('mirrors the API price rule (5 digits, 2 decimals)', () => {
    expect(validateRecipeForm({ ...ok, price: '4.5000' }).price).toBe('errPrice');
    expect(validateRecipeForm({ ...ok, price: '1234' }).price).toBe('errPrice');
    expect(validateRecipeForm({ ...ok, price: '999.99' })).toEqual({});
  });
  it('rejects bad time, empty title and non-http links', () => {
    const e = validateRecipeForm({ title: ' ', time: 'abc', price: '1', link: 'javascript:alert(1)' });
    expect(e).toEqual({ title: 'errTitleRequired', time: 'errTime', link: 'errLink' });
  });
});
