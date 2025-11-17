/**
 * 字符串处理工具集
 */

/**
 * 转换为驼峰命名
 * @param str - 输入字符串
 * @returns 驼峰命名字符串
 * @example
 * toCamelCase('hello-world') // 'helloWorld'
 * toCamelCase('hello_world') // 'helloWorld'
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_-](\w)/g, (_, c: string) => c.toUpperCase());
}

/**
 * 转换为蛇形命名
 * @param str - 输入字符串
 * @returns 蛇形命名字符串
 * @example
 * toSnakeCase('helloWorld') // 'hello_world'
 * toSnakeCase('HelloWorld') // 'hello_world'
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * 转换为短横线命名
 * @param str - 输入字符串
 * @returns 短横线命名字符串
 * @example
 * toKebabCase('helloWorld') // 'hello-world'
 * toKebabCase('HelloWorld') // 'hello-world'
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * 首字母大写
 * @param str - 输入字符串
 * @returns 首字母大写的字符串
 * @example
 * capitalize('hello') // 'Hello'
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 截断字符串
 * @param str - 输入字符串
 * @param maxLength - 最大长度
 * @param suffix - 后缀（默认为 '...'）
 * @returns 截断后的字符串
 * @example
 * truncate('hello world', 8) // 'hello...'
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 模板字符串填充
 * @param template - 模板字符串，使用 {key} 作为占位符
 * @param data - 数据对象
 * @returns 填充后的字符串
 * @example
 * template('Hello {name}, you are {age} years old', { name: 'Alice', age: 25 })
 * // 'Hello Alice, you are 25 years old'
 */
export function template(
  template: string,
  data: Record<string, unknown>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = data[key];
    return value !== undefined ? String(value) : '';
  });
}

/**
 * 生成简单的 UUID v4
 * @returns UUID 字符串
 * @example
 * generateUUID() // '550e8400-e29b-41d4-a716-446655440000'
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 反转字符串
 * @param str - 输入字符串
 * @returns 反转后的字符串
 * @example
 * reverse('hello') // 'olleh'
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * 判断是否为回文
 * @param str - 输入字符串
 * @returns 是否为回文
 * @example
 * isPalindrome('racecar') // true
 * isPalindrome('hello') // false
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

/**
 * 计算字符串中某个子串出现的次数
 * @param str - 输入字符串
 * @param substr - 子串
 * @returns 出现次数
 * @example
 * countOccurrences('hello world', 'o') // 2
 */
export function countOccurrences(str: string, substr: string): number {
  if (!substr) return 0;
  return (str.match(new RegExp(substr, 'g')) ?? []).length;
}
