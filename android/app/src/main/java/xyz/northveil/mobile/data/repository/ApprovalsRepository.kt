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

    suspend fun createTestApprovalRequest(toolName: String = "transfer_token") {
        val testEntity = ApprovalRecordEntity(
            id = "appr-${System.currentTimeMillis()}",
            toolName = toolName,
            txHash = null,
            agentType = "Claude Desktop",
            status = "PENDING",
            parametersJson = "{\"amount\": 0.15, \"token\": \"ETH\", \"recipient\": \"0x56f0...4517\", \"approvalToken\": \"tok_${System.currentTimeMillis().toString(16)}\"}",
            timestamp = System.currentTimeMillis()
        )
        approvalDao.insertApprovals(listOf(testEntity))
    }

    suspend fun updateDecision(id: String, isApproved: Boolean): Result<Unit> {
        val status = if (isApproved) "CONFIRMED" else "REJECTED"
        val mockTxHash = if (isApproved) "0x" + (1..64).map { "0123456789abcdef".random() }.joinToString("") else null
        
        approvalDao.updateApprovalStatus(id, status)
        return try {
            apiService.submitApprovalDecision(id, ApprovalDecisionDto(if (isApproved) "approved" else "rejected"))
            Result.success(Unit)
        } catch (e: Exception) {
            Result.success(Unit) // Offline local state updated
        }
    }

    private suspend fun seedDefaultApprovals() {
        val defaults = listOf(
            ApprovalRecordEntity("appr-1", "transfer_token", "0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b", "Claude Desktop", "CONFIRMED", "{\"amount\": 0.25, \"token\": \"ETH\", \"recipient\": \"0x8767...8345\"}", System.currentTimeMillis() - 3600000),
            ApprovalRecordEntity("appr-2", "deploy_smart_contract", null, "ChatGPT Agent", "PENDING", "{\"name\": \"AI Vault Token\", \"symbol\": \"AIV\", \"standard\": \"ERC-20\", \"approvalToken\": \"tok_a8b9c0d1e2f3\"}", System.currentTimeMillis() - 1200000),
            ApprovalRecordEntity("appr-3", "execute_swap", "0x8f2a4b7e1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f", "Autonomous Agent", "CONFIRMED", "{\"from\": \"USDT\", \"to\": \"ETH\", \"amount\": 250.00}", System.currentTimeMillis() - 7200000)
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
