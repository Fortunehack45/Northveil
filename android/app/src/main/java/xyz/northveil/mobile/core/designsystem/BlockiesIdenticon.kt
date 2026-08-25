package xyz.northveil.mobile.core.designsystem

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlin.math.floor
import kotlin.math.sin

/**
 * Deterministic On-Chain Blockies Identicon for Android Compose.
 * Mirrors the exact algorithm and visual styling from web's BlockiesAvatar.tsx.
 */
@Composable
fun BlockiesIdenticon(
    address: String,
    size: Dp = 32.dp,
    modifier: Modifier = Modifier
) {
    val blockiesData = remember(address) {
        generateBlockiesData(address)
    }

    Canvas(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(size / 4))
    ) {
        val cellSize = this.size.width / 5f

        // Draw background
        drawRect(
            color = blockiesData.bgColor,
            topLeft = Offset.Zero,
            size = this.size
        )

        // Draw 5x5 grid cells
        for (y in 0 until 5) {
            for (x in 0 until 5) {
                val cellType = blockiesData.grid[y][x]
                if (cellType > 0) {
                    val cellColor = if (cellType == 1) blockiesData.mainColor else blockiesData.spotColor
                    drawRect(
                        color = cellColor,
                        topLeft = Offset(x * cellSize, y * cellSize),
                        size = Size(cellSize, cellSize)
                    )
                }
            }
        }
    }
}

private data class BlockiesData(
    val bgColor: Color,
    val mainColor: Color,
    val spotColor: Color,
    val grid: List<List<Int>>
)

private fun generateBlockiesData(address: String): BlockiesData {
    val cleanAddr = address.lowercase().ifEmpty { "0x0000000000000000000000000000000000000000" }

    var seed = 0
    for (i in cleanAddr.indices) {
        seed = ((seed shl 5) - seed) + cleanAddr[i].code
    }

    fun rand(): Float {
        val x = sin((seed++).toDouble()) * 10000.0
        return (x - floor(x)).toFloat()
    }

    val hue1 = (rand() * 360f).toInt()
    val hue2 = (hue1 + 140 + (rand() * 80f).toInt()) % 360
    val bgHue = (hue1 + 220 + (rand() * 50f).toInt()) % 360

    val mainColor = hslToColor(hue1.toFloat(), 0.85f, 0.55f)
    val spotColor = hslToColor(hue2.toFloat(), 0.90f, 0.60f)
    val bgColor = hslToColor(bgHue.toFloat(), 0.40f, 0.15f)

    val grid = mutableListOf<List<Int>>()
    for (y in 0 until 5) {
        val row = mutableListOf<Int>()
        for (x in 0 until 3) {
            val valFloat = rand()
            row.add(if (valFloat < 0.4f) 0 else if (valFloat < 0.8f) 1 else 2)
        }
        grid.add(listOf(row[0], row[1], row[2], row[1], row[0]))
    }

    return BlockiesData(bgColor, mainColor, spotColor, grid)
}

private fun hslToColor(hue: Float, saturation: Float, lightness: Float): Color {
    val c = (1f - kotlin.math.abs(2f * lightness - 1f)) * saturation
    val x = c * (1f - kotlin.math.abs((hue / 60f) % 2f - 1f))
    val m = lightness - c / 2f

    val (rPrime, gPrime, bPrime) = when {
        hue < 60f -> Triple(c, x, 0f)
        hue < 120f -> Triple(x, c, 0f)
        hue < 180f -> Triple(0f, c, x)
        hue < 240f -> Triple(0f, x, c)
        hue < 300f -> Triple(x, 0f, c)
        else -> Triple(c, 0f, x)
    }

    return Color(
        red = (rPrime + m).coerceIn(0f, 1f),
        green = (gPrime + m).coerceIn(0f, 1f),
        blue = (bPrime + m).coerceIn(0f, 1f)
    )
}
