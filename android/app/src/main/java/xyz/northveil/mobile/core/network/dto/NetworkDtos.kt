package xyz.northveil.mobile.core.network.dto

import com.google.gson.annotations.SerializedName

data class CreateWalletRequest(
    @SerializedName("walletName") val walletName: String,
    @SerializedName("userId") val userId: String? = "mobile_user",
    @SerializedName("chain") val chain: String? = "ethereum"
)

data class WalletResponse(
    @SerializedName("address") val address: String,
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("walletName") val walletName: String? = null,
    @SerializedName("mpcProvider") val mpcProvider: String? = "turnkey",
    @SerializedName("mpcWalletId") val mpcWalletId: String? = null,
    @SerializedName("mpcSubOrgId") val mpcSubOrgId: String? = null,
    @SerializedName("keyType") val keyType: String? = null,
    @SerializedName("derivationPath") val derivationPath: String? = null,
    @SerializedName("success") val success: Boolean? = true
)

data class BalancesDto(
    @SerializedName("totalNetWorthUsd") val totalNetWorthUsd: Double,
    @SerializedName("netWorthChange24hPct") val netWorthChange24hPct: Double,
    @SerializedName("tokens") val tokens: List<TokenDto>
)

data class TokenDto(
    @SerializedName("id") val id: String,
    @SerializedName("symbol") val symbol: String,
    @SerializedName("name") val name: String,
    @SerializedName("chain") val chain: String,
    @SerializedName("balance") val balance: Double,
    @SerializedName("price_usd") val priceUsd: Double,
    @SerializedName("change_24h") val change24h: Double,
    @SerializedName("icon_url") val iconUrl: String,
    @SerializedName("contract_address") val contractAddress: String?
)

data class GasEstimateRequest(
    @SerializedName("chain") val chain: String,
    @SerializedName("to") val to: String,
    @SerializedName("value") val value: String
)

data class GasEstimateResponse(
    @SerializedName("estimatedGas") val estimatedGas: String,
    @SerializedName("gasPriceGwei") val gasPriceGwei: String,
    @SerializedName("estimatedFeeUsd") val estimatedFeeUsd: Double
)

data class TransferRequestDto(
    @SerializedName("token") val token: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("recipientAddress") val recipientAddress: String,
    @SerializedName("chain") val chain: String,
    @SerializedName("fromAddress") val fromAddress: String? = null
)

data class TransactionResultDto(
    @SerializedName("success") val success: Boolean,
    @SerializedName("txHash") val txHash: String,
    @SerializedName("blockNumber") val blockNumber: Long?
)

data class ApprovalRecordDto(
    @SerializedName("id") val id: String,
    @SerializedName("tool_name") val toolName: String,
    @SerializedName("tx_hash") val txHash: String?,
    @SerializedName("agent_type") val agentType: String,
    @SerializedName("status") val status: String,
    @SerializedName("parameters") val parameters: Any?,
    @SerializedName("created_at") val createdAt: String
)

data class ApprovalDecisionDto(
    @SerializedName("status") val status: String, // approved, rejected
    @SerializedName("approvalToken") val approvalToken: String? = null,
    @SerializedName("passkeySignature") val passkeySignature: String? = null
)
