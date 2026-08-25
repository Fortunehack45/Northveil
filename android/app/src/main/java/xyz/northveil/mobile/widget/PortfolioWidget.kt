package xyz.northveil.mobile.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import xyz.northveil.mobile.R

class PortfolioWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            PortfolioWidgetContent()
        }
    }

    @Composable
    private fun PortfolioWidgetContent() {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(ColorProvider(R.color.vault_black))
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "NORTHVEIL VAULT",
                style = TextStyle(
                    color = ColorProvider(R.color.text_secondary),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = GlanceModifier.height(4.dp))
            Text(
                text = "$12,482.50 USD",
                style = TextStyle(
                    color = ColorProvider(R.color.text_primary),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = GlanceModifier.height(2.dp))
            Text(
                text = "+4.2% today",
                style = TextStyle(
                    color = ColorProvider(R.color.status_green),
                    fontSize = 11.sp
                )
            )
        }
    }
}
