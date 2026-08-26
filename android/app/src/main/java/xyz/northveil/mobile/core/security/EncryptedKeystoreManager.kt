package xyz.northveil.mobile.core.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * EncryptedKeystoreManager manages local application-lock security (passphrase hashes and session state).
 *
 * ZERO PRIVATE KEY OR SEED PHRASE MATERIAL IS EVER STORED LOCALLY.
 * Under Northveil's Non-Custodial MPC architecture, private keys are generated and fragmented
 * inside hardware-isolated TEE enclaves (Turnkey MPC), signed via WebAuthn/Passkey quorums.
 */
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

    fun setVaultConfigured(configured: Boolean) {
        sharedPreferences.edit().putBoolean(KEY_VAULT_INITIALIZED, configured).apply()
    }

    fun isVaultConfigured(): Boolean {
        return sharedPreferences.getBoolean(KEY_VAULT_INITIALIZED, false)
    }

    fun saveMasterPasswordHash(hash: String) {
        sharedPreferences.edit().putString(KEY_MASTER_PASSWORD_HASH, hash).apply()
    }

    fun getMasterPasswordHash(): String? {
        return sharedPreferences.getString(KEY_MASTER_PASSWORD_HASH, null)
    }

    fun saveSessionToken(token: String) {
        sharedPreferences.edit().putString(KEY_SESSION_TOKEN, token).apply()
    }

    fun getSessionToken(): String? {
        return sharedPreferences.getString(KEY_SESSION_TOKEN, null)
    }

    fun clearVault() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_VAULT_INITIALIZED = "pref_key_vault_initialized"
        private const val KEY_MASTER_PASSWORD_HASH = "pref_key_master_password_hash"
        private const val KEY_SESSION_TOKEN = "pref_key_session_token"
    }
}
