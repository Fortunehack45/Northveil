import re

with open('mcp-server/tools.ts', 'r', encoding='utf-8') as f:
    text = f.read()

tools = re.findall(r"name:\s*'([^']+)'[\s\S]*?annotations:\s*\{([^}]+)\}", text)
print(f"Total tools with annotations: {len(tools)}")
for name, annot in tools:
    if 'confirmationRequired: true' in annot:
        print(f"  [GATED] {name}")
    else:
        print(f"  [DIRECT] {name}")
