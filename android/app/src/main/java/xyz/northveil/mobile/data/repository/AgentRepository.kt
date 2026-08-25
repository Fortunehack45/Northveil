package xyz.northveil.mobile.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import xyz.northveil.mobile.core.database.McpAgentDao
import xyz.northveil.mobile.core.database.McpAgentEntity
import xyz.northveil.mobile.domain.model.McpAgent
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AgentRepository @Inject constructor(
    private val mcpAgentDao: McpAgentDao
) {
    val connectedAgents: Flow<List<McpAgent>> = mcpAgentDao.getAllAgents().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun connectAgent(name: String, type: String, spendingLimitUsd: Double, expiresInMinutes: Int) {
        val entity = McpAgentEntity(
            id = "agent-${System.currentTimeMillis()}",
            name = name,
            type = type,
            status = "active",
            spendingLimitUsd = spendingLimitUsd,
            expiresInMinutes = expiresInMinutes,
            createdAt = System.currentTimeMillis()
        )
        mcpAgentDao.insertAgent(entity)
    }

    suspend fun revokeAgent(agentId: String) {
        mcpAgentDao.revokeAgent(agentId)
    }

    private fun McpAgentEntity.toDomain() = McpAgent(
        id = id,
        name = name,
        type = type,
        status = status,
        spendingLimitUsd = spendingLimitUsd,
        expiresInMinutes = expiresInMinutes,
        createdAt = createdAt
    )
}
