package xyz.northveil.mobile.ui.approvals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.data.repository.ApprovalsRepository
import xyz.northveil.mobile.domain.model.ApprovalRecord
import javax.inject.Inject

enum class ApprovalFilter { ALL, CONFIRMED, PENDING, REJECTED }

data class ApprovalsUiState(
    val approvals: List<ApprovalRecord> = emptyList(),
    val filter: ApprovalFilter = ApprovalFilter.ALL,
    val isRefreshing: Boolean = false
)

@HiltViewModel
class ApprovalsViewModel @Inject constructor(
    private val approvalsRepository: ApprovalsRepository
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

    fun submitDecision(id: String, isApproved: Boolean) {
        viewModelScope.launch {
            approvalsRepository.updateDecision(id, isApproved)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            approvalsRepository.syncApprovals()
            _uiState.update { it.copy(isRefreshing = false) }
        }
    }
}
