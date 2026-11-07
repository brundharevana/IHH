import { it, expect } from 'vitest';
import { scoreAnswer, readProgress, writeProgress } from '../ui/quiz.js';

const q = { options: [{ text: 'A', correct: false, explanation: 'No.', fact_ids: ['f1'] }, { text: 'B', correct: true, explanation: 'Yes.', fact_ids: ['f2'] }] };

it('returns correctness with the explanation and sources', () => {
  expect(scoreAnswer(q, 1)).toEqual({ correct: true, explanation: 'Yes.', fact_ids: ['f2'] });
  expect(scoreAnswer(q, 0).correct).toBe(false);
});

it('rejects out-of-range answers', () => {
  expect(() => scoreAnswer(q, 5)).toThrow();
  expect(() => scoreAnswer(q, -1)).toThrow();
  expect(() => scoreAnswer(q, 0.5)).toThrow();
});

it('does not leak a reference to the question data', () => {
  const r = scoreAnswer(q, 1);
  r.fact_ids.push('x');
  expect(q.options[1].fact_ids).toEqual(['f2']);
});

it('keeps progress on the device and survives a storage that throws', () => {
  const mem = new Map();
  const store = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  writeProgress(store, 'einstein', { born: 1 });
  expect(readProgress(store, 'einstein')).toEqual({ born: 1 });
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  expect(() => writeProgress(broken, 'einstein', { born: 1 })).not.toThrow();
  expect(readProgress(broken, 'einstein')).toEqual({});
  expect(readProgress({ getItem: () => '{not json' }, 'einstein')).toEqual({});
  expect(readProgress(null, 'einstein')).toEqual({});
});
