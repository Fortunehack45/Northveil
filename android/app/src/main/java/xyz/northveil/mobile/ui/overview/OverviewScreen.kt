package xyz.northveil.mobile.ui.overview

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import xyz.northveil.mobile.core.designsystem.BlockiesIdenticon
import xyz.northveil.mobile.core.designsystem.NorthveilBranding
import xyz.northveil.mobile.core.designsystem.theme.*
import xyz.northveil.mobile.domain.model.SubWallet
import xyz.northveil.mobile.domain.model.TokenHolding

@Composable
fun OverviewScreen(
    viewModel: OverviewViewModel,
    onOpenSend: () -> Unit,
    onOpenReceive: () -> Unit,
    onOpenDeposit: () -> Unit,
    onOpenApprovals: () -> Unit,
    onOpenDrawer: () -> Unit,
    onTokenClick: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val colorScheme = MaterialTheme.colorScheme
    val clipboardManager = LocalClipboardManager.current
    var copiedAddress by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 14.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ═══════════════════════════════════════════════════════════════════
        // TOP APP BAR: BRAND EMBLEM, NETWORK BADGE & MENU
        // ═══════════════════════════════════════════════════════════════════
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AsyncImage(
                        model = NorthveilBranding.WALLET_LOGO_URL,
                        contentDescription = "Northveil Mobile Logo",
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.dp, colorScheme.outline, RoundedCornerShape(10.dp))
                    )
                    Column {
                        Text(
                            text = "NORTHVEIL",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = colorScheme.onBackground,
                            letterSpacing = 0.5.sp
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(StatusGreen)
                            )
                            Text(
                                text = "TESTNET SEPOLIA",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = onOpenApprovals,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colorScheme.surface)
                            .border(1.dp, colorScheme.outline, CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Shield,
                            contentDescription = "Approvals",
                            tint = colorScheme.onSurface,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = onOpenDrawer,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colorScheme.surface)
                            .border(1.dp, colorScheme.outline, CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Menu,
                            contentDescription = "Menu",
                            tint = colorScheme.onSurface,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // SUB-WALLET SWITCHER PILLS (Web Parity)
        // ═══════════════════════════════════════════════════════════════════
        if (state.subWallets.size > 1) {
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(state.subWallets) { wallet ->
                        val isSelected = wallet.id == state.activeWallet?.id
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (isSelected) colorScheme.onBackground else colorScheme.surface)
                                .border(
                                    1.dp,
                                    if (isSelected) Color.Transparent else colorScheme.outline,
                                    RoundedCornerShape(20.dp)
                                )
                                .clickable { viewModel.switchActiveWallet(wallet.id) }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            BlockiesIdenticon(address = wallet.address, size = 16.dp)
                            Text(
                                text = wallet.name,
                                color = if (isSelected) colorScheme.background else colorScheme.onSurface,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // HERO CARD: PORTFOLIO NET WORTH & VAULT OVERVIEW
        // ═══════════════════════════════════════════════════════════════════
        item {
            val addr = state.activeWallet?.address ?: "0x0000000000000000000000000000000000000000"
            val walletName = state.activeWallet?.name ?: "Primary Vault"

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(26.dp))
                    .background(colorScheme.surface)
                    .border(1.dp, colorScheme.outline, RoundedCornerShape(26.dp))
                    .padding(20.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    // Header Tag Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colorScheme.surfaceVariant)
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(colorScheme.onSurface)
                                )
                                Text(
                                    text = "VAULT OVERVIEW",
                                    color = colorScheme.onSurface,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        // Copyable Wallet Address Chip
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colorScheme.surfaceVariant)
                                .clickable {
                                    clipboardManager.setText(AnnotatedString(addr))
                                    copiedAddress = true
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            BlockiesIdenticon(address = addr, size = 14.dp)
                            Text(
                                text = "${addr.take(6)}...${addr.takeLast(4)}",
                                color = colorScheme.onSurfaceVariant,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Icon(
                                imageVector = if (copiedAddress) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "Copy",
                                tint = if (copiedAddress) StatusGreen else colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }

                    // Balance Display with Refresh
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "$${String.format("%,.2f", state.totalNetWorthUsd)}",
                                color = colorScheme.onSurface,
                                fontSize = 34.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = (-0.5).sp
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                modifier = Modifier.padding(top = 2.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(StatusGreenBg)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "+8.42% 24h",
                                        color = StatusGreen,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                                Text(
                                    text = "• $walletName",
                                    color = colorScheme.onSurfaceVariant,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        val infiniteTransition = rememberInfiniteTransition(label = "spin")
                        val rotateAngle by infiniteTransition.animateFloat(
                            initialValue = 0f,
                            targetValue = 360f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(800, easing = LinearEasing),
                                repeatMode = RepeatMode.Restart
                            ),
                            label = "spinAngle"
                        )

                        IconButton(
                            onClick = {
                                copiedAddress = false
                                viewModel.refreshBalances()
                            },
                            enabled = !state.isRefreshing,
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(colorScheme.surfaceVariant)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = colorScheme.onSurface,
                                modifier = Modifier
                                    .size(18.dp)
                                    .then(if (state.isRefreshing) Modifier.rotate(rotateAngle) else Modifier)
                            )
                        }
                    }

                    HorizontalDivider(color = colorScheme.outline)

                    Text(
                        text = "Autonomous multi-chain vault backed by Turnkey Nitro TEE enclaves and hardware WebAuthn biometrics.",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // ACTION BUTTONS (Send, Receive, Deposit, Approvals)
        // ═══════════════════════════════════════════════════════════════════
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ActionButton(
                    label = "Send",
                    icon = Icons.Default.NorthEast,
                    isPrimary = true,
                    onClick = onOpenSend,
                    modifier = Modifier.weight(1f)
                )
                ActionButton(
                    label = "Receive",
                    icon = Icons.Default.SouthWest,
                    isPrimary = false,
                    onClick = onOpenReceive,
                    modifier = Modifier.weight(1f)
                )
                ActionButton(
                    label = "Deposit",
                    icon = Icons.Default.Add,
                    isPrimary = false,
                    onClick = onOpenDeposit,
                    modifier = Modifier.weight(1f)
                )
                ActionButton(
                    label = "Approvals",
                    icon = Icons.Default.Shield,
                    isPrimary = false,
                    onClick = onOpenApprovals,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // THREE STAT OVERVIEW CARDS (Web Parity)
        // ═══════════════════════════════════════════════════════════════════
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "WALLETS",
                    value = "${state.subWallets.size} Active",
                    icon = Icons.Default.AccountBalanceWallet,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "AI AGENTS",
                    value = "MCP Ready",
                    icon = Icons.Default.SmartToy,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "SECURITY",
                    value = "TEE + Passkey",
                    icon = Icons.Default.Lock,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // TOKEN HOLDINGS HEADER
        // ═══════════════════════════════════════════════════════════════════
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(colorScheme.surfaceVariant)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "PORTFOLIO",
                            color = colorScheme.onSurface,
                            fontSize = 9.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "Asset Holdings (${state.tokenHoldings.size})",
                        color = colorScheme.onBackground,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = "Live Prices",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // ═══════════════════════════════════════════════════════════════════
        // TOKEN HOLDINGS LIST
        // ═══════════════════════════════════════════════════════════════════
        items(state.tokenHoldings) { token ->
            TokenHoldingRow(
                token = token,
                onClick = { onTokenClick(token.symbol) }
            )
        }
    }
}

@Composable
fun ActionButton(
    label: String,
    icon: ImageVector,
    isPrimary: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colorScheme = MaterialTheme.colorScheme
    val bg = if (isPrimary) colorScheme.onBackground else colorScheme.surface
    val fg = if (isPrimary) colorScheme.background else colorScheme.onSurface
    val borderCol = if (isPrimary) Color.Transparent else colorScheme.outline

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(bg)
            .border(1.dp, borderCol, RoundedCornerShape(24.dp))
            .clickable { onClick() }
            .padding(vertical = 11.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = icon, contentDescription = label, tint = fg, modifier = Modifier.size(15.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = fg, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier
) {
    val colorScheme = MaterialTheme.colorScheme

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outline, RoundedCornerShape(18.dp))
            .padding(12.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(13.dp)
                )
            }
            Text(
                text = value,
                color = colorScheme.onSurface,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun TokenHoldingRow(
    token: TokenHolding,
    onClick: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outline, RoundedCornerShape(18.dp))
            .clickable { onClick() }
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AsyncImage(
                    model = token.iconUrl,
                    contentDescription = token.name,
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(colorScheme.surfaceVariant)
                )
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = token.symbol,
                            color = colorScheme.onSurface,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(colorScheme.surfaceVariant)
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = token.network.uppercase(),
                                color = colorScheme.onSurfaceVariant,
                                fontSize = 8.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Text(
                        text = token.name,
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "${token.balance} ${token.symbol}",
                    color = colorScheme.onSurface,
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "$${String.format("%,.2f", token.balance * token.priceUsd)}",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
