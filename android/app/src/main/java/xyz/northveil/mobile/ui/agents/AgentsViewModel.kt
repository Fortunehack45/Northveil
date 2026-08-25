package xyz.northveil.mobile.ui.agents

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.data.repository.AgentRepository
import xyz.northveil.mobile.domain.model.McpAgent
import javax.inject.Inject

data class AgentsUiState(
    val connectedAgents: List<McpAgent> = emptyList(),
    val isConnecting: Boolean = false
)

@HiltViewModel
class AgentsViewModel @Inject constructor(
    private val agentRepository: AgentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AgentsUiState())
    val uiState: StateFlow<AgentsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            agentRepository.connectedAgents.collect { list ->
                _uiState.update { it.copy(connectedAgents = list) }
            }
        }
    }

    fun connectAgent(name: String, type: String, spendingLimitUsd: Double, expiresInMinutes: Int) {
        viewModelScope.launch {
            agentRepository.connectAgent(name, type, spendingLimitUsd, expiresInMinutes)
        }
    }

    fun revokeAgentSession(agentId: String) {
        viewModelScope.launch {
            agentRepository.revokeAgent(agentId)
        }
    }
}
