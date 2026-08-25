package xyz.northveil.mobile.core.database

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [
        SubWalletEntity::class,
        TokenHoldingEntity::class,
        TransactionRecordEntity::class,
        McpAgentEntity::class,
        ApprovalRecordEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class NorthveilDatabase : RoomDatabase() {
    abstract fun subWalletDao(): SubWalletDao
    abstract fun tokenHoldingDao(): TokenHoldingDao
    abstract fun transactionRecordDao(): TransactionRecordDao
    abstract fun mcpAgentDao(): McpAgentDao
    abstract fun approvalRecordDao(): ApprovalRecordDao
}
