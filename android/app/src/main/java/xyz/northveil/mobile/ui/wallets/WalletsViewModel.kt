package xyz.northveil.mobile.ui.wallets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.data.repository.WalletRepository
import xyz.northveil.mobile.domain.model.SubWallet
import javax.inject.Inject

data class WalletsUiState(
    val activeWallet: SubWallet? = null,
    val subWallets: List<SubWallet> = emptyList(),
    val isCreatingAccount: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class WalletsViewModel @Inject constructor(
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WalletsUiState())
    val uiState: StateFlow<WalletsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            walletRepository.activeSubWallet.collect { active ->
                _uiState.update { it.copy(activeWallet = active) }
            }
        }
        viewModelScope.launch {
            walletRepository.allSubWallets.collect { list ->
                _uiState.update { it.copy(subWallets = list) }
            }
        }
    }

    fun switchActiveAccount(walletId: String) {
        viewModelScope.launch {
            walletRepository.setActiveSubWallet(walletId)
        }
    }

    fun createNewAccount(name: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isCreatingAccount = true, error = null) }
            val result = walletRepository.createSubAccount(name)
            _uiState.update { it.copy(isCreatingAccount = false, error = result.exceptionOrNull()?.message) }
        }
    }
}
