package xyz.northveil.mobile.ui.overview

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import xyz.northveil.mobile.data.repository.TokenRepository
import xyz.northveil.mobile.data.repository.WalletRepository
import xyz.northveil.mobile.domain.model.SubWallet
import xyz.northveil.mobile.domain.model.TokenHolding
import javax.inject.Inject

data class OverviewUiState(
    val activeWallet: SubWallet? = null,
    val tokenHoldings: List<TokenHolding> = emptyList(),
    val totalNetWorthUsd: Double = 0.0,
    val isRefreshing: Boolean = false
)

@HiltViewModel
class OverviewViewModel @Inject constructor(
    private val walletRepository: WalletRepository,
    private val tokenRepository: TokenRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OverviewUiState())
    val uiState: StateFlow<OverviewUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            walletRepository.activeSubWallet.collect { active ->
                _uiState.update { it.copy(activeWallet = active) }
                if (active != null) {
                    tokenRepository.fetchLiveBalances(active.address)
                    tokenRepository.getHoldings(active.address).collect { tokens ->
                        val netWorth = tokens.sumOf { it.balance * it.priceUsd }
                        _uiState.update { current ->
                            current.copy(tokenHoldings = tokens, totalNetWorthUsd = netWorth)
                        }
                    }
                }
            }
        }
    }

    fun refreshBalances() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val active = _uiState.value.activeWallet
            if (active != null) {
                tokenRepository.fetchLiveBalances(active.address)
            }
            _uiState.update { it.copy(isRefreshing = false) }
        }
    }
}
