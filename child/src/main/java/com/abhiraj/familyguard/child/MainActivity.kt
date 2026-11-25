package com.abhiraj.familyguard.child

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.graphics.Color
import android.widget.Button
import android.widget.CheckBox
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast

class MainActivity : Activity() {
    private val prefs by lazy { getSharedPreferences("familyguard_child_choices", MODE_PRIVATE) }
    private val selectedItems = linkedSetOf<String>()
    private val ink = Color.rgb(24, 35, 52)
    private val muted = Color.rgb(105, 119, 139)
    private val green = Color.rgb(38, 132, 108)
    private lateinit var selectedLabel: TextView

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    private fun label(value: String, size: Float = 14f, color: Int = muted, bold: Boolean = false) =
        TextView(this).apply {
            text = value
            textSize = size
            setTextColor(color)
            if (bold) setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(dp(4), dp(7), dp(4), dp(7))
        }

    private fun choice(title: String, detail: String, key: String, parent: LinearLayout) {
        val item = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), dp(8), dp(12), dp(8))
            setBackgroundColor(Color.WHITE)
        }
        val check = CheckBox(this).apply {
            text = title
            textSize = 15f
            setTextColor(ink)
            isChecked = prefs.getBoolean(key, false)
            setOnCheckedChangeListener { _, checked -> prefs.edit().putBoolean(key, checked).apply() }
        }
        item.addView(check)
        item.addView(label(detail, 12f))
        parent.addView(item, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(8) })
    }

    private fun actionButton(title: String, onTap: () -> Unit) = Button(this).apply {
        text = title
        setOnClickListener { onTap() }
    }

    private fun pickDocument() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        }
        startActivityForResult(intent, 4101)
    }

    private fun pickFolder() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        }
        startActivityForResult(intent, 4102)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != RESULT_OK || data == null) return
        try {
            if (requestCode == 4101) {
                val clip = data.clipData
                if (clip != null) {
                    for (i in 0 until clip.itemCount) rememberUri(clip.getItemAt(i).uri, data.flags)
                } else data.data?.let { rememberUri(it, data.flags) }
            } else if (requestCode == 4102) {
                data.data?.let { rememberUri(it, data.flags) }
            }
            refreshSelectedLabel()
        } catch (_: SecurityException) {
            Toast.makeText(this, "Android did not grant access to that selection.", Toast.LENGTH_LONG).show()
        }
    }

    private fun rememberUri(uri: Uri, flags: Int) {
        val readFlag = flags and Intent.FLAG_GRANT_READ_URI_PERMISSION
        if (readFlag != 0) contentResolver.takePersistableUriPermission(uri, readFlag)
        selectedItems.add(uri.toString())
        prefs.edit().putStringSet("selected_storage_uris", HashSet(selectedItems)).apply()
    }

    private fun clearSelectedItems() {
        selectedItems.forEach { value ->
            try {
                contentResolver.releasePersistableUriPermission(
                    Uri.parse(value),
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                )
            } catch (_: SecurityException) {
                // The provider may already have revoked this grant.
            }
        }
        selectedItems.clear()
        prefs.edit().remove("selected_storage_uris").apply()
        refreshSelectedLabel()
        Toast.makeText(this, "Selected file and folder access has been removed.", Toast.LENGTH_SHORT).show()
    }

    private fun refreshSelectedLabel() {
        selectedLabel.text = if (selectedItems.isEmpty()) {
            "No items selected. Selection is stored locally on this phone only."
        } else {
            "Selected on this phone: ${selectedItems.size} item(s). Nothing has been uploaded or shared with a parent."
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        selectedItems.addAll(prefs.getStringSet("selected_storage_uris", emptySet()) ?: emptySet())
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(22), dp(24), dp(22), dp(28))
            setBackgroundColor(Color.rgb(246, 248, 252))
        }
        root.addView(label("FamilyGuard", 29f, ink, true))
        root.addView(label("CHILD COMPANION  •  PRIVACY & CONSENT", 11f, green, true))
        root.addView(label("You stay in control of what you share.", 19f, ink, true))

        val intro = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(15), dp(12), dp(15), dp(12))
            setBackgroundColor(Color.WHITE)
        }
        intro.addView(label("Before you continue", 17f, ink, true))
        intro.addView(label("FamilyGuard lets you choose optional safety features. Each feature is separate and starts off unless you turn it on. Ticking the agreement below does not grant Android permissions.", 13f))
        root.addView(intro, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(14) })

        root.addView(label("TERMS & CONDITIONS", 12f, green, true).apply { setPadding(dp(4), dp(20), dp(4), dp(6)) })
        val terms = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(15), dp(12), dp(15), dp(12))
            setBackgroundColor(Color.WHITE)
        }
        terms.addView(label("1. You will be shown which information each enabled feature uses.\n2. Optional sharing can be switched off in this app.\n3. Android may show a separate system permission prompt. You can deny it.\n4. Selected files and folders stay on this phone in this prototype. They are not uploaded.\n5. FamilyGuard does not collect private browser search queries, messages, call logs, or scan all device storage.\n6. A parent dashboard connection is not active in this prototype.", 13f, ink))
        val agreement = CheckBox(this).apply {
            text = "I have read and understand these terms."
            textSize = 14f
            setTextColor(ink)
            isChecked = prefs.getBoolean("terms_accepted", false)
            setOnCheckedChangeListener { _, checked -> prefs.edit().putBoolean("terms_accepted", checked).apply() }
        }
        terms.addView(agreement)
        root.addView(terms)

        root.addView(label("CHOOSE FEATURES INDIVIDUALLY", 12f, green, true).apply { setPadding(dp(4), dp(20), dp(4), dp(6)) })
        choice("Location sharing", "Would share device location only after a separate Android location permission and a future secure connection.", "location_opt_in", root)
        choice("Screen-time summary", "Would share a limited screen-time total, not screen contents.", "screen_time_opt_in", root)
        choice("App usage summary", "Would share app names and usage duration after separate Android Usage Access approval.", "app_usage_opt_in", root)
        choice("Safe-browsing category alerts", "Category-level safety alerts only. No private search terms or full browsing history.", "safe_browsing_opt_in", root)
        choice("Selected storage items", "Only files or folders you choose below. No whole-device scan.", "storage_opt_in", root)

        root.addView(label("SELECT FILES OR FOLDERS", 12f, green, true).apply { setPadding(dp(4), dp(20), dp(4), dp(6)) })
        root.addView(actionButton("Choose individual file(s)", ::pickDocument))
        root.addView(actionButton("Choose a folder", ::pickFolder))
        selectedLabel = label("", 12f, muted)
        root.addView(selectedLabel)
        root.addView(actionButton("Remove access to selected items", ::clearSelectedItems))

        root.addView(actionButton("Save my choices") {
            if (!agreement.isChecked) {
                Toast.makeText(this, "Please read and accept the terms first.", Toast.LENGTH_LONG).show()
            } else {
                prefs.edit().putBoolean("consent_saved", true).apply()
                Toast.makeText(this, "Your choices are saved on this phone. No data was sent.", Toast.LENGTH_LONG).show()
            }
        })
        root.addView(label("Prototype status: local consent and file selection only. Parent syncing, location sharing, and usage reports are not connected yet. You can change these choices here at any time.", 12f, muted))
        refreshSelectedLabel()
        val scroll = ScrollView(this).apply { addView(root) }
        setContentView(scroll)
    }
}
