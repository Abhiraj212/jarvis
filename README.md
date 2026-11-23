# JARVIS Android Dual-Device

Android app source for the JARVIS + ESP8266 setup.

## Devices
- Android 11: press-to-talk voice recognition and manual LIGHT ON/OFF controls. Offline speech depends on an installed offline recognition service and language pack.
- Android 2.3: manual UDP controls are intended to work; voice recognition is not guaranteed.

## Build
Pushes to `main` run GitHub Actions. Open the repository's **Actions** tab, select **Build JARVIS Android APK**, and download the `JARVIS-Android-debug-APK` artifact when the run succeeds.

The workflow uses JDK 17, Android SDK 35, and Gradle 8.7. The APK is a debug build, not a Play Store release.

## Connect to NodeMCU
1. Put the phone and NodeMCU on the same private hotspot/LAN.
2. Enter the correct broadcast IP (or NodeMCU local IP) in the app.
3. Enter the exact firmware `COMMAND_TOKEN`.
4. The app sends `TOKEN|LIGHT_ON` or `TOKEN|LIGHT_OFF` over UDP port 4210.

UDP send success is not confirmation that the NodeMCU received the command. The token is plaintext, not encryption. Do not use this app to switch household mains wiring; use a qualified electrician and proper isolation/fail-safe hardware.

## Limitations
- Press-to-talk only, no always-on wake word.
- Offline speech is best-effort and depends on the phone's recognition provider.
- Android 2.3 voice support is not guaranteed.
- No APK is committed to the repository; GitHub Actions creates it as an artifact.
