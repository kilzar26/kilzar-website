# KRAI Casebook for Android

This is a Trusted Web Activity generated from the live `/casebook/manifest.webmanifest`. Package ID: `com.kilzartech.casebook`. It opens the Casebook PWA at `https://kilzartech.com/casebook/`.

## Build

Install JDK 17, Android SDK, and Bubblewrap CLI. Set `JAVA_HOME` and `ANDROID_HOME`. In this directory run `bubblewrap build`. Signing requires `android.keystore` and the upload key password; both are intentionally excluded from Git. On the K8 build machine they are under `C:\Users\KRAI\Documents\Codex\casebook-android\app\android.keystore` and `C:\Users\KRAI\Documents\Codex\casebook-android\upload-key-password.dpapi` (the latter decrypts only for the K8 Windows account). Back these up securely before relying on this key for Play releases.

The signed bundle is `app-release-bundle.aab`; the APK is `app-release-signed.apk`. Do not publish the APK as the Play Store release. The website's `.well-known/assetlinks.json` binds this package to the upload certificate. If Google Play App Signing supplies a different app signing certificate, add its SHA-256 fingerprint to that file before the Play release.

## Release prerequisites

Complete the Kilzar Technologies organization Play Console verification, create the app listing, supply screenshots and policy declarations, configure Play App Signing, upload the AAB to a test track, then verify the installed app and domain association on a device. This wrapper has no billing or paid plan. Configure an approved payment flow and actual paid feature before describing it as monetized.
