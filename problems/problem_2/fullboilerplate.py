import sys
# {{USER_CODE}}
if __name__ == "__main__":
    inp = sys.stdin.read().split()
    if inp:
        res = isPalindrome(inp[0])
        print("true" if res else "false")