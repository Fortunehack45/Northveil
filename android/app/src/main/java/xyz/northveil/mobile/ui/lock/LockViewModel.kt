package xyz.northveil.mobile.ui.lock

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import xyz.northveil.mobile.core.biometrics.BiometricPromptManager
import xyz.northveil.mobile.core.security.EncryptedKeystoreManager
import javax.inject.Inject

data class LockUiState(
    val passwordInput: String = "",
    val error: String? = null,
    val isUnlocked: Boolean = false
)

@HiltViewModel
class LockViewModel @Inject constructor(
    private val keystoreManager: EncryptedKeystoreManager,
    private val biometricManager: BiometricPromptManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(LockUiState())
    val uiState: StateFlow<LockUiState> = _uiState.asStateFlow()

    fun unlockWithPassword(password: String) {
        val savedHash = keystoreManager.getMasterPasswordHash()
        if (savedHash == null || password == savedHash) {
            _uiState.update { it.copy(isUnlocked = true) }
        } else {
            _uiState.update { it.copy(error = "Incorrect password") }
        }
    }

    fun triggerBiometricUnlock(activity: FragmentActivity) {
        if (!biometricManager.isBiometricAvailable(activity)) return

        biometricManager.authenticate(
            activity = activity,
            title = "Unlock Northveil Vault",
            subtitle = "Biometric credential verification",
            onSuccess = {
                _uiState.update { it.copy(isUnlocked = true) }
            },
            onError = { err ->
                _uiState.update { it.copy(error = err) }
            }
        )
    }
}
