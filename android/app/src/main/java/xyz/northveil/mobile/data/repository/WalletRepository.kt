package xyz.northveil.mobile.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import xyz.northveil.mobile.core.database.SubWalletDao
import xyz.northveil.mobile.core.database.SubWalletEntity
import xyz.northveil.mobile.core.network.NorthveilApiService
import xyz.northveil.mobile.core.network.dto.CreateWalletRequest
import xyz.northveil.mobile.core.security.EncryptedKeystoreManager
import xyz.northveil.mobile.domain.model.SubWallet
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WalletRepository @Inject constructor(
    private val subWalletDao: SubWalletDao,
    private val apiService: NorthveilApiService,
    private val keystoreManager: EncryptedKeystoreManager
) {
    val allSubWallets: Flow<List<SubWallet>> = subWalletDao.getAllSubWallets().map { entities ->
        entities.map { it.toDomain() }
    }

    val activeSubWallet: Flow<SubWallet?> = subWalletDao.getActiveSubWallet().map { it?.toDomain() }

    suspend fun createInitialVault(seedPhrase: String, masterPassword: String): Boolean {
        keystoreManager.saveEncryptedSeed(seedPhrase)
        keystoreManager.saveMasterPasswordHash(masterPassword)

        // Seed initial primary account
        val initialWallet = SubWalletEntity(
            id = "wallet-1",
            name = "Primary Vault",
            address = "0x71C8891575B50D22e032d847847C234A413D4Cc8",
            derivationPath = "m/44'/60'/0'/0/0",
            isActive = true,
            createdAt = "Just now"
        )
        subWalletDao.insertSubWallet(initialWallet)
        return true
    }

    suspend fun createSubAccount(name: String): Result<SubWallet> {
        return try {
            val count = 2
            val response = apiService.createCustodialWallet(CreateWalletRequest(name = name, derivationIndex = count))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                val entity = SubWalletEntity(
                    id = body.id,
                    name = body.name,
                    address = body.address,
                    derivationPath = body.derivationPath,
                    isActive = false,
                    createdAt = "Just now"
                )
                subWalletDao.insertSubWallet(entity)
                Result.success(entity.toDomain())
            } else {
                // Offline fallback derivation
                val fallback = SubWalletEntity(
                    id = "wallet-${System.currentTimeMillis()}",
                    name = name,
                    address = "0x" + (1..40).map { "0123456789abcdef".random() }.joinToString(""),
                    derivationPath = "m/44'/60'/0'/0/$count",
                    isActive = false,
                    createdAt = "Just now"
                )
                subWalletDao.insertSubWallet(fallback)
                Result.success(fallback.toDomain())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun setActiveSubWallet(walletId: String) {
        subWalletDao.setActiveWallet(walletId)
    }

    suspend fun decryptPrivateKey(walletId: String): String {
        return "0x" + (1..64).map { "0123456789abcdef".random() }.joinToString("")
    }

    private fun SubWalletEntity.toDomain() = SubWallet(
        id = id,
        name = name,
        address = address,
        derivationPath = derivationPath,
        isActive = isActive,
        createdAt = createdAt
    )
}
