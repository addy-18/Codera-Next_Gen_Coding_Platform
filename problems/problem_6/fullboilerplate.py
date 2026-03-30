import sys
# {{USER_CODE}}
if __name__ == "__main__":
    inp = sys.stdin.read().split()
    s = inp[0] if len(inp) > 0 else ""
    t = inp[1] if len(inp) > 1 else ""
    res = isAnagram(s, t)
    print("true" if res else "false")