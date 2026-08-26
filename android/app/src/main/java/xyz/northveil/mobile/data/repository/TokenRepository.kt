package xyz.northveil.mobile.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import xyz.northveil.mobile.core.database.TokenHoldingDao
import xyz.northveil.mobile.core.database.TokenHoldingEntity
import xyz.northveil.mobile.core.network.NorthveilApiService
import xyz.northveil.mobile.domain.model.TokenHolding
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenRepository @Inject constructor(
    private val tokenHoldingDao: TokenHoldingDao,
    private val apiService: NorthveilApiService
) {
    fun getHoldings(walletAddress: String): Flow<List<TokenHolding>> =
        tokenHoldingDao.getHoldingsForWallet(walletAddress).map { list ->
            list.map { it.toDomain() }
        }

    suspend fun fetchLiveBalances(walletAddress: String) {
        if (walletAddress.isBlank() || !walletAddress.startsWith("0x")) return
        try {
            val response = apiService.getMultiChainBalances(walletAddress)
            val body = response.body()
            if (response.isSuccessful && body != null && body.tokens.isNotEmpty()) {
                val entities = body.tokens.map { dto ->
                    TokenHoldingEntity(
                        id = dto.id,
                        walletAddress = walletAddress,
                        symbol = dto.symbol,
                        name = dto.name,
                        chain = dto.chain,
                        balance = dto.balance,
                        priceUsd = dto.priceUsd,
                        change24h = dto.change24h,
                        iconUrl = dto.iconUrl,
                        contractAddress = dto.contractAddress
                    )
                }
                tokenHoldingDao.clearHoldingsForWallet(walletAddress)
                tokenHoldingDao.insertHoldings(entities)
            }
        } catch (e: Exception) {
            // Non-fatal: Maintain existing Room DB cached records on network error
        }
    }

    private fun TokenHoldingEntity.toDomain() = TokenHolding(
        id = id,
        symbol = symbol,
        name = name,
        chain = chain,
        balance = balance,
        priceUsd = priceUsd,
        change24h = change24h,
        iconUrl = iconUrl,
        contractAddress = contractAddress
    )
}
