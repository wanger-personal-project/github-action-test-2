/**
 * 数组处理工具集
 */

/**
 * 数组去重
 * @param arr - 输入数组
 * @returns 去重后的数组
 * @example
 * unique([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 数组分块
 * @param arr - 输入数组
 * @param size - 每块大小
 * @returns 分块后的二维数组
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');

  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * 数组扁平化
 * @param arr - 嵌套数组
 * @param depth - 扁平化深度（默认 Infinity）
 * @returns 扁平化后的数组
 * @example
 * flatten([[1, 2], [3, [4, 5]]]) // [1, 2, 3, 4, 5]
 */
export function flatten<T>(arr: unknown[], depth = Infinity): T[] {
  return arr.flat(depth) as T[];
}

/**
 * 洗牌算法（Fisher-Yates）
 * @param arr - 输入数组
 * @returns 打乱后的新数组
 * @example
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4]（随机结果）
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * 按某个属性分组
 * @param arr - 输入数组
 * @param key - 分组的键名或键函数
 * @returns 分组后的对象
 * @example
 * groupBy([{ age: 20 }, { age: 30 }, { age: 20 }], 'age')
 * // { '20': [{ age: 20 }, { age: 20 }], '30': [{ age: 30 }] }
 */
export function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  return arr.reduce(
    (result, item) => {
      const groupKey =
        typeof key === 'function' ? String(key(item)) : String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey]!.push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * 数组求交集
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @returns 交集数组
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * 数组求差集
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @returns 差集数组（arr1 中有但 arr2 中没有的元素）
 * @example
 * difference([1, 2, 3], [2, 3, 4]) // [1]
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * 数组求和
 * @param arr - 数字数组
 * @returns 总和
 * @example
 * sum([1, 2, 3, 4, 5]) // 15
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * 数组求平均值
 * @param arr - 数字数组
 * @returns 平均值
 * @example
 * average([1, 2, 3, 4, 5]) // 3
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * 数组取最大值
 * @param arr - 数字数组
 * @returns 最大值
 * @example
 * max([1, 5, 3, 9, 2]) // 9
 */
export function max(arr: number[]): number {
  return Math.max(...arr);
}

/**
 * 数组取最小值
 * @param arr - 数字数组
 * @returns 最小值
 * @example
 * min([1, 5, 3, 9, 2]) // 1
 */
export function min(arr: number[]): number {
  return Math.min(...arr);
}

/**
 * 移除数组中的假值
 * @param arr - 输入数组
 * @returns 移除假值后的数组
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined, NaN]) // [1, 2, 3]
 */
export function compact<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter(Boolean) as NonNullable<T>[];
}
