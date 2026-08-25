package xyz.northveil.mobile.core.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface SubWalletDao {
    @Query("SELECT * FROM sub_wallets ORDER BY createdAt ASC")
    fun getAllSubWallets(): Flow<List<SubWalletEntity>>

    @Query("SELECT * FROM sub_wallets WHERE isActive = 1 LIMIT 1")
    fun getActiveSubWallet(): Flow<SubWalletEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubWallets(wallets: List<SubWalletEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubWallet(wallet: SubWalletEntity)

    @Query("UPDATE sub_wallets SET isActive = CASE WHEN id = :activeId THEN 1 ELSE 0 END")
    suspend fun setActiveWallet(activeId: String)

    @Query("DELETE FROM sub_wallets WHERE id = :walletId")
    suspend fun deleteSubWallet(walletId: String)
}

@Dao
interface TokenHoldingDao {
    @Query("SELECT * FROM token_holdings WHERE walletAddress = :walletAddress")
    fun getHoldingsForWallet(walletAddress: String): Flow<List<TokenHoldingEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHoldings(holdings: List<TokenHoldingEntity>)

    @Query("DELETE FROM token_holdings WHERE walletAddress = :walletAddress")
    suspend fun clearHoldingsForWallet(walletAddress: String)
}

@Dao
interface TransactionRecordDao {
    @Query("SELECT * FROM transaction_records ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<TransactionRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransactions(transactions: List<TransactionRecordEntity>)
}

@Dao
interface McpAgentDao {
    @Query("SELECT * FROM mcp_agents ORDER BY createdAt DESC")
    fun getAllAgents(): Flow<List<McpAgentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAgent(agent: McpAgentEntity)

    @Query("UPDATE mcp_agents SET status = 'revoked' WHERE id = :agentId")
    suspend fun revokeAgent(agentId: String)
}

@Dao
interface ApprovalRecordDao {
    @Query("SELECT * FROM approval_records ORDER BY timestamp DESC")
    fun getAllApprovals(): Flow<List<ApprovalRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApprovals(approvals: List<ApprovalRecordEntity>)

    @Query("UPDATE approval_records SET status = :newStatus WHERE id = :id")
    suspend fun updateApprovalStatus(id: String, newStatus: String)
}
