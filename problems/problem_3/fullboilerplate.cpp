#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string s;
    if (cin >> s) {
        cout << reverseString(s) << endl;
    } else { cout << reverseString("") << endl; }
    return 0;
}