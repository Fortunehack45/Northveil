package xyz.northveil.mobile.core.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EncryptedKeystoreManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey: MasterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "encrypted_vault_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveEncryptedSeed(seed: String) {
        sharedPreferences.edit().putString(KEY_ENCRYPTED_SEED, seed).apply()
    }

    fun getEncryptedSeed(): String? {
        return sharedPreferences.getString(KEY_ENCRYPTED_SEED, null)
    }

    fun saveMasterPasswordHash(hash: String) {
        sharedPreferences.edit().putString(KEY_MASTER_PASSWORD_HASH, hash).apply()
    }

    fun getMasterPasswordHash(): String? {
        return sharedPreferences.getString(KEY_MASTER_PASSWORD_HASH, null)
    }

    fun isVaultConfigured(): Boolean {
        return getEncryptedSeed() != null
    }

    fun clearVault() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_ENCRYPTED_SEED = "pref_key_encrypted_seed"
        private const val KEY_MASTER_PASSWORD_HASH = "pref_key_master_password_hash"
    }
}
