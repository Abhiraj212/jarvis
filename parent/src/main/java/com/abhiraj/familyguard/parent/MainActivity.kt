package com.abhiraj.familyguard.parent

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    private fun text(value: String, size: Float, color: Int, bold: Boolean = false) =
        TextView(this).apply {
            text = value; textSize = size; setTextColor(color)
            if (bold) setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(dp(4), dp(8), dp(4), dp(8))
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ink = Color.rgb(24, 35, 52)
        val muted = Color.rgb(105, 119, 139)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(24), dp(30), dp(24), dp(24))
            setBackgroundColor(Color.rgb(246, 248, 252))
        }
        root.addView(text("FamilyGuard", 30f, ink, true))
        root.addView(text("PARENT DASHBOARD", 12f, Color.rgb(38, 132, 108), true))
        root.addView(text("Your family, safer together.", 17f, muted))
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(16), dp(18), dp(16))
            setBackgroundColor(Color.WHITE)
        }
        card.addView(text("No child device linked yet", 19f, ink, true))
        card.addView(text("Linking will use a one-time family code. The child app will show exactly what is shared and allow sharing to be paused.", 14f, muted))
        card.addView(text("PAIRING CODE", 11f, Color.rgb(38,132,108), true))
        card.addView(text("Not generated in this prototype", 15f, ink))
        root.addView(card, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(22) })
        root.addView(text("SAFETY OVERVIEW", 12f, Color.rgb(38,132,108), true).apply { setPadding(dp(4),dp(24),dp(4),dp(8)) })
        listOf("Location sharing  •  Not connected","Screen-time summary  •  Not connected","App usage summary  •  Not connected","Safe browsing  •  Not connected").forEach { item ->
            root.addView(text("  $item", 15f, ink).apply {
                setBackgroundColor(Color.WHITE)
                setPadding(dp(14), dp(14), dp(14), dp(14))
            }, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(8) })
        }
        root.addView(text("Privacy first: no hidden tracking, call logs, message contents, or private search-history capture. This first build is a UI prototype and does not collect or transmit data.", 12f, muted))
        setContentView(root)
    }
}
