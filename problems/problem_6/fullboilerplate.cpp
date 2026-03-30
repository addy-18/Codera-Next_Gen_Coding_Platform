#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string s, t;
    if (cin >> s >> t) {
        bool res = isAnagram(s, t);
        cout << (res ? "true" : "false") << endl;
    }
    return 0;
}