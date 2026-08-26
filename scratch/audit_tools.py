import json
import re

with open('mcp-server/tools.ts', 'r', encoding='utf-8') as f:
    tools_content = f.read()

tool_names = re.findall(r"name:\s*'([^']+)'", tools_content)
print(f"Total tools defined in tools.ts: {len(tool_names)}")
print("Tool names:", tool_names)

with open('mcp-server/index.ts', 'r', encoding='utf-8') as f:
    index_content = f.read()

handled_cases = re.findall(r"case\s+'([^']+)':", index_content)
print(f"\nTotal cases in index.ts: {len(handled_cases)}")
print("Handled cases:", handled_cases)

missing_in_index = [t for t in tool_names if t not in handled_cases]
print("\nTools in tools.ts but missing in index.ts cases:", missing_in_index)

# Find all parseEther / parseUnits
parse_ether_matches = [line.strip() for line in index_content.splitlines() if 'parseEther' in line]
print(f"\nparseEther occurrences in index.ts ({len(parse_ether_matches)}):")
for p in parse_ether_matches:
    print('  ', p)

parse_units_matches = [line.strip() for line in index_content.splitlines() if 'parseUnits' in line]
print(f"\nparseUnits occurrences in index.ts ({len(parse_units_matches)}):")
for p in parse_units_matches:
    print('  ', p)

# Also check mpcControlPlaneService.ts
with open('mcp-server/mpcControlPlaneService.ts', 'r', encoding='utf-8') as f:
    mpc_content = f.read()

mpc_ether_matches = [line.strip() for line in mpc_content.splitlines() if 'parseEther' in line or 'parseUnits' in line]
print(f"\nparseEther / parseUnits in mpcControlPlaneService.ts ({len(mpc_ether_matches)}):")
for p in mpc_ether_matches:
    print('  ', p)
