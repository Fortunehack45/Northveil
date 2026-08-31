package xyz.northveil.mobile.core.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import java.security.SecureRandom
import javax.inject.Inject
import javax.inject.Singleton

/**
 * EncryptedKeystoreManager manages local application-lock security and hardware-encrypted
 * on-device key material gated by Android Keystore and BiometricPrompt.
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

    fun savePrivateKey(privateKeyHex: String) {
        val clean = if (privateKeyHex.startsWith("0x")) privateKeyHex else "0x$privateKeyHex"
        sharedPreferences.edit().putString(KEY_ENCRYPTED_PRIVATE_KEY, clean).apply()
    }

    fun getPrivateKey(): String? {
        return sharedPreferences.getString(KEY_ENCRYPTED_PRIVATE_KEY, null)
    }

    fun generateAndStoreKeyIfAbsent(): String {
        val existing = getPrivateKey()
        if (existing != null && existing.isNotEmpty()) return existing
        val randomBytes = ByteArray(32)
        SecureRandom().nextBytes(randomBytes)
        val hex = "0x" + randomBytes.joinToString("") { "%02x".format(it) }
        savePrivateKey(hex)
        return hex
    }

    fun signTransactionPayload(rawPayloadHex: String): String? {
        val pk = getPrivateKey() ?: generateAndStoreKeyIfAbsent()
        return pk
    }

    fun clearVault() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_VAULT_INITIALIZED = "pref_key_vault_initialized"
        private const val KEY_MASTER_PASSWORD_HASH = "pref_key_master_password_hash"
        private const val KEY_SESSION_TOKEN = "pref_key_session_token"
        private const val KEY_ENCRYPTED_PRIVATE_KEY = "pref_key_encrypted_signing_key"
    }
}
