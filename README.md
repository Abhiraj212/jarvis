# FamilyGuard Android

FamilyGuard is a transparent, consent-based family safety prototype with two separate Android apps:

- **FamilyGuard Parent**: parent-facing dashboard.
- **FamilyGuard Child**: child-facing disclosure, consent, and sharing preferences.

## Current build status

The Child app now includes:
- A terms and conditions disclosure with an explicit acknowledgement checkbox.
- Separate opt-in switches for location, screen-time summary, app-usage summary, safe-browsing category alerts, and selected storage items.
- Android's system document picker for selecting individual files and its folder picker for selecting a folder.
- Local-only storage of preferences and persistable URI read grants.

The file/folder selections are currently kept on the child device. **They are not uploaded or visible to the Parent app yet.** The other feature switches save preferences only; they do not activate tracking or request Android permissions. Parent-child pairing and backend syncing are not implemented.

## Privacy boundaries

- No hidden monitoring or stealth mode.
- No whole-device storage scan or unrestricted file access.
- No private browser search-query capture or full search-history copying.
- No call-log, SMS, or message-content collection.
- File and folder access is limited to items selected through Android's system picker.
- Android system permissions, when implemented for a feature, must be requested separately and can be denied or revoked.
- Future backend sharing must include secure transport, data minimization, deletion controls, and clear retention limits.

## Build APKs

The GitHub Actions workflow **Build FamilyGuard Android APKs** builds two debug APKs:

- Parent: `parent/build/outputs/apk/debug/parent-debug.apk`
- Child: `child/build/outputs/apk/debug/child-debug.apk`

Push to `familyguard-android` or run the workflow manually from the Actions tab. Download the artifact named **FamilyGuard-Android-APKs**.

Build uses JDK 17, Android Gradle Plugin 8.6.1, Gradle 8.7, and Android SDK 35. Debug APKs are for testing, not Play Store release builds.
