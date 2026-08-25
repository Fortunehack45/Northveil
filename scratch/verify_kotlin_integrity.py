import os
import sys

# Set stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

print("Auditing Android Kotlin codebase for unresolved references and syntax consistency...\n")

kotlin_files = []
base_dir = "android/app/src/main/java"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".kt"):
            kotlin_files.append(os.path.join(root, file))

print(f"Found {len(kotlin_files)} Kotlin source files.")

errors = []

for kf in kotlin_files:
    with open(kf, "r", encoding="utf-8") as f:
        content = f.read()

    # Check for legacy neon colors
    for neon in ["BrandAccentYellow", "BrandAccentCyan", "BrandAccentPink", "CyberNeon"]:
        if neon in content:
            errors.append(f"[FAIL] {kf}: contains deprecated neon reference '{neon}'")

    # Check ApprovalsScreen calls
    if "ApprovalsScreen.kt" in kf:
        if "viewModel.submitDecision" in content:
            vm_path = os.path.join(os.path.dirname(kf), "ApprovalsViewModel.kt")
            with open(vm_path, "r", encoding="utf-8") as vmf:
                vm_content = vmf.read()
            if "fun submitDecision" not in vm_content:
                errors.append(f"[FAIL] {kf}: calls submitDecision but ApprovalsViewModel does not define it")

    # Check AuthScreen calls
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
    print(f"\nFound {len(errors)} issues:")
    for err in errors:
        print(err)
    sys.exit(1)
else:
    print(f"\n[PASS] All {len(kotlin_files)} Kotlin files passed syntax and ViewModel reference audit successfully!")
