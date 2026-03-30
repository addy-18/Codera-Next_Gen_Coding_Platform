import sys
from typing import List
# {{USER_CODE}}
if __name__ == "__main__":
    inp = sys.stdin.read().split()
    if inp:
        res = separateCharacters(inp[0])
        for c in res:
            print(c)