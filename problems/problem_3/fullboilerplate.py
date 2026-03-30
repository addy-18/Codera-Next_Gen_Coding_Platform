import sys
# {{USER_CODE}}
if __name__ == "__main__":
    inp = sys.stdin.read().split()
    s = inp[0] if inp else ""
    print(reverseString(s))