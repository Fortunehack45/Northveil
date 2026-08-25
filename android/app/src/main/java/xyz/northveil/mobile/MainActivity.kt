package xyz.northveil.mobile

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.fragment.app.FragmentActivity
import dagger.hilt.android.AndroidEntryPoint
import xyz.northveil.mobile.core.designsystem.theme.LocalThemeMode
import xyz.northveil.mobile.core.designsystem.theme.NorthveilTheme
import xyz.northveil.mobile.core.designsystem.theme.ThemeMode
import xyz.northveil.mobile.core.security.EncryptedKeystoreManager
import xyz.northveil.mobile.ui.navigation.NorthveilNavigation
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : FragmentActivity() {

    @Inject
    lateinit var keystoreManager: EncryptedKeystoreManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val isVaultConfigured = keystoreManager.isVaultConfigured()

        setContent {
            val themeModeState = remember { mutableStateOf(ThemeMode.SYSTEM) }
            val isSystemDark = isSystemInDarkTheme()
            val isDark = when (themeModeState.value) {
                ThemeMode.SYSTEM -> isSystemDark
                ThemeMode.DARK -> true
                ThemeMode.LIGHT -> false
            }

            CompositionLocalProvider(LocalThemeMode provides themeModeState) {
                NorthveilTheme(darkTheme = isDark) {
                    NorthveilNavigation(isVaultConfigured = isVaultConfigured)
                }
            }
        }
    }
}
