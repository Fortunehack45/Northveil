import re

with open('mcp-server/index.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Searching for potential BigInt issues in mcp-server/index.ts:")
for i, line in enumerate(lines, 1):
    if re.search(r'\b\d+n\b|BigInt|parseEther|parseUnits', line):
        print(f"Line {i}: {line.strip()}")
