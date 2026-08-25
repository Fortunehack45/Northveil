package xyz.northveil.mobile.ui.approvals

import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.core.biometrics.BiometricPromptManager
import xyz.northveil.mobile.data.repository.ApprovalsRepository
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
    val errorMessage: String? = null
)

@HiltViewModel
class ApprovalsViewModel @Inject constructor(
    private val approvalsRepository: ApprovalsRepository,
    private val biometricPromptManager: BiometricPromptManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ApprovalsUiState())
    val uiState: StateFlow<ApprovalsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            approvalsRepository.syncApprovals()
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
            // Fallback direct execution if biometric hardware unavailable on test device
            viewModelScope.launch {
                approvalsRepository.updateDecision(record.id, true)
                _uiState.update { it.copy(actionProcessingId = null) }
                onSuccess()
            }
            return
        }

        biometricPromptManager.authenticate(
            activity = activity,
            title = "Authorize Non-Custodial Action",
            subtitle = "Biometric Passkey for ${record.toolName}",
            onSuccess = { _ ->
                viewModelScope.launch {
                    approvalsRepository.updateDecision(record.id, true)
                    _uiState.update { it.copy(actionProcessingId = null) }
                    onSuccess()
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
            approvalsRepository.updateDecision(recordId, false)
            _uiState.update { it.copy(actionProcessingId = null) }
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
            approvalsRepository.syncApprovals()
            _uiState.update { it.copy(isRefreshing = false) }
        }
    }

    fun submitDecision(recordId: String, approved: Boolean) {
        _uiState.update { it.copy(actionProcessingId = recordId) }
        viewModelScope.launch {
            approvalsRepository.updateDecision(recordId, approved)
            _uiState.update { it.copy(actionProcessingId = null) }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
