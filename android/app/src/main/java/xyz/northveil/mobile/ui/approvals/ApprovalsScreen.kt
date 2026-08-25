package xyz.northveil.mobile.ui.approvals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import xyz.northveil.mobile.core.designsystem.theme.*
import xyz.northveil.mobile.domain.model.ApprovalRecord

@Composable
fun ApprovalsScreen(
    viewModel: ApprovalsViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    val filteredList = remember(state.approvals, state.filter) {
        when (state.filter) {
            ApprovalFilter.ALL -> state.approvals
            ApprovalFilter.CONFIRMED -> state.approvals.filter { it.status == "CONFIRMED" }
            ApprovalFilter.PENDING -> state.approvals.filter { it.status == "PENDING" }
            ApprovalFilter.REJECTED -> state.approvals.filter { it.status == "REJECTED" }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(VaultBlack)
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
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
                Column {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(ChipBackground)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(text = "ON-CHAIN AUDIT", color = TextPrimary, fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                    }
                    Text(text = "Action Approvals", color = TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Filter Tabs
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(ApprovalFilter.values()) { filter ->
                    val isSelected = filter == state.filter
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) Color.White else CardSurfaceDark)
                            .border(1.dp, if (isSelected) Color.Transparent else CardSurfaceBorderDark, RoundedCornerShape(12.dp))
                            .clickable { viewModel.setFilter(filter) }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = filter.name,
                            color = if (isSelected) Color.Black else TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Approvals Feed
        items(filteredList) { record ->
            ApprovalCard(
                record = record,
                onApprove = { viewModel.submitDecision(record.id, true) },
                onReject = { viewModel.submitDecision(record.id, false) }
            )
        }
    }
}

@Composable
fun ApprovalCard(
    record: ApprovalRecord,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    val isPending = record.status == "PENDING"

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(CardSurfaceDark)
            .border(1.dp, if (isPending) BrandAccentYellow.copy(alpha = 0.4f) else CardSurfaceBorderDark, RoundedCornerShape(18.dp))
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = record.toolName, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            when (record.status) {
                                "CONFIRMED" -> StatusGreen.copy(alpha = 0.15f)
                                "PENDING" -> StatusAmber.copy(alpha = 0.15f)
                                else -> StatusRed.copy(alpha = 0.15f)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 2.dp)
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

            Text(
                text = "Caller: ${record.agentType}",
                color = TextSecondary,
                fontSize = 12.sp
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color.Black.copy(alpha = 0.5f))
                    .padding(10.dp)
            ) {
                Text(
                    text = record.parametersJson,
                    color = TextSecondary,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            if (isPending) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onApprove,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(text = "Approve", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = onReject,
                        colors = ButtonDefaults.buttonColors(containerColor = CardSurfaceSubtle, contentColor = StatusRed),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(text = "Reject", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
