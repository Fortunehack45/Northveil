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
import xyz.northveil.mobile.core.designsystem.theme.*

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    onAuthSuccess: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
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
            text = "Welcome to Northveil",
            color = TextPrimary,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Native Multi-Chain Custodial Vault & AI Agent Hub",
            color = TextSecondary,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 6.dp, bottom = 28.dp)
        )

        // Seed Display Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(CardSurfaceDark)
                .border(1.dp, CardSurfaceBorderDark, RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = "GENERATED RECOVERY PHRASE", color = BrandAccentYellow, fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                Text(text = state.generatedSeed, color = TextPrimary, fontSize = 12.sp, fontFamily = FontFamily.Monospace, lineHeight = 18.sp)
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
                focusedBorderColor = Color.White,
                unfocusedBorderColor = CardSurfaceBorderDark,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            )
        )

        state.error?.let {
            Text(text = it, color = StatusRed, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { viewModel.completeCreation(password) },
            enabled = password.isNotBlank(),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
        ) {
            Text(text = "Create Encrypted Vault", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
    }
}
