import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding problems...');

  await prisma.problem.upsert({
    where: { id: 'problem_1' },
    update: {},
    create: {
      id: 'problem_1',
      name: 'Two Sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nReturn the answer with the **smaller index first**.\n\n**Example 1:**\n\`\`\`text\nInput: nums = [2,7,11,15], target = 9\nOutput: [0, 1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: nums = [3,2,4], target = 6\nOutput: [1, 2]\n\`\`\`\n\n**Example 3:**\n\`\`\`text\nInput: nums = [3,3], target = 6\nOutput: [0, 1]\n\`\`\`\n\n**Constraints:**\n* \`2 <= nums.length <= 10^4\`\n* \`-10^9 <= nums[i] <= 10^9\`\n* \`-10^9 <= target <= 10^9\`\n* Only one valid answer exists.`,
      difficulty: 'Easy',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ],
      sampleTestCases: [
        { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' },
        { input: '3\n3 2 4\n6', expectedOutput: '1 2' },
        { input: '2\n3 3\n6', expectedOutput: '0 1' },
      ],
      halfBoilerplate: {
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}`,
        java: `public static int[] twoSum(int[] nums, int target) {\n    // Write your code here\n}`,
        python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_2' },
    update: {},
    create: {
      id: 'problem_2',
      name: 'Palindrome Checker',
      description: `Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise. A string is a palindrome if it reads the same forwards and backwards.\n\n**Example 1:**\n\`\`\`text\nInput: s = "racecar"\nOutput: true\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: s = "hello"\nOutput: false\n\`\`\`\n\n**Example 3:**\n\`\`\`text\nInput: s = "a"\nOutput: true\n\`\`\`\n\n**Constraints:**\n* \`1 <= s.length <= 10^5\`\n* \`s\` consists only of printable ASCII characters.`,
      difficulty: 'Easy',
      constraints: [
        '1 <= s.length <= 10^5',
        's consists only of printable ASCII characters.'
      ],
      sampleTestCases: [
        { input: 'racecar', expectedOutput: 'true' },
        { input: 'hello', expectedOutput: 'false' },
        { input: 'a', expectedOutput: 'true' },
      ],
      halfBoilerplate: {
        cpp: `bool isPalindrome(string s) {\n    // Write your code here\n}`,
        java: `public static boolean isPalindrome(String s) {\n    // Write your code here\n    return false;\n}`,
        python: `def isPalindrome(s: str) -> bool:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_3' },
    update: {},
    create: {
      id: 'problem_3',
      name: 'Reverse String',
      description: `Given a string \`s\`, return the string reversed.\n\n**Example 1:**\n\`\`\`text\nInput: s = "hello"\nOutput: "olleh"\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: s = "world"\nOutput: "dlrow"\n\`\`\`\n\n**Example 3:**\n\`\`\`text\nInput: s = "a"\nOutput: "a"\n\`\`\`\n\n**Constraints:**\n* \`0 <= s.length <= 10^5\`\n* \`s\` consists of printable ASCII characters.`,
      difficulty: 'Easy',
      constraints: [
        '0 <= s.length <= 10^5',
        's consists of printable ASCII characters.'
      ],
      sampleTestCases: [
        { input: 'hello', expectedOutput: 'olleh' },
        { input: 'world', expectedOutput: 'dlrow' },
        { input: 'a', expectedOutput: 'a' },
      ],
      halfBoilerplate: {
        cpp: `string reverseString(string s) {\n    // Write your code here\n}`,
        java: `public static String reverseString(String s) {\n    // Write your code here\n    return "";\n}`,
        python: `def reverseString(s: str) -> str:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_4' },
    update: {},
    create: {
      id: 'problem_4',
      name: 'Separate Characters from String',
      description: `Given a string \`s\`, separate the characters from the string and return them as an array or list of characters. The system will automatically print each character on a new line.\n\n**Example 1:**\n\`\`\`text\nInput: s = "hi"\nOutput: \nh\ni\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: s = "abc"\nOutput: \na\nb\nc\n\`\`\`\n\n**Constraints:**\n* \`1 <= s.length <= 10^4\`\n* \`s\` consists of printable ASCII characters.`,
      difficulty: 'Easy',
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of printable ASCII characters.'
      ],
      sampleTestCases: [
        { input: 'hi', expectedOutput: 'h\ni' },
        { input: 'abc', expectedOutput: 'a\nb\nc' },
      ],
      halfBoilerplate: {
        cpp: `vector<char> separateCharacters(string s) {\n    // Write your code here\n}`,
        java: `public static List<Character> separateCharacters(String s) {\n    // Write your code here\n    return new ArrayList<>();\n}`,
        python: `def separateCharacters(s: str) -> list[str]:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_5' },
    update: {},
    create: {
      id: 'problem_5',
      name: 'Count Vowels',
      description: `Given a string \`s\`, count and return the number of vowels (\`a\`, \`e\`, \`i\`, \`o\`, \`u\`) contained within it. The string may contain both uppercase and lowercase letters; you should count both.\n\n**Example 1:**\n\`\`\`text\nInput: s = "hello"\nOutput: 2\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: s = "apple"\nOutput: 2\n\`\`\`\n\n**Example 3:**\n\`\`\`text\nInput: s = "rhythm"\nOutput: 0\n\`\`\`\n\n**Constraints:**\n* \`0 <= s.length <= 10^5\`\n* \`s\` consists of printable ASCII characters.`,
      difficulty: 'Easy',
      constraints: [
        '0 <= s.length <= 10^5',
      ],
      sampleTestCases: [
        { input: 'hello', expectedOutput: '2' },
        { input: 'apple', expectedOutput: '2' },
        { input: 'rhythm', expectedOutput: '0' },
      ],
      halfBoilerplate: {
        cpp: `int countVowels(string s) {\n    // Write your code here\n}`,
        java: `public static int countVowels(String s) {\n    // Write your code here\n    return 0;\n}`,
        python: `def countVowels(s: str) -> int:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_6' },
    update: {},
    create: {
      id: 'problem_6',
      name: 'Valid Anagram',
      description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.\n\n**Example 1:**\n\`\`\`text\nInput: s = "anagram", t = "nagaram"\nOutput: true\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: s = "rat", t = "car"\nOutput: false\n\`\`\`\n\n**Constraints:**\n* \`1 <= s.length, t.length <= 5 * 10^4\`\n* \`s\` and \`t\` consist of lowercase English letters.`,
      difficulty: 'Easy',
      constraints: [
        '1 <= s.length, t.length <= 5 * 10^4',
        's and t consist of lowercase English letters.'
      ],
      sampleTestCases: [
        { input: 'anagram nagaram', expectedOutput: 'true' },
        { input: 'rat car', expectedOutput: 'false' },
      ],
      halfBoilerplate: {
        cpp: `bool isAnagram(string s, string t) {\n    // Write your code here\n}`,
        java: `public static boolean isAnagram(String s, String t) {\n    // Write your code here\n    return false;\n}`,
        python: `def isAnagram(s: str, t: str) -> bool:\n    # Write your code here\n    pass`,
      },
    },
  });

  await prisma.problem.upsert({
    where: { id: 'problem_7' },
    update: {},
    create: {
      id: 'problem_7',
      name: 'Find the Index of the First Occurrence in a String',
      description: `Given two strings \`needle\` and \`haystack\`, return the index of the first occurrence of \`needle\` in \`haystack\`, or \`-1\` if \`needle\` is not part of \`haystack\`.\n\n**Example 1:**\n\`\`\`text\nInput: haystack = "sadbutsad", needle = "sad"\nOutput: 0\n\`\`\`\n\n**Example 2:**\n\`\`\`text\nInput: haystack = "leetcode", needle = "leeto"\nOutput: -1\n\`\`\`\n\n**Constraints:**\n* \`1 <= haystack.length, needle.length <= 10^4\`\n* \`haystack\` and \`needle\` consist of only lowercase English characters.`,
      difficulty: 'Medium',
      constraints: [
        '1 <= haystack.length, needle.length <= 10^4',
        'haystack and needle consist of only lowercase English characters.'
      ],
      sampleTestCases: [
        { input: 'sadbutsad sad', expectedOutput: '0' },
        { input: 'leetcode leeto', expectedOutput: '-1' },
      ],
      halfBoilerplate: {
        cpp: `int strStr(string haystack, string needle) {\n    // Write your code here\n}`,
        java: `public static int strStr(String haystack, String needle) {\n    // Write your code here\n    return -1;\n}`,
        python: `def strStr(haystack: str, needle: str) -> int:\n    # Write your code here\n    pass`,
      },
    },
  });

  console.log('Seeded problem_1 through problem_7 with improved markdown');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
