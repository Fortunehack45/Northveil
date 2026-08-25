package xyz.northveil.mobile.core.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sub_wallets")
data class SubWalletEntity(
    @PrimaryKey val id: String,
    val name: String,
    val address: String,
    val derivationPath: String,
    val isActive: Boolean,
    val createdAt: String?
)

@Entity(tableName = "token_holdings")
data class TokenHoldingEntity(
    @PrimaryKey val id: String,
    val walletAddress: String,
    val symbol: String,
    val name: String,
    val chain: String,
    val balance: Double,
    val priceUsd: Double,
    val change24h: Double,
    val iconUrl: String,
    val contractAddress: String?
)

@Entity(tableName = "transaction_records")
data class TransactionRecordEntity(
    @PrimaryKey val id: String,
    val hash: String,
    val type: String,
    val status: String,
    val amount: String,
    val tokenSymbol: String,
    val timestamp: Long,
    val fromAddress: String,
    val toAddress: String
)

@Entity(tableName = "mcp_agents")
data class McpAgentEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String,
    val status: String,
    val spendingLimitUsd: Double,
    val expiresInMinutes: Int,
    val createdAt: Long
)

@Entity(tableName = "approval_records")
data class ApprovalRecordEntity(
    @PrimaryKey val id: String,
    val toolName: String,
    val txHash: String?,
    val agentType: String,
    val status: String,
    val parametersJson: String,
    val timestamp: Long
)
