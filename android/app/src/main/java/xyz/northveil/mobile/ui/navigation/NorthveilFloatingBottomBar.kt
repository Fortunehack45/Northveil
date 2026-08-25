package xyz.northveil.mobile.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*

enum class NavTab(val title: String, val icon: ImageVector) {
    OVERVIEW("Overview", Icons.Default.GridView),
    WALLETS("Wallets", Icons.Default.AccountBalanceWallet),
    AGENTS("AI Agents", Icons.Default.SmartToy),
    PROFILE("Profile", Icons.Default.Person)
}

@Composable
fun NorthveilFloatingBottomBar(
    currentTab: NavTab,
    onTabSelected: (NavTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val colorScheme = MaterialTheme.colorScheme

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier
                .shadow(elevation = 16.dp, shape = RoundedCornerShape(32.dp), spotColor = Color.Black.copy(alpha = 0.3f))
                .clip(RoundedCornerShape(32.dp))
                .background(colorScheme.surface.copy(alpha = 0.95f))
                .border(1.dp, colorScheme.outline, RoundedCornerShape(32.dp))
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavTab.entries.forEach { tab ->
                val isSelected = tab == currentTab
                val tabBackground = if (isSelected) colorScheme.onBackground else Color.Transparent
                val tabContentColor = if (isSelected) colorScheme.background else colorScheme.onSurfaceVariant

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(tabBackground)
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.title,
                        tint = tabContentColor,
                        modifier = Modifier.size(18.dp)
                    )
                    if (isSelected) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = tab.title,
                            color = tabContentColor,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
