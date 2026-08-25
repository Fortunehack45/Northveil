package xyz.northveil.mobile.ui.lock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import xyz.northveil.mobile.core.designsystem.NorthveilBranding
import xyz.northveil.mobile.core.designsystem.theme.*

@Composable
fun LockScreen(
    viewModel: LockViewModel,
    onUnlocked: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val colorScheme = MaterialTheme.colorScheme
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
            .background(colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        coil.compose.AsyncImage(
            model = NorthveilBranding.WALLET_LOGO_URL,
            contentDescription = "Northveil Wallet Logo",
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(16.dp))
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Northveil Vault Locked",
            color = colorScheme.onBackground,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Authenticate with biometric passkey or vault password",
            color = colorScheme.onSurfaceVariant,
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
                focusedBorderColor = colorScheme.onBackground,
                unfocusedBorderColor = colorScheme.outline,
                focusedTextColor = colorScheme.onSurface,
                unfocusedTextColor = colorScheme.onSurface,
                focusedLabelColor = colorScheme.onSurface,
                unfocusedLabelColor = colorScheme.onSurfaceVariant
            )
        )

        state.error?.let {
            Text(
                text = it,
                color = StatusRed,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { viewModel.unlockWithPassword(password) },
            colors = ButtonDefaults.buttonColors(
                containerColor = colorScheme.onBackground,
                contentColor = colorScheme.background
            ),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            Text(text = "Unlock Vault", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(20.dp))

        IconButton(
            onClick = {
                (context as? FragmentActivity)?.let { activity ->
                    viewModel.triggerBiometricUnlock(activity)
                }
            },
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(colorScheme.surfaceVariant)
        ) {
            Icon(
                Icons.Default.Fingerprint,
                contentDescription = "Biometric Unlock",
                tint = colorScheme.onSurface,
                modifier = Modifier.size(32.dp)
            )
        }
    }
}
