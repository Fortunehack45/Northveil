package xyz.northveil.mobile.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import xyz.northveil.mobile.core.security.EncryptedKeystoreManager
import xyz.northveil.mobile.data.repository.WalletRepository
import xyz.northveil.mobile.domain.model.SubWallet
import javax.inject.Inject

data class ProfileUiState(
    val activeWallet: SubWallet? = null,
    val isBiometricsEnabled: Boolean = true,
    val autoLockTimeoutMinutes: Int = 5
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val walletRepository: WalletRepository,
    private val keystoreManager: EncryptedKeystoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            walletRepository.activeSubWallet.collect { active ->
                _uiState.update { it.copy(activeWallet = active) }
            }
        }
    }

    fun wipeVault() {
        keystoreManager.clearVault()
    }
}
