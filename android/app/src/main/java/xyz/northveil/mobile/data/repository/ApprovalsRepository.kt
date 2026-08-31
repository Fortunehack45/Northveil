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

    suspend fun syncApprovals(walletAddress: String) {
        if (walletAddress.isBlank() || !walletAddress.startsWith("0x")) return
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
            }
        } catch (e: Exception) {
            // Non-fatal: Maintain existing Room DB cached records on network error
        }
    }

    suspend fun createTestApprovalRequest(toolName: String = "send_transfer") {
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

    suspend fun updateDecision(id: String, isApproved: Boolean, signedTx: String? = null): Result<Unit> {
        return try {
            val decisionStr = if (isApproved) "approved" else "rejected"
            apiService.submitApprovalDecision(
                id,
                ApprovalDecisionDto(
                    decision = decisionStr,
                    status = decisionStr,
                    signedTransaction = signedTx,
                    reason = if (!isApproved) "Explicitly rejected by user" else null
                )
            )
            val status = if (isApproved) "CONFIRMED" else "REJECTED"
            approvalDao.updateApprovalStatus(id, status)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
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
