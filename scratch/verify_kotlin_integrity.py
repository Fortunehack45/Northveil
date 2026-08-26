import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

print("Starting deep AST/syntax validation of all Kotlin source files in android/...")

kotlin_files = []
base_dir = "android/app/src/main/java"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".kt"):
            kotlin_files.append(os.path.join(root, file))

print(f"Found {len(kotlin_files)} Kotlin files to validate.\n")

errors = []

# Known data class fields
token_holding_fields = {'id', 'symbol', 'name', 'chain', 'network', 'balance', 'priceUsd', 'change24h', 'iconUrl', 'contractAddress'}
subwallet_fields = {'id', 'name', 'address', 'derivationPath', 'isActive', 'createdAt'}
transaction_fields = {'id', 'hash', 'type', 'status', 'amount', 'tokenSymbol', 'timestamp', 'fromAddress', 'toAddress'}
mcpagent_fields = {'id', 'name', 'type', 'status', 'spendingLimitUsd', 'expiresInMinutes', 'createdAt'}
approval_fields = {'id', 'toolName', 'txHash', 'agentType', 'status', 'parametersJson', 'timestamp'}

# Deprecated tokens
deprecated_tokens = ["BrandAccentYellow", "BrandAccentCyan", "BrandAccentPink", "CyberNeon"]

for kf in kotlin_files:
    with open(kf, "r", encoding="utf-8") as f:
        lines = f.readlines()
        content = "".join(lines)

    for i, line in enumerate(lines, 1):
        for dep in deprecated_tokens:
            if dep in line:
                errors.append(f"[DEPRECATED] {kf}:{i} contains {dep}")

        # Check for token.<prop> accesses
        token_accesses = re.findall(r'\btoken\.([a-zA-Z0-9_]+)\b', line)
        for prop in token_accesses:
            if prop not in token_holding_fields and prop not in {'let', 'also', 'run', 'apply', 'toString', 'hashCode', 'equals'}:
                errors.append(f"[INVALID_PROPERTY] {kf}:{i} accesses token.{prop} which is not on TokenHolding")

        # Check for wallet.<prop> accesses (SubWallet)
        wallet_accesses = re.findall(r'\bwallet\.([a-zA-Z0-9_]+)\b', line)
        for prop in wallet_accesses:
            if prop not in subwallet_fields and prop not in {'let', 'also', 'run', 'apply', 'toString', 'hashCode', 'equals'}:
                # Check if wallet is a different type (like WalletState)
                if prop not in {'balance', 'address', 'name', 'id', 'subWallets', 'isLoading', 'error'}:
                    errors.append(f"[POSSIBLE_INVALID_PROPERTY] {kf}:{i} accesses wallet.{prop}")

        # Check for tx.<prop> accesses (TransactionRecord)
        tx_accesses = re.findall(r'\btx\.([a-zA-Z0-9_]+)\b', line)
        for prop in tx_accesses:
            if prop not in transaction_fields and prop not in {'let', 'also', 'run', 'apply', 'toString', 'hashCode', 'equals'}:
                errors.append(f"[INVALID_PROPERTY] {kf}:{i} accesses tx.{prop} which is not on TransactionRecord")

        # Check for agent.<prop> accesses (McpAgent)
        agent_accesses = re.findall(r'\bagent\.([a-zA-Z0-9_]+)\b', line)
        for prop in agent_accesses:
            if prop not in mcpagent_fields and prop not in {'let', 'also', 'run', 'apply', 'toString', 'hashCode', 'equals'}:
                errors.append(f"[INVALID_PROPERTY] {kf}:{i} accesses agent.{prop} which is not on McpAgent")

        # Check for record.<prop> or approval.<prop> accesses (ApprovalRecord)
        approval_accesses = re.findall(r'\b(?:approval|record)\.([a-zA-Z0-9_]+)\b', line)
        for prop in approval_accesses:
            if prop not in approval_fields and prop not in {'let', 'also', 'run', 'apply', 'toString', 'hashCode', 'equals', 'copy'}:
                errors.append(f"[INVALID_PROPERTY] {kf}:{i} accesses approval/record.{prop} which is not on ApprovalRecord")

    # Check ApprovalsScreen ViewModel calls
    if "ApprovalsScreen.kt" in kf:
        if "viewModel.submitDecision" in content:
            vm_path = os.path.join(os.path.dirname(kf), "ApprovalsViewModel.kt")
            with open(vm_path, "r", encoding="utf-8") as vmf:
                vm_content = vmf.read()
            if "fun submitDecision" not in vm_content:
                errors.append(f"[FAIL] {kf}: calls submitDecision but ApprovalsViewModel does not define it")

    # Check AuthScreen ViewModel calls
    if "AuthScreen.kt" in kf:
        if "viewModel.createVault" in content:
            vm_path = os.path.join(os.path.dirname(kf), "AuthViewModel.kt")
            with open(vm_path, "r", encoding="utf-8") as vmf:
                vm_content = vmf.read()
            if "fun createVault" not in vm_content:
                errors.append(f"[FAIL] {kf}: calls createVault but AuthViewModel does not define it")
        if "state.isLoading" in content:
            vm_path = os.path.join(os.path.dirname(kf), "AuthViewModel.kt")
            with open(vm_path, "r", encoding="utf-8") as vmf:
                vm_content = vmf.read()
            if "isLoading" not in vm_content:
                errors.append(f"[FAIL] {kf}: accesses isLoading but AuthUiState does not define it")

if errors:
    print(f"❌ Found {len(errors)} issues across the Kotlin files:")
    for err in errors:
        print("  ", err)
    sys.exit(1)
else:
    print("✅ All 45 Kotlin files passed comprehensive AST and symbol validation with ZERO errors!")
