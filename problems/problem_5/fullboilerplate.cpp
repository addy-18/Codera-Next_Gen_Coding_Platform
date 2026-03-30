#include <bits/stdc++.h>
using namespace std;
// {{USER_CODE}}
int main() {
    string s;
    if (cin >> s) {
        cout << countVowels(s) << endl;
    } else { cout << countVowels("") << endl; }
    return 0;
}