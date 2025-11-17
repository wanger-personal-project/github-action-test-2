/**
 * 工具函数演示脚本
 * 这个脚本会在 GitHub Actions 中运行，展示所有工具函数的效果
 */

import * as StringUtils from './utils/string.js';
import * as ArrayUtils from './utils/array.js';

console.log('='.repeat(60));
console.log('🚀 TypeScript Utils Demo - GitHub Actions Test');
console.log('='.repeat(60));
console.log('');

// ============ 字符串工具演示 ============
console.log('📝 字符串处理工具');
console.log('-'.repeat(60));

console.log('\n1️⃣ 命名风格转换:');
const original = 'hello-world-test';
console.log(`   原始: "${original}"`);
console.log(`   驼峰: "${StringUtils.toCamelCase(original)}"`);
console.log(`   蛇形: "${StringUtils.toSnakeCase('helloWorldTest')}"`);
console.log(`   短横: "${StringUtils.toKebabCase('HelloWorldTest')}"`);

console.log('\n2️⃣ 字符串操作:');
console.log(`   首字母大写: "${StringUtils.capitalize('hello')}" → "${StringUtils.capitalize('hello')}"`);
console.log(
  `   截断: "${StringUtils.truncate('这是一个很长的字符串示例', 10)}"`
);
console.log(`   反转: "${StringUtils.reverse('GitHub Actions')}"`);

console.log('\n3️⃣ 模板填充:');
const templateStr = 'Hello {name}, 欢迎来到 {place}!';
const data = { name: 'Alice', place: 'GitHub Actions' };
console.log(`   模板: "${templateStr}"`);
console.log(`   结果: "${StringUtils.template(templateStr, data)}"`);

console.log('\n4️⃣ UUID 生成:');
console.log(`   UUID: ${StringUtils.generateUUID()}`);
console.log(`   UUID: ${StringUtils.generateUUID()}`);

console.log('\n5️⃣ 回文检测:');
console.log(`   "racecar" 是回文? ${String(StringUtils.isPalindrome('racecar'))}`);
console.log(`   "hello" 是回文? ${String(StringUtils.isPalindrome('hello'))}`);

console.log('\n6️⃣ 子串计数:');
const text = 'GitHub Actions is awesome, Actions rocks!';
console.log(`   文本: "${text}"`);
console.log(`   "Actions" 出现次数: ${String(StringUtils.countOccurrences(text, 'Actions'))}`);

// ============ 数组工具演示 ============
console.log('\n\n📊 数组处理工具');
console.log('-'.repeat(60));

console.log('\n1️⃣ 数组去重:');
const duplicates = [1, 2, 2, 3, 3, 4, 5, 5];
console.log(`   原数组: [${duplicates.join(', ')}]`);
console.log(`   去重后: [${ArrayUtils.unique(duplicates).join(', ')}]`);

console.log('\n2️⃣ 数组分块:');
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(`   原数组: [${numbers.join(', ')}]`);
console.log(`   分块(3): ${JSON.stringify(ArrayUtils.chunk(numbers, 3))}`);

console.log('\n3️⃣ 数组扁平化:');
const nested = [[1, 2], [3, [4, 5]], [6]];
console.log(`   嵌套数组: ${JSON.stringify(nested)}`);
console.log(`   扁平化: [${ArrayUtils.flatten(nested).join(', ')}]`);

console.log('\n4️⃣ 数组洗牌:');
const ordered = [1, 2, 3, 4, 5];
console.log(`   原数组: [${ordered.join(', ')}]`);
console.log(`   洗牌后: [${ArrayUtils.shuffle(ordered).join(', ')}]`);

console.log('\n5️⃣ 数组分组:');
const people = [
  { name: 'Alice', age: 20 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 20 },
  { name: 'David', age: 30 },
];
console.log(`   原数据: ${JSON.stringify(people)}`);
const grouped = ArrayUtils.groupBy(people, 'age');
console.log(`   按年龄分组:`);
for (const [age, group] of Object.entries(grouped)) {
  console.log(`      ${age}岁: ${group.map((p) => p.name).join(', ')}`);
}

console.log('\n6️⃣ 集合运算:');
const arr1 = [1, 2, 3, 4];
const arr2 = [3, 4, 5, 6];
console.log(`   数组1: [${arr1.join(', ')}]`);
console.log(`   数组2: [${arr2.join(', ')}]`);
console.log(`   交集: [${ArrayUtils.intersection(arr1, arr2).join(', ')}]`);
console.log(`   差集: [${ArrayUtils.difference(arr1, arr2).join(', ')}]`);

console.log('\n7️⃣ 数学运算:');
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log(`   数组: [${nums.join(', ')}]`);
console.log(`   求和: ${String(ArrayUtils.sum(nums))}`);
console.log(`   平均值: ${String(ArrayUtils.average(nums))}`);
console.log(`   最大值: ${String(ArrayUtils.max(nums))}`);
console.log(`   最小值: ${String(ArrayUtils.min(nums))}`);

console.log('\n8️⃣ 移除假值:');
const mixed = [0, 1, false, 2, '', 3, null, undefined, 4];
console.log(`   原数组: [${mixed.join(', ')}]`);
console.log(`   移除假值: [${ArrayUtils.compact(mixed).join(', ')}]`);

// ============ 总结 ============
console.log('\n' + '='.repeat(60));
console.log('✅ 演示完成！所有工具函数运行正常。');
console.log('💡 这个脚本在 GitHub Actions CI 中成功执行。');
console.log('='.repeat(60));
console.log('');
