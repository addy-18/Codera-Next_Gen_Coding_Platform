const fs = require('fs');
const path = require('path');

const problemsBase = path.join(__dirname, 'problems');

const problemsData = {
    'problem_2': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string s;\n    if (cin >> s) {\n        bool res = isPalindrome(s);\n        cout << (res ? "true" : "false") << endl;\n    }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            boolean res = isPalindrome(s);\n            System.out.println(res ? "true" : "false");\n        }\n    }\n}`,
        p: `import sys\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    if inp:\n        res = isPalindrome(inp[0])\n        print("true" if res else "false")`,
        tests: [
            {in: 'racecar', out: 'true'},
            {in: 'hello', out: 'false'},
            {in: 'a', out: 'true'}
        ]
    },
    'problem_3': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << reverseString(s) << endl;\n    } else { cout << reverseString("") << endl; }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        System.out.println(reverseString(s));\n    }\n}`,
        p: `import sys\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    s = inp[0] if inp else ""\n    print(reverseString(s))`,
        tests: [
            {in: 'hello', out: 'olleh'},
            {in: 'world', out: 'dlrow'},
            {in: 'a', out: 'a'}
        ]
    },
    'problem_4': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string s;\n    if (cin >> s) {\n        vector<char> res = separateCharacters(s);\n        for (char c : res) {\n            cout << c << endl;\n        }\n    }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        if (!s.isEmpty()) {\n            List<Character> res = separateCharacters(s);\n            for (char c : res) {\n                System.out.println(c);\n            }\n        }\n    }\n}`,
        p: `import sys\nfrom typing import List\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    if inp:\n        res = separateCharacters(inp[0])\n        for c in res:\n            print(c)`,
        tests: [
            {in: 'hi', out: 'h\\ni'},
            {in: 'abc', out: 'a\\nb\\nc'},
            {in: 'z', out: 'z'}
        ]
    },
    'problem_5': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << countVowels(s) << endl;\n    } else { cout << countVowels("") << endl; }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        System.out.println(countVowels(s));\n    }\n}`,
        p: `import sys\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    s = inp[0] if inp else ""\n    print(countVowels(s))`,
        tests: [
            {in: 'hello', out: '2'},
            {in: 'apple', out: '2'},
            {in: 'rhythm', out: '0'}
        ]
    },
    'problem_6': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string s, t;\n    if (cin >> s >> t) {\n        bool res = isAnagram(s, t);\n        cout << (res ? "true" : "false") << endl;\n    }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        String t = sc.hasNext() ? sc.next() : "";\n        boolean res = isAnagram(s, t);\n        System.out.println(res ? "true" : "false");\n    }\n}`,
        p: `import sys\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    s = inp[0] if len(inp) > 0 else ""\n    t = inp[1] if len(inp) > 1 else ""\n    res = isAnagram(s, t)\n    print("true" if res else "false")`,
        tests: [
            {in: 'anagram nagaram', out: 'true'},
            {in: 'rat car', out: 'false'},
            {in: 'a a', out: 'true'}
        ]
    },
    'problem_7': {
        c: `#include <bits/stdc++.h>\nusing namespace std;\n// {{USER_CODE}}\nint main() {\n    string haystack, needle;\n    if (cin >> haystack >> needle) {\n        cout << strStr(haystack, needle) << endl;\n    }\n    return 0;\n}`,
        j: `import java.util.*;\npublic class Main {\n    // {{USER_CODE}}\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String haystack = sc.hasNext() ? sc.next() : "";\n        String needle = sc.hasNext() ? sc.next() : "";\n        System.out.println(strStr(haystack, needle));\n    }\n}`,
        p: `import sys\n# {{USER_CODE}}\nif __name__ == "__main__":\n    inp = sys.stdin.read().split()\n    haystack = inp[0] if len(inp) > 0 else ""\n    needle = inp[1] if len(inp) > 1 else ""\n    print(strStr(haystack, needle))\n`,
        tests: [
            {in: 'sadbutsad sad', out: '0'},
            {in: 'leetcode leeto', out: '-1'},
            {in: 'hello ll', out: '2'}
        ]
    }
};

for (const [probId, data] of Object.entries(problemsData)) {
    const probPath = path.join(problemsBase, probId);
    fs.mkdirSync(path.join(probPath, 'inputs'), {recursive: true});
    fs.mkdirSync(path.join(probPath, 'outputs'), {recursive: true});
    
    fs.writeFileSync(path.join(probPath, 'fullboilerplate.cpp'), data.c);
    fs.writeFileSync(path.join(probPath, 'fullboilerplate.java'), data.j);
    fs.writeFileSync(path.join(probPath, 'fullboilerplate.py'), data.p);
    
    data.tests.forEach((t, i) => {
        fs.writeFileSync(path.join(probPath, 'inputs', String(i+1) + '.txt'), t.in);
        fs.writeFileSync(path.join(probPath, 'outputs', String(i+1) + '.txt'), t.out);
    });
}
console.log("Scaffolding complete.");
