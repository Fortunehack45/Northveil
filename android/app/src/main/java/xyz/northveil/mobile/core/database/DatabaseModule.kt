package xyz.northveil.mobile.core.database

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): NorthveilDatabase {
        return Room.databaseBuilder(
            context,
            NorthveilDatabase::class.java,
            "northveil_vault.db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideSubWalletDao(db: NorthveilDatabase): SubWalletDao = db.subWalletDao()

    @Provides
    fun provideTokenHoldingDao(db: NorthveilDatabase): TokenHoldingDao = db.tokenHoldingDao()

    @Provides
    fun provideTransactionRecordDao(db: NorthveilDatabase): TransactionRecordDao = db.transactionRecordDao()

    @Provides
    fun provideMcpAgentDao(db: NorthveilDatabase): McpAgentDao = db.mcpAgentDao()

    @Provides
    fun provideApprovalRecordDao(db: NorthveilDatabase): ApprovalRecordDao = db.approvalRecordDao()
}
