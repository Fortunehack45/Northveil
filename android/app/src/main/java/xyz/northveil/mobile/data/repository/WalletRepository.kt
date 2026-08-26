package xyz.northveil.mobile.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import xyz.northveil.mobile.core.database.SubWalletDao
import xyz.northveil.mobile.core.database.SubWalletEntity
import xyz.northveil.mobile.core.network.NorthveilApiService
import xyz.northveil.mobile.core.network.dto.CreateWalletRequest
import xyz.northveil.mobile.core.security.EncryptedKeystoreManager
import xyz.northveil.mobile.domain.model.SubWallet
import java.util.UUID
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

    suspend fun createInitialVault(name: String = "Primary Vault", masterPassword: String): Result<SubWallet> {
        return try {
            val response = apiService.createWallet(
                CreateWalletRequest(
                    walletName = name,
                    userId = "mobile_user_${UUID.randomUUID().toString().take(8)}"
                )
            )
            val body = response.body()
            if (response.isSuccessful && body != null && body.address.isNotBlank()) {
                val entity = SubWalletEntity(
                    id = body.id ?: "wallet-${System.currentTimeMillis()}",
                    name = body.name ?: body.walletName ?: name,
                    address = body.address,
                    derivationPath = body.derivationPath ?: "m/44'/60'/0'/0/0",
                    isActive = true,
                    createdAt = "Just now"
                )
                subWalletDao.insertSubWallet(entity)
                keystoreManager.saveMasterPasswordHash(masterPassword)
                keystoreManager.setVaultConfigured(true)
                Result.success(entity.toDomain())
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Failed to provision MPC wallet"
                Result.failure(Exception("MPC_PROVISION_ERROR: $errorMsg"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createSubAccount(name: String): Result<SubWallet> {
        return try {
            val response = apiService.createWallet(
                CreateWalletRequest(
                    walletName = name,
                    userId = "mobile_user_${UUID.randomUUID().toString().take(8)}"
                )
            )
            val body = response.body()
            if (response.isSuccessful && body != null && body.address.isNotBlank()) {
                val entity = SubWalletEntity(
                    id = body.id ?: "wallet-${System.currentTimeMillis()}",
                    name = body.name ?: body.walletName ?: name,
                    address = body.address,
                    derivationPath = body.derivationPath ?: "m/44'/60'/0'/0/1",
                    isActive = false,
                    createdAt = "Just now"
                )
                subWalletDao.insertSubWallet(entity)
                Result.success(entity.toDomain())
            } else {
                val errorMsg = response.errorBody()?.string() ?: "MPC enclave provisioning failed"
                Result.failure(Exception("MPC_SUBACCOUNT_ERROR: $errorMsg"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun setActiveSubWallet(walletId: String) {
        subWalletDao.setActiveWallet(walletId)
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
