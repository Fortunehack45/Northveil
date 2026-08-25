package xyz.northveil.mobile.ui.lock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import xyz.northveil.mobile.core.designsystem.theme.*

@Composable
fun LockScreen(
    viewModel: LockViewModel,
    onUnlocked: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state.isUnlocked) {
        if (state.isUnlocked) {
            onUnlocked()
        }
    }

    LaunchedEffect(Unit) {
        (context as? FragmentActivity)?.let { activity ->
            viewModel.triggerBiometricUnlock(activity)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        coil.compose.AsyncImage(
            model = xyz.northveil.mobile.core.designsystem.NorthveilBranding.WALLET_LOGO_URL,
            contentDescription = "Northveil Wallet Logo",
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(16.dp))
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Northveil Vault Locked",
            color = TextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Authenticate with biometrics or master password",
            color = TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Vault Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.White,
                unfocusedBorderColor = CardSurfaceBorderDark,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            )
        )

        state.error?.let {
            Text(text = it, color = StatusRed, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { viewModel.unlockWithPassword(password) },
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Unlock Vault", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(8.dp))

        IconButton(
            onClick = {
                (context as? FragmentActivity)?.let { activity ->
                    viewModel.triggerBiometricUnlock(activity)
                }
            },
            modifier = Modifier.size(48.dp)
        ) {
            Icon(Icons.Default.Fingerprint, contentDescription = "Biometric Unlock", tint = BrandAccentCyan, modifier = Modifier.size(32.dp))
        }
    }
}
