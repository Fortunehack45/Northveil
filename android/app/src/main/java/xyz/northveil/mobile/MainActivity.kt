package xyz.northveil.mobile

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.fragment.app.FragmentActivity
import dagger.hilt.android.AndroidEntryPoint
import xyz.northveil.mobile.core.designsystem.theme.NorthveilTheme
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
            NorthveilTheme {
                NorthveilNavigation(isVaultConfigured = isVaultConfigured)
            }
        }
    }
}
