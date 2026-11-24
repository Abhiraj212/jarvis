# FamilyGuard Android

FamilyGuard is a transparent, consent-based family safety prototype with two separate Android apps:

- **FamilyGuard Parent**: parent-facing dashboard.
- **FamilyGuard Child**: child-facing transparency and sharing-controls screen.

## Current prototype status

This first build is a UI-only prototype. It does not request permissions, collect device activity, access location, read call logs, capture messages/searches, or transmit data. Dashboard statuses are clearly marked as not connected.

## Privacy and safety principles

- No hidden monitoring or stealth mode.
- Child-facing disclosure before any future data sharing.
- Android runtime permissions and visible controls for optional sharing.
- Data minimization, secure transport, deletion controls, and clear retention limits before adding a backend.
- No call-log, SMS, message-content, or private search-history collection.

## Build APKs

The GitHub Actions workflow **Build FamilyGuard Android APKs** builds two debug APKs:

- Parent: `parent/build/outputs/apk/debug/parent-debug.apk`
- Child: `child/build/outputs/apk/debug/child-debug.apk`

Push to `familyguard-android` or run the workflow manually from the Actions tab. Download the artifact named **FamilyGuard-Android-APKs**.

Build uses JDK 17, Android Gradle Plugin 8.6.1, Gradle 8.7, and Android SDK 35. Debug APKs are for testing, not Play Store release builds.
