import re

with open('mcp-server/tools.ts', 'r', encoding='utf-8') as f:
    tools_content = f.read()

tools = re.findall(r"name:\s*'([^']+)'", tools_content)

with open('mcp-server/index.ts', 'r', encoding='utf-8') as f:
    index_content = f.read()

cases = re.findall(r"case\s+'([^']+)':", index_content)

print(f"Tools in tools.ts ({len(tools)}):")
for t in tools:
    status = "EXISTS" if t in cases else "MISSING"
    print(f"  - {t}: {status}")

print(f"\nExtra cases in index.ts ({len(cases)} total):")
for c in cases:
    if c not in tools:
        print(f"  + {c} (alias/extra)")
