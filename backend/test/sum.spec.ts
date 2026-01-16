import {describe, expect, test} from '@jest/globals';
import {Sum} from '../src/sum.ts';

describe('sum module', () => {
  sum = new Sum();
  test('adds 1 + 2 to equal 3', () => {
    expect(sum.add(1, 2)).toBe(3);
  });
});
