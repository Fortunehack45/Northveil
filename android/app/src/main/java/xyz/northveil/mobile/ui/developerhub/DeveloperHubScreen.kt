package xyz.northveil.mobile.ui.developerhub

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*

enum class DevTab { CLI, SDK, PYTHON, MCP }

@Composable
fun DeveloperHubScreen(
    onBack: () -> Unit
) {
    var activeTab by remember { mutableStateOf(DevTab.CLI) }
    val clipboardManager = LocalClipboardManager.current
    var copied by remember { mutableStateOf(false) }
    val colorScheme = MaterialTheme.colorScheme

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(onClick = onBack, modifier = Modifier.size(32.dp)) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colorScheme.onBackground
                    )
                }
                Column {
                    Text(
                        text = "Developer Hub",
                        color = colorScheme.onBackground,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "CLI, TypeScript SDK, Python & Universal MCP Tools",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Segmented Tabs
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(colorScheme.surfaceVariant)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                DevTab.entries.forEach { tab ->
                    val isSelected = tab == activeTab
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) colorScheme.onBackground else Color.Transparent)
                            .clickable { activeTab = tab }
                            .padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = tab.name,
                            color = if (isSelected) colorScheme.background else colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Content Card
        item {
            val codeSnippet = when (activeTab) {
                DevTab.CLI -> "npm install -g northveil-cli\nnorthveil auth login\nnorthveil balance\nnorthveil mcp"
                DevTab.SDK -> "import { NorthveilClient } from 'northveil-sdk';\n\nconst client = new NorthveilClient({\n  apiKey: 'nv_live_...'\n});\nconst portfolio = await client.getPortfolio();"
                DevTab.PYTHON -> "import northveil\n\nclient = northveil.Client(api_key='nv_live_...')\nbalance = client.get_balance('0x71C8...')"
                DevTab.MCP -> "// Claude Desktop (claude_desktop_config.json)\n{\n  \"mcpServers\": {\n    \"northveil\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"northveil-cli\", \"mcp\"]\n    }\n  }\n}"
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(colorScheme.surface)
                    .border(1.dp, colorScheme.outline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${activeTab.name} INTEGRATION",
                            color = colorScheme.onSurface,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(codeSnippet))
                                copied = true
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (copied) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "Copy",
                                tint = if (copied) StatusGreen else colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(colorScheme.surfaceVariant)
                            .padding(12.dp)
                    ) {
                        Text(
                            text = codeSnippet,
                            color = colorScheme.onSurface,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 18.sp
                        )
                    }

                    Text(
                        text = "Access all 38 tools including DEX swaps, airline reservations, and static contract audits.",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
