package xyz.northveil.mobile.core.designsystem.theme

import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════════════
// NORTHVEIL DESIGN TOKENS (Extracted strictly from src/index.css)
// ═══════════════════════════════════════════════════════════════════

// Dark Palette (Pitch black base, pure zinc mono-cards, zero neon)
val VaultBlack = Color(0xFF000000)
val CardSurfaceDark = Color(0xFF0F0F12)
val CardSurfaceDarkHover = Color(0xFF141418)
val CardSurfaceSubtle = Color(0xFF18181C)
val ContainerDark = Color(0xFF131317)
val CardSurfaceBorderDark = Color(0x14FFFFFF) // 8% white outline
val BorderSubtleDark = Color(0xFF27272A)

val TextPrimaryDark = Color(0xFFFFFFFF)
val TextSecondaryDark = Color(0xFFA1A1AA) // Zinc 400
val TextTertiaryDark = Color(0xFF71717A)  // Zinc 500
val TextMutedDark = Color(0xFF52525B)     // Zinc 600
val ChipBackgroundDark = Color(0x14FFFFFF)

// Light Palette (Zinc 50 background, crisp white cards, neutral borders)
val VaultLight = Color(0xFFF8F8FA)
val CardSurfaceLight = Color(0xFFFFFFFF)
val CardSurfaceLightHover = Color(0xFFFDFDFD)
val CardSurfaceSubtleLight = Color(0xFFF4F4F5)
val ContainerLight = Color(0xFFEBEBEF)
val CardSurfaceBorderLight = Color(0x0F000000) // 6% black outline
val BorderSubtleLight = Color(0xFFE4E4E7)

val TextPrimaryLight = Color(0xFF09090B)   // Zinc 950
val TextSecondaryLight = Color(0xFF71717A) // Zinc 500
val TextTertiaryLight = Color(0xFFA1A1AA)  // Zinc 400
val TextMutedLight = Color(0xFFD4D4D8)     // Zinc 300
val ChipBackgroundLight = Color(0x0F000000)

// Semantic Status Colors (Tailwind red-*, amber-*, emerald-*)
val StatusGreen = Color(0xFF10B981)
val StatusGreenBg = Color(0x1A10B981)
val StatusRed = Color(0xFFEF4444)
val StatusRedBg = Color(0x1AEF4444)
val StatusAmber = Color(0xFFF59E0B)
val StatusAmberBg = Color(0x1AF59E0B)

// Solid Monochrome Button Tokens (.mono-btn-white & .mono-btn-dark)
val ButtonPrimaryDarkBg = Color(0xFFFFFFFF)
val ButtonPrimaryDarkText = Color(0xFF000000)
val ButtonPrimaryLightBg = Color(0xFF000000)
val ButtonPrimaryLightText = Color(0xFFFFFFFF)

// Backward-compatibility default aliases (Dark by default)
val TextPrimary = TextPrimaryDark
val TextSecondary = TextSecondaryDark
val TextTertiary = TextTertiaryDark
val ChipBackground = ChipBackgroundDark
