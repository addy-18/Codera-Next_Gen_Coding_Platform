#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string s;
    if (cin >> s) {
        vector<char> res = separateCharacters(s);
        for (char c : res) {
            cout << c << endl;
        }
    }
    return 0;
}