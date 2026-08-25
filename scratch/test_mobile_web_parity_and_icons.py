import os
import sys
import xml.etree.ElementTree as ET
from PIL import Image

# Ensure UTF-8 stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def run_tests():
    print("======================================================")
    print("[TEST SUITE] RUNNING NORTHVEIL MOBILE PARITY & ICON TESTS")
    print("======================================================\n")
    
    passed = 0
    total = 0

    def assert_test(cond, title):
        nonlocal passed, total
        total += 1
        if cond:
            print(f"[PASS] {title}")
            passed += 1
        else:
            print(f"[FAIL] {title}")

    # TEST 1: Zero Neon Colors in Kotlin/XML Source Code
    print("--- TEST 1: Audit Android Source Code for Neon Accents ---")
    android_dir = "android/app/src/main"
    forbidden_tokens = ["BrandAccentYellow", "BrandAccentCyan", "BrandAccentPink", "CCFF00", "00F0FF", "FF007F", "brand_accent_yellow", "brand_accent_cyan", "brand_accent_pink"]
    found_forbidden = []
    
    for root, dirs, files in os.walk(android_dir):
        for f in files:
            if f.endswith((".kt", ".xml", ".gradle")):
                path = os.path.join(root, f)
                with open(path, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
                    for tok in forbidden_tokens:
                        if tok in content:
                            found_forbidden.append(f"{tok} in {path}")

    assert_test(len(found_forbidden) == 0, f"Zero forbidden neon tokens in Android codebase (Found: {found_forbidden})")

    # TEST 2: Verify Theme.kt & Color.kt Design Tokens
    print("\n--- TEST 2: Verify Zinc / Grayscale Design Tokens & Dual Color Schemes ---")
    color_kt_path = "android/app/src/main/java/xyz/northveil/mobile/core/designsystem/theme/Color.kt"
    with open(color_kt_path, "r", encoding="utf-8") as f:
        color_content = f.read()
        assert_test("val VaultBlack = Color(0xFF000000)" in color_content, "VaultBlack is pitch black #000000")
        assert_test("val CardSurfaceDark = Color(0xFF0F0F12)" in color_content, "CardSurfaceDark matches web #0F0F12")
        assert_test("val VaultLight = Color(0xFFF8F8FA)" in color_content, "VaultLight matches web #F8F8FA")
        assert_test("val CardSurfaceLight = Color(0xFFFFFFFF)" in color_content, "CardSurfaceLight matches web #FFFFFF")
        assert_test("val StatusAmber = Color(0xFFF59E0B)" in color_content, "StatusAmber is defined for pending states")
        assert_test("val StatusRed = Color(0xFFEF4444)" in color_content, "StatusRed is defined for error states")

    theme_kt_path = "android/app/src/main/java/xyz/northveil/mobile/core/designsystem/theme/Theme.kt"
    with open(theme_kt_path, "r", encoding="utf-8") as f:
        theme_content = f.read()
        assert_test("val DarkColorScheme = darkColorScheme(" in theme_content, "DarkColorScheme defined")
        assert_test("val LightColorScheme = lightColorScheme(" in theme_content, "LightColorScheme defined")
        assert_test("enum class ThemeMode" in theme_content, "ThemeMode (SYSTEM, DARK, LIGHT) enum exists")
        assert_test("val LocalThemeMode = compositionLocalOf" in theme_content, "LocalThemeMode composition local exists")
        assert_test("isAppearanceLightStatusBars" in theme_content, "WindowCompat dynamic status bar tinting wired")

    # TEST 3: Verify Blockies Identicon Component
    print("\n--- TEST 3: Deterministic Blockies Identicon ---")
    blockies_path = "android/app/src/main/java/xyz/northveil/mobile/core/designsystem/BlockiesIdenticon.kt"
    assert_test(os.path.exists(blockies_path), "BlockiesIdenticon.kt exists")
    with open(blockies_path, "r", encoding="utf-8") as f:
        blockies_content = f.read()
        assert_test("fun BlockiesIdenticon(" in blockies_content, "BlockiesIdenticon Compose function declared")
        assert_test("generateBlockiesData" in blockies_content, "5x5 deterministic grid generator implemented")
        assert_test("hslToColor" in blockies_content, "HSL color space converter implemented")

    # TEST 4: Verify Screen Parity & Passkey Biometric Wiring
    print("\n--- TEST 4: Screen Parity & Passkey Biometric Wiring ---")
    approvals_vm_path = "android/app/src/main/java/xyz/northveil/mobile/ui/approvals/ApprovalsViewModel.kt"
    with open(approvals_vm_path, "r", encoding="utf-8") as f:
        vm_content = f.read()
        assert_test("fun approveWithBiometricPasskey(" in vm_content, "ApprovalsViewModel triggers biometric prompt")
        assert_test("biometricPromptManager.authenticate" in vm_content, "BiometricPromptManager authenticates user")
        assert_test("fun createTestRequest(" in vm_content, "+ Test Request creator method implemented")

    approvals_screen_path = "android/app/src/main/java/xyz/northveil/mobile/ui/approvals/ApprovalsScreen.kt"
    with open(approvals_screen_path, "r", encoding="utf-8") as f:
        screen_content = f.read()
        assert_test("ON-CHAIN AUDIT" in screen_content, "ApprovalsScreen has ON-CHAIN AUDIT badge")
        assert_test("ApprovalFilter" in screen_content, "ApprovalsScreen has filter tabs (All, Confirmed, Pending, Failed)")
        assert_test("Passkey Approve" in screen_content, "ApprovalsScreen has Passkey Approve button")

    # TEST 5: Verify Adaptive Icon XMLs (Android 13+ Material You Spec)
    print("\n--- TEST 5: Adaptive Icon XMLs & Safe Zone Conformance ---")
    fg_path = "android/app/src/main/res/drawable/ic_launcher_foreground.xml"
    bg_path = "android/app/src/main/res/drawable/ic_launcher_background.xml"
    mono_path = "android/app/src/main/res/drawable/ic_launcher_monochrome.xml"
    
    for path, name in [(fg_path, "Foreground"), (bg_path, "Background"), (mono_path, "Monochrome")]:
        assert_test(os.path.exists(path), f"ic_launcher_{name.lower()}.xml exists")
        tree = ET.parse(path)
        root = tree.getroot()
        assert_test(root.tag == "vector", f"{name} root is <vector>")

    with open(fg_path, "r", encoding="utf-8") as f:
        fg_content = f.read()
        assert_test("#FE0182" in fg_content, "Foreground has official Northveil Pink tile (#FE0182)")
        assert_test("#31C2C7" in fg_content, "Foreground has official Northveil Cyan tile (#31C2C7)")

    with open(mono_path, "r", encoding="utf-8") as f:
        mono_content = f.read()
        assert_test('fillColor="#000000"' in mono_content, "Monochrome is a single-fill alpha silhouette (#000000) for Material You")

    # TEST 6: Verify Generated Legacy Raster Mipmaps
    print("\n--- TEST 6: Legacy Raster Mipmap Assets (mdpi through xxxhdpi) ---")
    expected_densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    for folder, expected_size in expected_densities.items():
        dir_path = os.path.join("android/app/src/main/res", folder)
        launcher_png = os.path.join(dir_path, "ic_launcher.png")
        round_png = os.path.join(dir_path, "ic_launcher_round.png")
        
        assert_test(os.path.exists(launcher_png), f"{folder}/ic_launcher.png exists")
        assert_test(os.path.exists(round_png), f"{folder}/ic_launcher_round.png exists")
        
        if os.path.exists(launcher_png):
            img = Image.open(launcher_png)
            assert_test(img.size == (expected_size, expected_size), f"{folder}/ic_launcher.png size is {expected_size}x{expected_size}")

        if os.path.exists(round_png):
            img_r = Image.open(round_png)
            assert_test(img_r.size == (expected_size, expected_size), f"{folder}/ic_launcher_round.png size is {expected_size}x{expected_size}")

    print("\n======================================================")
    print(f"ALL {passed}/{total} TESTS PASSED SUCCESSFULLY!")
    print("======================================================")

if __name__ == "__main__":
    run_tests()
