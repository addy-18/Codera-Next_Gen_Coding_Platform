#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string haystack, needle;
    if (cin >> haystack >> needle) {
        cout << strStr(haystack, needle) << endl;
    }
    return 0;
}