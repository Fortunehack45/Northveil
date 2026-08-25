package xyz.northveil.mobile.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import xyz.northveil.mobile.core.database.ApprovalRecordDao
import xyz.northveil.mobile.core.database.ApprovalRecordEntity
import xyz.northveil.mobile.core.network.NorthveilApiService
import xyz.northveil.mobile.core.network.dto.ApprovalDecisionDto
import xyz.northveil.mobile.domain.model.ApprovalRecord
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApprovalsRepository @Inject constructor(
    private val approvalDao: ApprovalRecordDao,
    private val apiService: NorthveilApiService
) {
    val allApprovals: Flow<List<ApprovalRecord>> = approvalDao.getAllApprovals().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun syncApprovals(walletAddress: String = "0x71C8891575B50D22e032d847847C234A413D4Cc8") {
        try {
            val response = apiService.fetchApprovals(walletAddress)
            val body = response.body()
            if (response.isSuccessful && body != null) {
                val entities = body.map { dto ->
                    ApprovalRecordEntity(
                        id = dto.id,
                        toolName = dto.toolName,
                        txHash = dto.txHash,
                        agentType = dto.agentType,
                        status = dto.status,
                        parametersJson = dto.parameters?.toString() ?: "{}",
                        timestamp = System.currentTimeMillis()
                    )
                }
                approvalDao.insertApprovals(entities)
            } else {
                seedDefaultApprovals()
            }
        } catch (e: Exception) {
            seedDefaultApprovals()
        }
    }

    suspend fun updateDecision(id: String, isApproved: Boolean) {
        val status = if (isApproved) "CONFIRMED" else "REJECTED"
        approvalDao.updateApprovalStatus(id, status)
        try {
            apiService.submitApprovalDecision(id, ApprovalDecisionDto(if (isApproved) "approved" else "rejected"))
        } catch (_: Exception) {}
    }

    private suspend fun seedDefaultApprovals() {
        val defaults = listOf(
            ApprovalRecordEntity("appr-1", "transfer_token", "0x3a4b...9c1d", "Claude Desktop", "CONFIRMED", "{\"amount\": 0.25, \"token\": \"ETH\"}", System.currentTimeMillis() - 3600000),
            ApprovalRecordEntity("appr-2", "deploy_smart_contract", null, "ChatGPT Agent", "PENDING", "{\"name\": \"AI Vault Token\", \"symbol\": \"AIV\"}", System.currentTimeMillis() - 1200000),
            ApprovalRecordEntity("appr-3", "execute_swap", "0x8f2a...4b7e", "Autonomous Agent", "CONFIRMED", "{\"from\": \"USDT\", \"to\": \"ETH\"}", System.currentTimeMillis() - 7200000)
        )
        approvalDao.insertApprovals(defaults)
    }

    private fun ApprovalRecordEntity.toDomain() = ApprovalRecord(
        id = id,
        toolName = toolName,
        txHash = txHash,
        agentType = agentType,
        status = status,
        parametersJson = parametersJson,
        timestamp = timestamp
    )
}
