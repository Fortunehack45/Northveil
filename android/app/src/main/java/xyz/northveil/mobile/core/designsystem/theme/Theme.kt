package xyz.northveil.mobile.core.designsystem.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

enum class ThemeMode {
    SYSTEM, DARK, LIGHT
}

val LocalThemeMode = compositionLocalOf { mutableStateOf(ThemeMode.SYSTEM) }

val DarkColorScheme = darkColorScheme(
    primary = TextPrimaryDark,
    onPrimary = Color.Black,
    secondary = TextSecondaryDark,
    onSecondary = Color.Black,
    tertiary = CardSurfaceSubtle,
    background = VaultBlack,
    onBackground = TextPrimaryDark,
    surface = CardSurfaceDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = CardSurfaceSubtle,
    onSurfaceVariant = TextSecondaryDark,
    outline = CardSurfaceBorderDark,
    outlineVariant = BorderSubtleDark,
    error = StatusRed,
    onError = Color.White
)

val LightColorScheme = lightColorScheme(
    primary = TextPrimaryLight,
    onPrimary = Color.White,
    secondary = TextSecondaryLight,
    onSecondary = Color.White,
    tertiary = CardSurfaceSubtleLight,
    background = VaultLight,
    onBackground = TextPrimaryLight,
    surface = CardSurfaceLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = CardSurfaceSubtleLight,
    onSurfaceVariant = TextSecondaryLight,
    outline = CardSurfaceBorderLight,
    outlineVariant = BorderSubtleLight,
    error = StatusRed,
    onError = Color.White
)

@Composable
fun NorthveilTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme: ColorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode && view.context is Activity) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            val insetsController = WindowCompat.getInsetsController(window, view)
            insetsController.isAppearanceLightStatusBars = !darkTheme
            insetsController.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = NorthveilTypography,
        content = content
    )
}
