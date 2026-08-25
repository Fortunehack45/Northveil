package xyz.northveil.mobile.ui.overview

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
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

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Brand Header with Hamburger Menu
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
                        contentDescription = "Northveil Wallet Logo",
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                    Text(
                        text = "NORTHVEIL",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colorScheme.onBackground
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

        // Sub-Wallet Switcher Pills (Web Parity)
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

        // Vault Overview Hero Card
        item {
            VaultHeroCard(
                netWorthUsd = state.totalNetWorthUsd,
                activeAccountName = state.activeWallet?.name ?: "Primary Vault",
                activeAddress = state.activeWallet?.address ?: "0x0000000000000000000000000000000000000000",
                onRefresh = { viewModel.refreshBalances() },
                isRefreshing = state.isRefreshing
            )
        }

        // Action Buttons Row (Send, Receive, Deposit, Approvals)
        item {
            ActionButtonsRow(
                onSend = onOpenSend,
                onReceive = onOpenReceive,
                onDeposit = onOpenDeposit,
                onApprovals = onOpenApprovals
            )
        }

        // Holdings Section Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Holdings (${state.tokenHoldings.size})",
                    color = colorScheme.onBackground,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Text(
                    text = "Live USD Prices",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Token Holdings Rows
        items(state.tokenHoldings) { token ->
            TokenHoldingRow(
                token = token,
                onClick = { onTokenClick(token.symbol) }
            )
        }
    }
}

@Composable
fun VaultHeroCard(
    netWorthUsd: Double,
    activeAccountName: String,
    activeAddress: String,
    onRefresh: () -> Unit,
    isRefreshing: Boolean
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
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
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
                    Text(
                        text = "VAULT OVERVIEW",
                        color = colorScheme.onSurface,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colorScheme.surfaceVariant)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    BlockiesIdenticon(address = activeAddress, size = 14.dp)
                    Text(
                        text = "$activeAccountName: ${activeAddress.take(6)}...${activeAddress.takeLast(4)}",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "$${String.format("%,.2f", netWorthUsd)}",
                    color = colorScheme.onSurface,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )

                IconButton(
                    onClick = onRefresh,
                    enabled = !isRefreshing,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(colorScheme.surfaceVariant)
                ) {
                    if (isRefreshing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = colorScheme.primary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Text(
                text = "Multi-chain non-custodial balances across ETH, SOL, Base, ARB & Sepolia.",
                color = colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun ActionButtonsRow(
    onSend: () -> Unit,
    onReceive: () -> Unit,
    onDeposit: () -> Unit,
    onApprovals: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ActionButton(
            label = "Send",
            icon = Icons.Default.NorthEast,
            isPrimary = true,
            onClick = onSend,
            modifier = Modifier.weight(1f)
        )
        ActionButton(
            label = "Receive",
            icon = Icons.Default.SouthWest,
            isPrimary = false,
            onClick = onReceive,
            modifier = Modifier.weight(1f)
        )
        ActionButton(
            label = "Deposit",
            icon = Icons.Default.Add,
            isPrimary = false,
            onClick = onDeposit,
            modifier = Modifier.weight(1f)
        )
        ActionButton(
            label = "Approvals",
            icon = Icons.Default.Shield,
            isPrimary = false,
            onClick = onApprovals,
            modifier = Modifier.weight(1f)
        )
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
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = icon, contentDescription = label, tint = fg, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = fg, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun TokenHoldingRow(
    token: TokenHolding,
    onClick: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outline, RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(14.dp),
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
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(colorScheme.surfaceVariant)
            )
            Column {
                Text(text = token.symbol, color = colorScheme.onSurface, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(text = token.name, color = colorScheme.onSurfaceVariant, fontSize = 11.sp)
            }
        }

        Column(horizontalAlignment = Alignment.End) {
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
