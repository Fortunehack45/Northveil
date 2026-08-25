# Northveil Native Android Mobile App

The official **native Android mobile wallet and AI agent hub** for the Northveil custodial multi-chain platform.

Built with **Kotlin, Jetpack Compose, Material 3 Dark Theme, MVVM/MVI with StateFlow, Room (offline-first), Retrofit/OkHttp, Hilt DI, Biometrics (BiometricPrompt), CameraX (QR Scanner), and Jetpack Glance (Home Screen Widget)**.

---

## Features & Screen Mapping

| Screen / Feature | Web App Source | Native Android Implementation |
| :--- | :--- | :--- |
| **Auth & Vault Creation** | `OnboardingAuthModal.tsx` | `AuthScreen.kt` with BIP-39 mnemonic generator and encrypted Keystore password hashing. |
| **Lock Screen** | `App.tsx` | `LockScreen.kt` with hardware-backed `BiometricPrompt` & password fallback. |
| **Overview (Portfolio)** | `OverviewView.tsx` | `OverviewScreen.kt` with Net Worth, 4 quick actions (`Send`, `Receive`, `Deposit`, `Approvals`), multi-chain token list. |
| **Wallets & Accounts** | `WalletsView.tsx` | `WalletsScreen.kt` with active derivation path hero card, sub-accounts list, and **Hold-to-Reveal** private key sheet. |
| **AI Agents** | `AgentsView.tsx` | `AgentsScreen.kt` managing Claude Desktop, ChatGPT, and Autonomous Agent sessions with spending limits. |
| **Action Approvals** | `ApprovalsView.tsx` | `ApprovalsScreen.kt` with live audit logs and instant approve/reject controls. |
| **Developer Hub** | `DeveloperHubView.tsx` | `DeveloperHubScreen.kt` with CLI, SDK, Webhooks, and interactive MCP tool tester. |
| **Profile & Settings** | `ProfileView.tsx` | `ProfileScreen.kt` with verified identity, biometrics toggle, and lock controls. |
| **Send & Receive Sheets** | `SendReceiveModal.tsx` | `SendBottomSheet.kt` (CameraX QR scanner, gas fee calculator) & `ReceiveBottomSheet.kt` (ZXing QR generator). |
| **Home Screen Widget** | *New Mobile Native* | `PortfolioWidget.kt` built with Jetpack Glance. |

---

## App Icon & Android 13+ Themed Material You Icons

* **Artwork Source**: `https://iili.io/CD1CVJ2.png`
* **Adaptive Icon Layers**:
  - `res/drawable/ic_launcher_background.xml`: `#0A0B0E` solid background.
  - `res/drawable/ic_launcher_foreground.xml`: Full-color vector shield emblem.
  - `res/drawable/ic_launcher_monochrome.xml`: Material You alpha-only silhouette for dynamic OS-level wallpaper color tinting on Android 13+.

---

## Prerequisites & Building

1. **Android Studio**: Jellyfish (2023.3.1+) or Koala / Ladybug.
2. **JDK**: Version 17.
3. **Target SDK**: Android 14 (API Level 34), Min SDK: Android 8.0 (API Level 26).

### Open in Android Studio
1. Open Android Studio.
2. Select **Open** and choose the `android/` directory inside this repository.
3. Allow Gradle to sync dependencies from Google Maven & Maven Central.
4. Run the app on an Android 13+ emulator or physical device.
