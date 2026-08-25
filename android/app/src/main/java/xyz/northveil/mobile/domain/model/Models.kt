package xyz.northveil.mobile.domain.model

data class SubWallet(
    val id: String,
    val name: String,
    val address: String,
    val derivationPath: String,
    val isActive: Boolean,
    val createdAt: String? = null
)

data class TokenHolding(
    val id: String,
    val symbol: String,
    val name: String,
    val chain: String,
    val balance: Double,
    val priceUsd: Double,
    val change24h: Double,
    val iconUrl: String,
    val contractAddress: String? = null
)

data class TransactionRecord(
    val id: String,
    val hash: String,
    val type: String, // SEND, RECEIVE, SWAP, DEPLOY
    val status: String, // CONFIRMED, PENDING, FAILED
    val amount: String,
    val tokenSymbol: String,
    val timestamp: Long,
    val fromAddress: String,
    val toAddress: String
)

data class McpAgent(
    val id: String,
    val name: String,
    val type: String, // claude, chatgpt, custom
    val status: String, // active, revoked
    val spendingLimitUsd: Double,
    val expiresInMinutes: Int,
    val createdAt: Long
)

data class ApprovalRecord(
    val id: String,
    val toolName: String,
    val txHash: String?,
    val agentType: String,
    val status: String, // CONFIRMED, PENDING, REJECTED
    val parametersJson: String,
    val timestamp: Long
)
