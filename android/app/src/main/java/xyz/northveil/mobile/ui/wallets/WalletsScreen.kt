package xyz.northveil.mobile.ui.wallets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import xyz.northveil.mobile.core.designsystem.BlockiesIdenticon
import xyz.northveil.mobile.core.designsystem.theme.*
import xyz.northveil.mobile.domain.model.SubWallet

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletsScreen(
    viewModel: WalletsViewModel,
    onOpenCreateAccount: () -> Unit,
    onOpenImportAccount: () -> Unit,
    onOpenDeposit: (SubWallet) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val clipboardManager = LocalClipboardManager.current
    val colorScheme = MaterialTheme.colorScheme
    var copiedWalletId by remember { mutableStateOf<String?>(null) }
    var selectedWalletForKeyReveal by remember { mutableStateOf<SubWallet?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colorScheme.surfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "MULTI-ACCOUNT VAULT",
                                color = colorScheme.onSurface,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "${state.subWallets.size} Accounts",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Text(
                        text = "Wallets & Accounts",
                        color = colorScheme.onBackground,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = onOpenCreateAccount,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colorScheme.onBackground)
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "New Account",
                            tint = colorScheme.background,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    IconButton(
                        onClick = onOpenImportAccount,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colorScheme.surface)
                            .border(1.dp, colorScheme.outline, CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Upload,
                            contentDescription = "Import",
                            tint = colorScheme.onSurface,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        // Active Wallet Hero Card
        item {
            state.activeWallet?.let { active ->
                ActiveWalletHeroCard(
                    wallet = active,
                    onCopyAddress = {
                        clipboardManager.setText(AnnotatedString(active.address))
                        copiedWalletId = "active"
                    },
                    isCopied = copiedWalletId == "active",
                    onDeposit = { onOpenDeposit(active) },
                    onRevealKey = { selectedWalletForKeyReveal = active }
                )
            }
        }

        // Sub-Accounts List Header
        item {
            Text(
                text = "All Vault Accounts (${state.subWallets.size})",
                color = colorScheme.onBackground,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        itemsIndexed(state.subWallets) { index, wallet ->
            val isActive = wallet.id == state.activeWallet?.id
            SubAccountItemCard(
                index = index + 1,
                wallet = wallet,
                isActive = isActive,
                onSwitch = { viewModel.switchActiveAccount(wallet.id) },
                onCopy = {
                    clipboardManager.setText(AnnotatedString(wallet.address))
                    copiedWalletId = wallet.id
                },
                isCopied = copiedWalletId == wallet.id,
                onDeposit = { onOpenDeposit(wallet) },
                onRevealKey = { selectedWalletForKeyReveal = wallet }
            )
        }
    }

    // Biometric Hold-to-Reveal Key BottomSheet
    selectedWalletForKeyReveal?.let { wallet ->
        HoldToRevealKeyBottomSheet(
            wallet = wallet,
            onDismiss = { selectedWalletForKeyReveal = null },
            viewModel = viewModel
        )
    }
}

@Composable
fun ActiveWalletHeroCard(
    wallet: SubWallet,
    onCopyAddress: () -> Unit,
    isCopied: Boolean,
    onDeposit: () -> Unit,
    onRevealKey: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outline, RoundedCornerShape(24.dp))
            .padding(20.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    BlockiesIdenticon(address = wallet.address, size = 44.dp)
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = wallet.name,
                                color = colorScheme.onSurface,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(colorScheme.surfaceVariant)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "PRIMARY",
                                    color = colorScheme.onSurface,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                        Text(
                            text = "Path: ${wallet.derivationPath}",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            // Address Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(colorScheme.surfaceVariant)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${wallet.address.take(10)}...${wallet.address.takeLast(8)}",
                    color = colorScheme.onSurface,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
                IconButton(onClick = onCopyAddress, modifier = Modifier.size(28.dp)) {
                    Icon(
                        imageVector = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copy",
                        tint = if (isCopied) StatusGreen else colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onDeposit,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.onBackground,
                        contentColor = colorScheme.background
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.SouthWest, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Deposit", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onRevealKey,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.surfaceVariant,
                        contentColor = colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.Key, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Credentials", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun SubAccountItemCard(
    index: Int,
    wallet: SubWallet,
    isActive: Boolean,
    onSwitch: () -> Unit,
    onCopy: () -> Unit,
    isCopied: Boolean,
    onDeposit: () -> Unit,
    onRevealKey: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(colorScheme.surface)
            .border(
                1.dp,
                if (isActive) colorScheme.onBackground.copy(alpha = 0.3f) else colorScheme.outline,
                RoundedCornerShape(18.dp)
            )
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    BlockiesIdenticon(address = wallet.address, size = 32.dp)
                    Column {
                        Text(
                            text = wallet.name,
                            color = colorScheme.onSurface,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${wallet.address.take(6)}...${wallet.address.takeLast(4)}",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                if (isActive) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(colorScheme.onBackground)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "ACTIVE",
                            color = colorScheme.background,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                } else {
                    TextButton(
                        onClick = onSwitch,
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Switch",
                            color = colorScheme.onSurface,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Quick actions row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                ActionButtonSmall(
                    label = if (isCopied) "Copied" else "Copy",
                    icon = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                    onClick = onCopy,
                    modifier = Modifier.weight(1f)
                )
                ActionButtonSmall(
                    label = "Funds",
                    icon = Icons.Default.SouthWest,
                    onClick = onDeposit,
                    modifier = Modifier.weight(1f)
                )
                ActionButtonSmall(
                    label = "Info",
                    icon = Icons.Default.Key,
                    onClick = onRevealKey,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun ActionButtonSmall(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colorScheme = MaterialTheme.colorScheme

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(colorScheme.surfaceVariant)
            .clickable { onClick() }
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = colorScheme.onSurfaceVariant,
            modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            color = colorScheme.onSurfaceVariant,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HoldToRevealKeyBottomSheet(
    wallet: SubWallet,
    onDismiss: () -> Unit,
    viewModel: WalletsViewModel
) {
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }
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
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Shield,
                    contentDescription = null,
                    tint = StatusGreen,
                    modifier = Modifier.size(24.dp)
                )
            }

            Text(
                text = "MPC Enclave Attestation",
                color = colorScheme.onSurface,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Northveil operates on a pure Non-Custodial MPC Control Plane. Private keys are generated and fragmented across Turnkey hardware TEE enclaves and are never held or reconstructed on device or server.",
                color = colorScheme.onSurfaceVariant,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            // Attestation Details Container
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colorScheme.surfaceVariant)
                    .border(1.dp, colorScheme.outline, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Custody Model", color = colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    Text("Non-Custodial (MPC)", color = StatusGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Hardware Enclave", color = colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    Text("Turnkey TEE", color = colorScheme.onSurface, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Quorum Policy", color = colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    Text("FIDO2 / WebAuthn", color = colorScheme.onSurface, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Vault Address", color = colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    Text("${wallet.address.take(8)}...${wallet.address.takeLast(6)}", color = colorScheme.onSurface, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                }
            }

            Button(
                onClick = {
                    clipboardManager.setText(AnnotatedString(wallet.address))
                    isCopied = true
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = colorScheme.onBackground,
                    contentColor = colorScheme.background
                ),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                Icon(
                    if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isCopied) "Address Copied!" else "Copy Public Vault Address",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
