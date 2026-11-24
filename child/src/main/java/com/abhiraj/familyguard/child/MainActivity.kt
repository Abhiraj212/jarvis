package com.abhiraj.familyguard.child

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
        root.addView(text("CHILD COMPANION", 12f, Color.rgb(38, 132, 108), true))
        root.addView(text("You stay in control of what you share.", 18f, ink, true))
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(16), dp(18), dp(16))
            setBackgroundColor(Color.WHITE)
        }
        card.addView(text("What this app is for", 19f, ink, true))
        card.addView(text("Family safety features can share selected information with your parent or guardian. Nothing is collected in this prototype.", 14f, muted))
        root.addView(card, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(20) })
        root.addView(text("SHARING CONTROLS", 12f, Color.rgb(38,132,108), true).apply { setPadding(dp(4),dp(24),dp(4),dp(8)) })
        listOf("Location sharing  •  Off","Screen-time summary  •  Not enabled","App usage summary  •  Not enabled").forEach { item ->
            root.addView(text("  $item", 15f, ink).apply {
                setBackgroundColor(Color.WHITE)
                setPadding(dp(14), dp(14), dp(14), dp(14))
            }, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(8) })
        }
        root.addView(text("This prototype does not request permissions, monitor activity, or send data. Future sharing features will require clear explanation, Android permission prompts, and visible pause controls.", 13f, muted))
        setContentView(root)
    }
}
