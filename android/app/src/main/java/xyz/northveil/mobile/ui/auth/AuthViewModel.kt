package xyz.northveil.mobile.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import xyz.northveil.mobile.data.repository.WalletRepository
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isCreating: Boolean = false,
    val masterPassword: String = "",
    val error: String? = null,
    val isComplete: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun createVault(password: String) {
        viewModelScope.launch {
            if (password.length < 6) {
                _uiState.update { it.copy(error = "Password must be at least 6 characters") }
                return@launch
            }
            _uiState.update { it.copy(isLoading = true, isCreating = true, error = null) }
            val result = walletRepository.createInitialVault(
                name = "Primary MPC Vault",
                masterPassword = password
            )
            if (result.isSuccess) {
                _uiState.update { it.copy(isLoading = false, isCreating = false, isComplete = true) }
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        isCreating = false,
                        error = result.exceptionOrNull()?.message ?: "Failed to provision MPC Vault"
                    )
                }
            }
        }
    }

    fun completeCreation(password: String) {
        createVault(password)
    }
}
