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
    val confirmPassword: String = "",
    val generatedSeed: String = "",
    val importSeedInput: String = "",
    val error: String? = null,
    val isComplete: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun generateNewSeed() {
        val wordList = listOf("abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident")
        _uiState.update { it.copy(generatedSeed = wordList.shuffled().joinToString(" ")) }
    }

    fun createVault(password: String) {
        viewModelScope.launch {
            if (password.length < 6) {
                _uiState.update { it.copy(error = "Password must be at least 6 characters") }
                return@launch
            }
            _uiState.update { it.copy(isLoading = true, isCreating = true, error = null) }
            try {
                walletRepository.createInitialVault(
                    seedPhrase = _uiState.value.generatedSeed.ifBlank { "test seed phrase northveil multi chain custodial vault sample" },
                    masterPassword = password
                )
                _uiState.update { it.copy(isLoading = false, isCreating = false, isComplete = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, isCreating = false, error = e.message ?: "Failed to create vault") }
            }
        }
    }

    fun completeCreation(password: String) {
        createVault(password)
    }
}
