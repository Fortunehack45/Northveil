package xyz.northveil.mobile.core.network.dto

import com.google.gson.annotations.SerializedName

data class CreateWalletRequest(
    val name: String,
    val derivationIndex: Int
)

data class WalletResponse(
    val id: String,
    val address: String,
    val name: String,
    val derivationPath: String
)

data class BalancesDto(
    val totalNetWorthUsd: Double,
    val netWorthChange24hPct: Double,
    val tokens: List<TokenDto>
)

data class TokenDto(
    val id: String,
    val symbol: String,
    val name: String,
    val chain: String,
    val balance: Double,
    @SerializedName("price_usd") val priceUsd: Double,
    @SerializedName("change_24h") val change24h: Double,
    @SerializedName("icon_url") val iconUrl: String,
    @SerializedName("contract_address") val contractAddress: String?
)

data class GasEstimateRequest(
    val chain: String,
    val to: String,
    val value: String
)

data class GasEstimateResponse(
    val estimatedGas: String,
    val gasPriceGwei: String,
    val estimatedFeeUsd: Double
)

data class TransferRequestDto(
    val token: String,
    val amount: Double,
    val recipientAddress: String,
    val chain: String
)

data class TransactionResultDto(
    val success: Boolean,
    val txHash: String,
    val blockNumber: Long?
)

data class ApprovalRecordDto(
    val id: String,
    @SerializedName("tool_name") val toolName: String,
    @SerializedName("tx_hash") val txHash: String?,
    @SerializedName("agent_type") val agentType: String,
    val status: String,
    val parameters: Any?,
    @SerializedName("created_at") val createdAt: String
)

data class ApprovalDecisionDto(
    val status: String // approved, rejected
)
