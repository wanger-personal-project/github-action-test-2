import { describe, it, expect } from 'vitest';
import {
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  capitalize,
  truncate,
  template,
  generateUUID,
  reverse,
  isPalindrome,
  countOccurrences,
} from '../src/utils/string.js';

describe('String Utils', () => {
  describe('toCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('foo-bar-baz')).toBe('fooBarBaz');
    });

    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('foo_bar_baz')).toBe('fooBarBaz');
    });

    it('should handle mixed cases', () => {
      expect(toCamelCase('hello-world_test')).toBe('helloWorldTest');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('fooBarBaz')).toBe('foo_bar_baz');
    });

    it('should convert PascalCase to snake_case', () => {
      expect(toSnakeCase('HelloWorld')).toBe('hello_world');
    });
  });

  describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('fooBarBaz')).toBe('foo-bar-baz');
    });

    it('should convert PascalCase to kebab-case', () => {
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should only capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('hello world', 5)).toBe('he...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should support custom suffix', () => {
      expect(truncate('hello world', 8, '---')).toBe('hello---');
    });
  });

  describe('template', () => {
    it('should replace placeholders with values', () => {
      const result = template('Hello {name}, you are {age} years old', {
        name: 'Alice',
        age: 25,
      });
      expect(result).toBe('Hello Alice, you are 25 years old');
    });

    it('should handle missing values', () => {
      const result = template('Hello {name}, {missing}!', { name: 'Bob' });
      expect(result).toBe('Hello Bob, !');
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('reverse', () => {
    it('should reverse strings', () => {
      expect(reverse('hello')).toBe('olleh');
      expect(reverse('world')).toBe('dlrow');
    });

    it('should handle empty string', () => {
      expect(reverse('')).toBe('');
    });
  });

  describe('isPalindrome', () => {
    it('should detect palindromes', () => {
      expect(isPalindrome('racecar')).toBe(true);
      expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(isPalindrome('hello')).toBe(false);
    });

    it('should ignore case and non-alphanumeric characters', () => {
      expect(isPalindrome('Race Car')).toBe(true);
      expect(isPalindrome('Was it a car or a cat I saw?')).toBe(true);
    });
  });

  describe('countOccurrences', () => {
    it('should count occurrences correctly', () => {
      expect(countOccurrences('hello world', 'o')).toBe(2);
      expect(countOccurrences('hello hello', 'hello')).toBe(2);
    });

    it('should return 0 for non-existent substring', () => {
      expect(countOccurrences('hello', 'x')).toBe(0);
    });

    it('should handle empty substring', () => {
      expect(countOccurrences('hello', '')).toBe(0);
    });
  });
});
