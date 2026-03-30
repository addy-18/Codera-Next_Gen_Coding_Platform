import sys
# {{USER_CODE}}
if __name__ == "__main__":
    inp = sys.stdin.read().split()
    haystack = inp[0] if len(inp) > 0 else ""
    needle = inp[1] if len(inp) > 1 else ""
    print(strStr(haystack, needle))
