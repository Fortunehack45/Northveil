package xyz.northveil.mobile.ui.overview

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import xyz.northveil.mobile.core.designsystem.theme.*
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

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Brand Header
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
                        model = xyz.northveil.mobile.core.designsystem.NorthveilBranding.WALLET_LOGO_URL,
                        contentDescription = "Northveil Wallet Logo",
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                    Text(
                        text = "NORTHVEIL",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }

                IconButton(
                    onClick = onOpenDrawer,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(CardSurfaceDark)
                        .border(1.dp, CardSurfaceBorderDark, CircleShape)
                ) {
                    Icon(Icons.Default.Menu, contentDescription = "Menu", tint = TextPrimary, modifier = Modifier.size(18.dp))
                }
            }
        }

        // Vault Overview Hero Card
        item {
            VaultHeroCard(
                netWorthUsd = state.totalNetWorthUsd,
                activeAccountName = state.activeWallet?.name ?: "Primary Vault",
                activeAddress = state.activeWallet?.address ?: "0x000...0000",
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

        // Multi-Chain Token Holdings Section
        item {
            Text(
                text = "Holdings (${state.tokenHoldings.size})",
                color = TextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

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
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(CardSurfaceDark)
            .border(1.dp, CardSurfaceBorderDark, RoundedCornerShape(24.dp))
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
                        .background(ChipBackground)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "VAULT OVERVIEW",
                        color = TextPrimary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(ChipBackground)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "$activeAccountName: ${activeAddress.take(6)}...${activeAddress.takeLast(4)}",
                        color = TextSecondary,
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
                    color = TextPrimary,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )

                IconButton(
                    onClick = onRefresh,
                    enabled = !isRefreshing,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(ChipBackground)
                ) {
                    if (isRefreshing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = BrandAccentCyan,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Text(
                text = "Multi-chain balances across ETH, SOL, Base, ARB & Sepolia.",
                color = TextTertiary,
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
    val bg = if (isPrimary) Color.White else CardSurfaceDark
    val fg = if (isPrimary) Color.Black else TextPrimary

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(bg)
            .border(1.dp, if (isPrimary) Color.Transparent else CardSurfaceBorderDark, RoundedCornerShape(24.dp))
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
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(CardSurfaceDark)
            .border(1.dp, CardSurfaceBorderDark, RoundedCornerShape(16.dp))
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
                    .background(Color.Black)
            )
            Column {
                Text(text = token.symbol, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(text = token.name, color = TextSecondary, fontSize = 11.sp)
            }
        }

        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "${token.balance} ${token.symbol}",
                color = TextPrimary,
                fontSize = 13.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "$${String.format("%,.2f", token.balance * token.priceUsd)}",
                color = TextSecondary,
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}
