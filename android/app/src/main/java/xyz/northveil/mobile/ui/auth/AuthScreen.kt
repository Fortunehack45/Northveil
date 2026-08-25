package xyz.northveil.mobile.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.NorthveilBranding
import xyz.northveil.mobile.core.designsystem.theme.*

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val colorScheme = MaterialTheme.colorScheme
    var password by remember { mutableStateOf("") }

    LaunchedEffect(state.isComplete) {
        if (state.isComplete) {
            onAuthSuccess()
        }
    }

    LaunchedEffect(Unit) {
        viewModel.generateNewSeed()
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
            text = "Welcome to Northveil",
            color = colorScheme.onBackground,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Non-Custodial MPC Vault & Autonomous Agent Hub",
            color = colorScheme.onSurfaceVariant,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 6.dp, bottom = 28.dp)
        )

        // Seed Display Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(colorScheme.surface)
                .border(1.dp, colorScheme.outline, RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "HARDWARE VAULT RECOVERY PHRASE",
                    color = colorScheme.onSurface,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = state.generatedSeed,
                    color = colorScheme.onSurface,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    lineHeight = 18.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Set Vault Password") },
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

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (password.length >= 6) {
                    viewModel.createVault(password)
                }
            },
            enabled = password.length >= 6 && !state.isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = colorScheme.onBackground,
                contentColor = colorScheme.background
            ),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            Text(
                text = if (state.isLoading) "Configuring Enclave..." else "Initialize Vault",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
