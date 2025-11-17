import { describe, it, expect } from 'vitest';
import {
  unique,
  chunk,
  flatten,
  shuffle,
  groupBy,
  intersection,
  difference,
  sum,
  average,
  max,
  min,
  compact,
} from '../src/utils/array.js';

describe('Array Utils', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('chunk', () => {
    it('should chunk arrays correctly', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should throw error for invalid chunk size', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow();
      expect(() => chunk([1, 2, 3], -1)).toThrow();
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      expect(flatten([[1, 2], [3, [4, 5]]])).toEqual([1, 2, 3, 4, 5]);
      expect(flatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
    });

    it('should respect depth parameter', () => {
      expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);
      expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);

      // Should have same length
      expect(shuffled).toHaveLength(arr.length);

      // Should have same elements
      expect(shuffled.sort()).toEqual(arr.sort());

      // Original array should not be modified
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('groupBy', () => {
    it('should group by property', () => {
      const data = [
        { name: 'Alice', age: 20 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 20 },
      ];

      const grouped = groupBy(data, 'age');
      expect(grouped).toEqual({
        '20': [
          { name: 'Alice', age: 20 },
          { name: 'Charlie', age: 20 },
        ],
        '30': [{ name: 'Bob', age: 30 }],
      });
    });

    it('should group by function', () => {
      const data = [
        { name: 'Alice', age: 20 },
        { name: 'Bob', age: 30 },
      ];

      const grouped = groupBy(data, (item) => (item.age >= 25 ? 'adult' : 'young'));
      expect(grouped).toEqual({
        young: [{ name: 'Alice', age: 20 }],
        adult: [{ name: 'Bob', age: 30 }],
      });
    });
  });

  describe('intersection', () => {
    it('should find intersection', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
      expect(intersection(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual([
        'b',
        'c',
      ]);
    });

    it('should return empty array when no intersection', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });
  });

  describe('difference', () => {
    it('should find difference', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
      expect(difference(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['a']);
    });

    it('should return empty array when all elements are in second array', () => {
      expect(difference([1, 2], [1, 2, 3])).toEqual([]);
    });
  });

  describe('sum', () => {
    it('should calculate sum', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([10, 20, 30])).toBe(60);
    });

    it('should handle empty array', () => {
      expect(sum([])).toBe(0);
    });
  });

  describe('average', () => {
    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20, 30])).toBe(20);
    });

    it('should return 0 for empty array', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('max', () => {
    it('should find maximum value', () => {
      expect(max([1, 5, 3, 9, 2])).toBe(9);
      expect(max([10, 20, 15])).toBe(20);
    });
  });

  describe('min', () => {
    it('should find minimum value', () => {
      expect(min([1, 5, 3, 9, 2])).toBe(1);
      expect(min([10, 20, 15])).toBe(10);
    });
  });

  describe('compact', () => {
    it('should remove falsy values', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([
        1, 2, 3,
      ]);
    });

    it('should handle array with no falsy values', () => {
      expect(compact([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should handle array with all falsy values', () => {
      expect(compact([0, false, null, undefined])).toEqual([]);
    });
  });
});
