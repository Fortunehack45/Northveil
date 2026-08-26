import re

with open('mcp-server/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all case blocks in executeRealTool
case_pattern = re.compile(r"case\s+'([^']+)':\s*\{([\s\S]*?)(?=\n\s*case\s+'|\n\s*default:|\n\s*\}\s*function)", re.MULTILINE)

matches = case_pattern.findall(content)
print(f"Extracted {len(matches)} tool handlers from index.ts:\n")

for tool_name, block in matches:
    # Look for args usage
    args_used = set(re.findall(r'args(?:\?\.|\.)([a-zA-Z0-9_]+)', block))
    print(f"Tool: {tool_name}")
    print(f"  Args accessed: {sorted(list(args_used))}")
    
    # Check for parseEther or parseUnits
    if 'parseEther' in block or 'parseUnits' in block:
        print("  -> CONTAINS parseEther / parseUnits")
    if '0n' in block or '1n' in block:
        print("  -> CONTAINS 0n / 1n")
    if 'throw' in block:
        throws = re.findall(r'throw\s+new\s+Error\((.*?)\)', block)
        print(f"  Throws: {throws}")
    print()
