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
    var copiedWalletId by remember { mutableStateOf<String?>(null) }
    var selectedWalletForKeyReveal by remember { mutableStateOf<SubWallet?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
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
                                .background(ChipBackground)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "MULTI-ACCOUNT VAULT",
                                color = TextPrimary,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "${state.subWallets.size} Accounts",
                            color = TextSecondary,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Text(
                        text = "Wallets & Accounts",
                        color = TextPrimary,
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
                            .background(Color.White)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "New Account", tint = Color.Black, modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = onOpenImportAccount,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(CardSurfaceDark)
                            .border(1.dp, CardSurfaceBorderDark, CircleShape)
                    ) {
                        Icon(Icons.Default.Upload, contentDescription = "Import", tint = TextPrimary, modifier = Modifier.size(18.dp))
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

        // Sub-Accounts List
        item {
            Text(
                text = "All Vault Accounts (${state.subWallets.size})",
                color = TextPrimary,
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
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(CardSurfaceDark)
            .border(1.dp, CardSurfaceBorderDark, RoundedCornerShape(24.dp))
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
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, tint = Color.Black, modifier = Modifier.size(22.dp))
                    }
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(text = wallet.name, color = TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color.White.copy(alpha = 0.1f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(text = "PRIMARY", color = TextPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                            }
                        }
                        Text(text = "Path: ${wallet.derivationPath}", color = TextSecondary, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            // Address Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.Black.copy(alpha = 0.4f))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${wallet.address.take(10)}...${wallet.address.takeLast(8)}",
                    color = TextPrimary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
                IconButton(onClick = onCopyAddress, modifier = Modifier.size(28.dp)) {
                    Icon(
                        imageVector = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = "Copy",
                        tint = if (isCopied) BrandAccentYellow else TextSecondary,
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
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
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
                    colors = ButtonDefaults.buttonColors(containerColor = CardSurfaceSubtle, contentColor = TextPrimary),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.Key, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Private Key", fontSize = 12.sp, fontWeight = FontWeight.Medium)
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
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(if (isActive) CardSurfaceSubtle else CardSurfaceDark)
            .border(1.dp, if (isActive) Color.White.copy(alpha = 0.2f) else CardSurfaceBorderDark, RoundedCornerShape(18.dp))
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
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isActive) Color.White else ChipBackground),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = index.toString(),
                            color = if (isActive) Color.Black else TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                    Column {
                        Text(text = wallet.name, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(text = "${wallet.address.take(6)}...${wallet.address.takeLast(4)}", color = TextSecondary, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                }

                if (isActive) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(text = "ACTIVE", color = Color.Black, fontSize = 9.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                    }
                } else {
                    TextButton(onClick = onSwitch, contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)) {
                        Text(text = "Switch", color = BrandAccentCyan, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Quick actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                ActionButtonSmall(label = if (isCopied) "Copied" else "Copy", icon = Icons.Default.ContentCopy, onClick = onCopy, modifier = Modifier.weight(1f))
                ActionButtonSmall(label = "Funds", icon = Icons.Default.SouthWest, onClick = onDeposit, modifier = Modifier.weight(1f))
                ActionButtonSmall(label = "Key", icon = Icons.Default.Key, onClick = onRevealKey, modifier = Modifier.weight(1f))
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
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(ChipBackground)
            .clickable { onClick() }
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(12.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HoldToRevealKeyBottomSheet(
    wallet: SubWallet,
    onDismiss: () -> Unit,
    viewModel: WalletsViewModel
) {
    var isHolding by remember { mutableStateOf(false) }
    var privateKeyRevealed by remember { mutableStateOf<String?>(null) }
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(wallet.id) {
        coroutineScope.launch {
            privateKeyRevealed = viewModel.getDecryptedKey(wallet.id)
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = CardSurfaceDark,
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
                    .background(Color.White.copy(alpha = 0.08f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Lock, contentDescription = null, tint = TextPrimary, modifier = Modifier.size(24.dp))
            }

            Text(
                text = "Reveal Private Key",
                color = TextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Never share your private key. Anyone with this key has full control over the funds in ${wallet.name}.",
                color = StatusRed,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            // Blur container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black)
                    .border(1.dp, CardSurfaceBorderDark, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                val blurRadius = if (isHolding) 0.dp else 16.dp
                val displayKey = privateKeyRevealed ?: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"

                Text(
                    text = displayKey,
                    color = TextPrimary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.blur(blurRadius)
                )

                if (!isHolding) {
                    Text(
                        text = "HOLD BUTTON TO UNBLUR",
                        color = BrandAccentYellow,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Hold-to-reveal button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(if (isHolding) BrandAccentYellow else Color.White)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                isHolding = true
                                tryAwaitRelease()
                                isHolding = false
                            }
                        )
                    }
                    .padding(vertical = 14.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isHolding) "REVEALING CREDENTIAL..." else "HOLD TO REVEAL",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            TextButton(
                onClick = {
                    privateKeyRevealed?.let {
                        clipboardManager.setText(AnnotatedString(it))
                        isCopied = true
                    }
                },
                enabled = isHolding
            ) {
                Icon(if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = if (isCopied) "Copied Key" else "Copy Private Key", color = TextSecondary, fontSize = 12.sp)
            }
        }
    }
}
