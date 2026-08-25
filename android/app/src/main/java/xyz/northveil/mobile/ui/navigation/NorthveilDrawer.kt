package xyz.northveil.mobile.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*

enum class DrawerItem(val title: String, val icon: ImageVector) {
    APPROVALS("Action Approvals", Icons.Default.Shield),
    DEVELOPER_HUB("Developer Hub", Icons.Default.Code),
    TOUR("Interactive Tour", Icons.Default.HelpOutline)
}

@Composable
fun NorthveilDrawerContent(
    onItemSelected: (DrawerItem) -> Unit,
    onCloseDrawer: () -> Unit
) {
    ModalDrawerSheet(
        drawerContainerColor = CardSurfaceDark,
        drawerContentColor = TextPrimary,
        modifier = Modifier.width(300.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                coil.compose.AsyncImage(
                    model = xyz.northveil.mobile.core.designsystem.NorthveilBranding.WALLET_LOGO_URL,
                    contentDescription = "Northveil Wallet Logo",
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                )
                Column {
                    Text("Northveil", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text("Native Mobile Vault", fontSize = 12.sp, color = TextSecondary)
                }
            }

            Divider(color = CardSurfaceBorderDark)

            DrawerItem.values().forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable {
                            onItemSelected(item)
                            onCloseDrawer()
                        }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(imageVector = item.icon, contentDescription = item.title, tint = TextSecondary, modifier = Modifier.size(20.dp))
                    Text(text = item.title, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
            }

            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = "v1.0.0 (Native Android Engine)",
                fontSize = 11.sp,
                color = TextTertiary,
                modifier = Modifier.padding(start = 14.dp)
            )
        }
    }
}
