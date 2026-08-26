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

enum class DevTab { MCP, CLI, SDK, PYTHON }
enum class McpClientOption { CLAUDE, CURSOR, WINDSURF, CLAUDE_CODE, SSE }

@Composable
fun DeveloperHubScreen(
    onBack: () -> Unit
) {
    var activeTab by remember { mutableStateOf(DevTab.MCP) }
    var selectedMcpClient by remember { mutableStateOf(McpClientOption.CLAUDE) }
    val clipboardManager = LocalClipboardManager.current
    var copied by remember { mutableStateOf(false) }
    val colorScheme = MaterialTheme.colorScheme

    val codeSnippet = when (activeTab) {
        DevTab.MCP -> when (selectedMcpClient) {
            McpClientOption.CLAUDE -> """
// Claude Desktop (claude_desktop_config.json)
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
            """.trimIndent()
            McpClientOption.CURSOR -> """
// Cursor IDE (.cursor/mcp.json)
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"],
      "env": {
        "NORTHVEIL_API_URL": "https://mcp.northveil.xyz"
      }
    }
  }
}
            """.trimIndent()
            McpClientOption.WINDSURF -> """
// Windsurf (~/.codeium/windsurf/mcp_config.json)
{
  "mcpServers": {
    "northveil": {
      "command": "npx",
      "args": ["-y", "northveil-cli", "mcp"]
    }
  }
}
            """.trimIndent()
            McpClientOption.CLAUDE_CODE -> "claude mcp add northveil npx -y northveil-cli mcp"
            McpClientOption.SSE -> """
// Remote SSE Transport
{
  "mcpServers": {
    "northveil": {
      "url": "https://mcp.northveil.xyz/sse"
    }
  }
}
            """.trimIndent()
        }
        DevTab.CLI -> "npm install -g northveil-cli\nnorthveil auth login\nnorthveil balance\nnorthveil mcp"
        DevTab.SDK -> "import { NorthveilClient } from 'northveil-sdk';\n\nconst client = new NorthveilClient({\n  apiKey: 'nv_live_...'\n});\nconst portfolio = await client.getPortfolio();"
        DevTab.PYTHON -> "import northveil\n\nclient = northveil.Client(api_key='nv_live_...')\nbalance = client.get_balance('0x71C8...')"
    }

    val configPath = when (activeTab) {
        DevTab.MCP -> when (selectedMcpClient) {
            McpClientOption.CLAUDE -> "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\nWindows: %APPDATA%\\Claude\\claude_desktop_config.json"
            McpClientOption.CURSOR -> "Project root: .cursor/mcp.json or Settings -> MCP"
            McpClientOption.WINDSURF -> "Global config: ~/.codeium/windsurf/mcp_config.json"
            McpClientOption.CLAUDE_CODE -> "Terminal CLI execution"
            McpClientOption.SSE -> "Remote SSE Gateway Endpoint"
        }
        DevTab.CLI -> "Terminal npm global installation"
        DevTab.SDK -> "npm install northveil-sdk (Node.js & TypeScript)"
        DevTab.PYTHON -> "pip install northveil (Python 3.10+)"
    }

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
                        text = "Developer Hub & MCP",
                        color = colorScheme.onBackground,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Universal MCP Protocol, CLI, TypeScript SDK & Python",
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
                            .clickable {
                                activeTab = tab
                                copied = false
                            }
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

        // MCP Client Sub-Selector (When MCP is active)
        if (activeTab == DevTab.MCP) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "SELECT AI CLIENT / IDE",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(colorScheme.surfaceVariant)
                            .padding(3.dp),
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        McpClientOption.entries.forEach { client ->
                            val isSelected = client == selectedMcpClient
                            val label = when (client) {
                                McpClientOption.CLAUDE -> "Claude"
                                McpClientOption.CURSOR -> "Cursor"
                                McpClientOption.WINDSURF -> "Windsurf"
                                McpClientOption.CLAUDE_CODE -> "CLI"
                                McpClientOption.SSE -> "SSE"
                            }
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) colorScheme.surface else Color.Transparent)
                                    .clickable {
                                        selectedMcpClient = client
                                        copied = false
                                    }
                                    .padding(vertical = 5.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    color = if (isSelected) colorScheme.onSurface else colorScheme.onSurfaceVariant,
                                    fontSize = 10.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }
                }
            }
        }

        // Configuration Path Card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(colorScheme.surfaceVariant)
                    .padding(12.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "CONFIGURATION FILE LOCATION",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = configPath,
                        color = colorScheme.onSurface,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Content Card
        item {
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
                            text = if (activeTab == DevTab.MCP) "${selectedMcpClient.name} MCP SNIPPET" else "${activeTab.name} INTEGRATION",
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
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 17.sp
                        )
                    }

                    Text(
                        text = "Access all 38 on-chain tools including DEX swaps, airline reservations, and static contract audits.",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }
        }

        // Non-Custodial Biometric Approval Architecture Note
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colorScheme.surface)
                    .border(1.dp, colorScheme.outline, RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "🛡️ Mobile Biometric Enclave Signer",
                        color = colorScheme.onSurface,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "When an AI agent triggers a write action (e.g. transfers, token swaps, deployments) via MCP, this mobile wallet acts as your hardware authenticator. You receive a cryptographic approval prompt and sign with fingerprint or FaceID biometrics.",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }
}
