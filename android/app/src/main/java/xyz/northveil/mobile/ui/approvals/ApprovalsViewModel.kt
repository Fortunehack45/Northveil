package xyz.northveil.mobile.ui.approvals

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.core.biometrics.BiometricPromptManager
import xyz.northveil.mobile.data.repository.ApprovalsRepository
import xyz.northveil.mobile.data.repository.WalletRepository
import xyz.northveil.mobile.domain.model.ApprovalRecord
import javax.inject.Inject

enum class ApprovalFilter { ALL, CONFIRMED, PENDING, REJECTED }

data class ApprovalsUiState(
    val approvals: List<ApprovalRecord> = emptyList(),
    val filter: ApprovalFilter = ApprovalFilter.ALL,
    val searchQuery: String = "",
    val isRefreshing: Boolean = false,
    val isCreatingTest: Boolean = false,
    val actionProcessingId: String? = null,
    val activeWalletAddress: String = "",
    val errorMessage: String? = null
)

@HiltViewModel
class ApprovalsViewModel @Inject constructor(
    private val approvalsRepository: ApprovalsRepository,
    private val walletRepository: WalletRepository,
    private val biometricPromptManager: BiometricPromptManager,
    private val keystoreManager: EncryptedKeystoreManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ApprovalsUiState())
    val uiState: StateFlow<ApprovalsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            walletRepository.activeSubWallet.collect { active ->
                val addr = active?.address ?: ""
                _uiState.update { it.copy(activeWalletAddress = addr) }
                if (addr.isNotBlank()) {
                    approvalsRepository.syncApprovals(addr)
                }
            }
        }

        viewModelScope.launch {
            approvalsRepository.allApprovals.collect { list ->
                _uiState.update { it.copy(approvals = list) }
            }
        }
    }

    fun setFilter(filter: ApprovalFilter) {
        _uiState.update { it.copy(filter = filter) }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun approveWithBiometricPasskey(
        activity: FragmentActivity,
        record: ApprovalRecord,
        onSuccess: () -> Unit = {},
        onError: (String) -> Unit = {}
    ) {
        _uiState.update { it.copy(actionProcessingId = record.id) }

        if (!biometricPromptManager.isBiometricAvailable(activity)) {
            val errMsg = "Biometric hardware authentication required to approve and sign transactions."
            _uiState.update { it.copy(actionProcessingId = null, errorMessage = errMsg) }
            onError(errMsg)
            return
        }

        biometricPromptManager.authenticate(
            activity = activity,
            title = "Authorize On-Chain Action",
            subtitle = "Biometric Passkey for ${record.toolName}",
            onSuccess = { _ ->
                viewModelScope.launch {
                    val signedTx = keystoreManager.signTransactionPayload(record.parametersJson)
                    val result = approvalsRepository.updateDecision(record.id, true, signedTx)
                    _uiState.update { it.copy(actionProcessingId = null) }
                    result.onSuccess {
                        onSuccess()
                    }.onFailure { err ->
                        val msg = err.message ?: "Failed to broadcast transaction on-chain"
                        _uiState.update { it.copy(errorMessage = msg) }
                        onError(msg)
                    }
                }
            },
            onError = { err ->
                _uiState.update { it.copy(actionProcessingId = null, errorMessage = err) }
                onError(err)
            }
        )
    }

    fun rejectRequest(recordId: String) {
        _uiState.update { it.copy(actionProcessingId = recordId) }
        viewModelScope.launch {
            val result = approvalsRepository.updateDecision(recordId, false)
            _uiState.update { it.copy(actionProcessingId = null) }
            result.onFailure { err ->
                _uiState.update { it.copy(errorMessage = err.message) }
            }
        }
    }

    fun createTestRequest() {
        viewModelScope.launch {
            _uiState.update { it.copy(isCreatingTest = true) }
            approvalsRepository.createTestApprovalRequest()
            _uiState.update { it.copy(isCreatingTest = false) }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val addr = _uiState.value.activeWalletAddress
            if (addr.isNotBlank()) {
                approvalsRepository.syncApprovals(addr)
            }
            _uiState.update { it.copy(isRefreshing = false) }
        }
    }

    fun submitDecision(recordId: String, approved: Boolean, onSuccess: () -> Unit = {}, onError: (String) -> Unit = {}) {
        _uiState.update { it.copy(actionProcessingId = recordId) }
        viewModelScope.launch {
            val signedTx = if (approved) keystoreManager.signTransactionPayload(recordId) else null
            val result = approvalsRepository.updateDecision(recordId, approved, signedTx)
            _uiState.update { it.copy(actionProcessingId = null) }
            result.onSuccess { onSuccess() }.onFailure { err ->
                val msg = err.message ?: "Failed to submit decision"
                _uiState.update { it.copy(errorMessage = msg) }
                onError(msg)
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
