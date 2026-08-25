package xyz.northveil.mobile.ui.approvals

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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import xyz.northveil.mobile.core.designsystem.theme.*
import xyz.northveil.mobile.domain.model.ApprovalRecord
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ApprovalsScreen(
    viewModel: ApprovalsViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val colorScheme = MaterialTheme.colorScheme
    val context = LocalContext.current
    val activity = context as? FragmentActivity
    val clipboardManager = LocalClipboardManager.current
    var copiedId by remember { mutableStateOf<String?>(null) }

    val filteredList = remember(state.approvals, state.filter, state.searchQuery) {
        state.approvals.filter { record ->
            val matchesFilter = when (state.filter) {
                ApprovalFilter.ALL -> true
                ApprovalFilter.CONFIRMED -> record.status == "CONFIRMED"
                ApprovalFilter.PENDING -> record.status == "PENDING"
                ApprovalFilter.REJECTED -> record.status == "REJECTED"
            }
            val matchesSearch = if (state.searchQuery.isBlank()) {
                true
            } else {
                val q = state.searchQuery.lowercase()
                record.toolName.lowercase().contains(q) ||
                    (record.txHash?.lowercase()?.contains(q) == true) ||
                    record.agentType.lowercase().contains(q)
            }
            matchesFilter && matchesSearch
        }
    }

    val confirmedCount = remember(state.approvals) { state.approvals.count { it.status == "CONFIRMED" } }
    val pendingCount = remember(state.approvals) { state.approvals.count { it.status == "PENDING" } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
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
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colorScheme.surfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "ON-CHAIN AUDIT",
                                color = colorScheme.onSurface,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "${state.approvals.size} Records",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                    Text(
                        text = "Action Approvals",
                        color = colorScheme.onBackground,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                // Action Header Buttons (+ Test Request & Refresh)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(
                        onClick = { viewModel.createTestRequest() },
                        enabled = !state.isCreatingTest,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colorScheme.onBackground,
                            contentColor = colorScheme.background
                        ),
                        shape = RoundedCornerShape(20.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = if (state.isCreatingTest) "..." else "+ Test",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(
                        onClick = { viewModel.refresh() },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(colorScheme.surfaceVariant)
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        // Summary Counts Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(colorScheme.surfaceVariant)
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "$confirmedCount Confirmed",
                        color = colorScheme.onSurface,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(StatusAmberBg)
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "$pendingCount Pending",
                        color = StatusAmber,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Search Input Bar
        item {
            OutlinedTextField(
                value = state.searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                placeholder = {
                    Text(
                        text = "Filter by tool, hash, or agent...",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = "Search",
                        tint = colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp)),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = colorScheme.surface,
                    unfocusedContainerColor = colorScheme.surface,
                    focusedBorderColor = colorScheme.outline,
                    unfocusedBorderColor = colorScheme.outline,
                    focusedTextColor = colorScheme.onSurface,
                    unfocusedTextColor = colorScheme.onSurface
                ),
                singleLine = true
            )
        }

        // Filter Tabs
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(ApprovalFilter.entries.toTypedArray()) { filter ->
                    val isSelected = filter == state.filter
                    val label = when (filter) {
                        ApprovalFilter.ALL -> "All"
                        ApprovalFilter.CONFIRMED -> "Confirmed"
                        ApprovalFilter.PENDING -> "Pending"
                        ApprovalFilter.REJECTED -> "Failed"
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) colorScheme.onBackground else colorScheme.surface)
                            .border(
                                1.dp,
                                if (isSelected) Color.Transparent else colorScheme.outline,
                                RoundedCornerShape(12.dp)
                            )
                            .clickable { viewModel.setFilter(filter) }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) colorScheme.background else colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Empty State
        if (filteredList.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(colorScheme.surface)
                        .border(1.dp, colorScheme.outline, RoundedCornerShape(24.dp))
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Shield,
                            contentDescription = null,
                            tint = colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(36.dp)
                        )
                        Text(
                            text = "No Audit Records Found",
                            color = colorScheme.onSurface,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (state.searchQuery.isNotBlank()) "No records match '${state.searchQuery}'." else "Actions triggered by connected MCP AI agents will appear here.",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        } else {
            items(filteredList) { record ->
                ApprovalCard(
                    record = record,
                    isProcessing = state.actionProcessingId == record.id,
                    onApprove = {
                        activity?.let { act ->
                            viewModel.approveWithBiometricPasskey(act, record)
                        } ?: viewModel.submitDecision(record.id, true)
                    },
                    onReject = { viewModel.rejectRequest(record.id) },
                    onCopy = { text ->
                        clipboardManager.setText(AnnotatedString(text))
                        copiedId = record.id
                    },
                    isCopied = copiedId == record.id
                )
            }
        }
    }
}

@Composable
fun ApprovalCard(
    record: ApprovalRecord,
    isProcessing: Boolean,
    onApprove: () -> Unit,
    onReject: () -> Unit,
    onCopy: (String) -> Unit,
    isCopied: Boolean
) {
    val colorScheme = MaterialTheme.colorScheme
    val isPending = record.status == "PENDING"
    val isConfirmed = record.status == "CONFIRMED"

    val dateFormatted = remember(record.timestamp) {
        val sdf = SimpleDateFormat("MMM d, HH:mm:ss", Locale.getDefault())
        sdf.format(Date(record.timestamp))
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(colorScheme.surface)
            .border(
                1.dp,
                if (isPending) StatusAmber.copy(alpha = 0.4f) else colorScheme.outline,
                RoundedCornerShape(20.dp)
            )
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Card Top Row (Tool Name, Agent Badge, Status Badge)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Code,
                            contentDescription = null,
                            tint = colorScheme.onSurface,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = record.toolName,
                                color = colorScheme.onSurface,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(colorScheme.surfaceVariant)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = record.agentType,
                                    color = colorScheme.onSurfaceVariant,
                                    fontSize = 9.sp
                                )
                            }
                        }
                        Text(
                            text = dateFormatted,
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                // Status Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            when (record.status) {
                                "CONFIRMED" -> StatusGreenBg
                                "PENDING" -> StatusAmberBg
                                else -> StatusRedBg
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = record.status,
                        color = when (record.status) {
                            "CONFIRMED" -> StatusGreen
                            "PENDING" -> StatusAmber
                            else -> StatusRed
                        },
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Parameters JSON Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(colorScheme.surfaceVariant)
                    .padding(10.dp)
            ) {
                Text(
                    text = record.parametersJson,
                    color = colorScheme.onSurface,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    maxLines = 4
                )
            }

            // Tx Hash if Confirmed
            if (isConfirmed && record.txHash != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(colorScheme.surfaceVariant)
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TX: ${record.txHash.take(10)}...${record.txHash.takeLast(8)}",
                        color = colorScheme.onSurfaceVariant,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    IconButton(
                        onClick = { onCopy(record.txHash) },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                            contentDescription = "Copy Hash",
                            tint = if (isCopied) StatusGreen else colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }

            // Action Buttons for Pending Requests
            if (isPending) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onApprove,
                        enabled = !isProcessing,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colorScheme.onBackground,
                            contentColor = colorScheme.background
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1.5f),
                        contentPadding = PaddingValues(vertical = 10.dp)
                    ) {
                        Icon(
                            Icons.Default.Fingerprint,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isProcessing) "Authorizing..." else "Passkey Approve",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Button(
                        onClick = onReject,
                        enabled = !isProcessing,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colorScheme.surfaceVariant,
                            contentColor = StatusRed
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 10.dp)
                    ) {
                        Text(text = "Reject", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
