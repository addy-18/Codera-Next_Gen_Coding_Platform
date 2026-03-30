#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string s;
    if (cin >> s) {
        bool res = isPalindrome(s);
        cout << (res ? "true" : "false") << endl;
    }
    return 0;
}