package xyz.northveil.mobile.ui.agents

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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*
import xyz.northveil.mobile.domain.model.McpAgent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgentsScreen(
    viewModel: AgentsViewModel,
    onConnectClaude: () -> Unit,
    onConnectChatGPT: () -> Unit,
    onConnectCustom: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val colorScheme = MaterialTheme.colorScheme
    val clipboardManager = LocalClipboardManager.current
    var selectedModalAgentType by remember { mutableStateOf<String?>(null) }
    var copiedConfig by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
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
                                text = "MCP ACTIVE",
                                color = colorScheme.onSurface,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Text(
                        text = "${state.connectedAgents.size} Connected",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Text(
                    text = "AI Agent Gateways",
                    color = colorScheme.onBackground,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Grant controlled, non-custodial MCP tool execution permissions to autonomous AI agents with biometric authorization.",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
        }

        // Quick Connect Buttons (Opens Interactive Guide Modal)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { selectedModalAgentType = "claude" },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.onBackground,
                        contentColor = colorScheme.background
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.SmartToy, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Claude", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { selectedModalAgentType = "chatgpt" },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.surface,
                        contentColor = colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(colorScheme.outline)
                    ),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("ChatGPT", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }

                Button(
                    onClick = { selectedModalAgentType = "custom" },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.surface,
                        contentColor = colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.weight(1f),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(colorScheme.outline)
                    ),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Custom", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        // How MCP Works Infobox
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
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = "🛡️", fontSize = 14.sp)
                        Text(
                            text = "Non-Custodial MCP Execution",
                            color = colorScheme.onSurface,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "1. AI reads on-chain portfolio via MCP stdio/SSE stream.\n2. When requesting a swap or transfer, a pending ticket is created.\n3. You confirm with your mobile biometric passkey to sign on-device.",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Connected Agents List Header
        item {
            Text(
                text = "Active Agent Authorizations (${state.connectedAgents.size})",
                color = colorScheme.onBackground,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        // Connected Agents List
        items(state.connectedAgents) { agent ->
            AgentCard(
                agent = agent,
                onRevoke = { viewModel.revokeAgentSession(agent.id) }
            )
        }
    }

    // Connect Agent Bottom Sheet Dialog
    selectedModalAgentType?.let { type ->
        val agentName = when (type) {
            "claude" -> "Claude Desktop Agent"
            "chatgpt" -> "ChatGPT Custom Action"
            else -> "Custom MCP Agent"
        }
        val configSnippet = when (type) {
            "claude" -> """
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
            "chatgpt" -> "OpenAPI SSE Endpoint: https://mcp.northveil.xyz/sse"
            else -> "Endpoint: https://mcp.northveil.xyz/sse"
        }

        ModalBottomSheet(
            onDismissRequest = { selectedModalAgentType = null },
            containerColor = colorScheme.surface,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Connect $agentName",
                            color = colorScheme.onSurface,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Model Context Protocol Configuration",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 12.sp
                        )
                    }
                    IconButton(onClick = { selectedModalAgentType = null }) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = colorScheme.onSurfaceVariant)
                    }
                }

                Text(
                    text = "Add this snippet to your Claude Desktop config (claude_desktop_config.json) or Cursor IDE (.cursor/mcp.json):",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 11.sp,
                    lineHeight = 15.sp
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(colorScheme.surfaceVariant)
                        .padding(12.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "CONFIGURATION SNIPPET",
                                color = colorScheme.onSurfaceVariant,
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(configSnippet))
                                    copiedConfig = true
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = if (copiedConfig) Icons.Default.Check else Icons.Default.ContentCopy,
                                    contentDescription = "Copy",
                                    tint = if (copiedConfig) StatusGreen else colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }
                        Text(
                            text = configSnippet,
                            color = colorScheme.onSurface,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 16.sp
                        )
                    }
                }

                Button(
                    onClick = {
                        when (type) {
                            "claude" -> viewModel.connectAgent("Claude Desktop", "claude", 500.0, 60)
                            "chatgpt" -> viewModel.connectAgent("ChatGPT Action", "chatgpt", 250.0, 30)
                            else -> viewModel.connectAgent("Custom Agent", "custom", 100.0, 15)
                        }
                        selectedModalAgentType = null
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.onBackground,
                        contentColor = colorScheme.background
                    ),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Text("Authorize & Activate Agent Gateway", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun AgentCard(
    agent: McpAgent,
    onRevoke: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.SmartToy,
                            contentDescription = null,
                            tint = colorScheme.onSurface,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column {
                        Text(
                            text = agent.name,
                            color = colorScheme.onSurface,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Expires in ${agent.expiresInMinutes}m",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(StatusGreenBg)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "ACTIVE",
                        color = StatusGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            HorizontalDivider(color = colorScheme.outline)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Spending Limit: $${agent.spendingLimitUsd} USD",
                    color = colorScheme.onSurfaceVariant,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
                TextButton(
                    onClick = onRevoke,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(text = "Revoke", color = StatusRed, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
