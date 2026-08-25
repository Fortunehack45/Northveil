package xyz.northveil.mobile.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SendBottomSheet(
    onDismiss: () -> Unit,
    onLaunchQrScanner: () -> Unit,
    onConfirmSend: (recipient: String, amount: Double, token: String) -> Unit
) {
    var recipientAddress by remember { mutableStateOf("") }
    var sendAmount by remember { mutableStateOf("") }
    var selectedToken by remember { mutableStateOf("ETH") }
    val colorScheme = MaterialTheme.colorScheme

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = colorScheme.surface,
        tonalElevation = 16.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Send Cryptocurrency",
                    color = colorScheme.onSurface,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = colorScheme.onSurfaceVariant
                    )
                }
            }

            OutlinedTextField(
                value = recipientAddress,
                onValueChange = { recipientAddress = it },
                label = { Text("Recipient Address") },
                trailingIcon = {
                    IconButton(onClick = onLaunchQrScanner) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = "Scan QR",
                            tint = colorScheme.onSurface
                        )
                    }
                },
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

            OutlinedTextField(
                value = sendAmount,
                onValueChange = { sendAmount = it },
                label = { Text("Amount ($selectedToken)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
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

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(colorScheme.surfaceVariant)
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Estimated Gas",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "~0.0004 ETH (~$1.20)",
                        color = colorScheme.onSurface,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Button(
                onClick = {
                    val amountVal = sendAmount.toDoubleOrNull() ?: 0.0
                    if (recipientAddress.isNotBlank() && amountVal > 0) {
                        onConfirmSend(recipientAddress, amountVal, selectedToken)
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = colorScheme.onBackground,
                    contentColor = colorScheme.background
                ),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                Text(text = "Review & Send", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
