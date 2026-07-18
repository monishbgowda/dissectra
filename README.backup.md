# Dissectra

Dissectra is an AI-powered Android application that combines image capture, backend AI analysis, and interactive 3D anatomy model viewing. This repository includes the React Native mobile app and the Express backend used for AI processing.

## Key Highlights

- Android-only React Native app built with React Native 0.85.2 and React 19.2.3
- Signed release APK ready for installation without Metro or `npm start`
- Backend AI analysis service with Gemini-compatible integration
- Local scan history, image upload, and 3D model viewer support
- Release-ready build configuration and signing workflow

## Repository Contents

- `android/` — Android native project and Gradle build configuration
- `backend/` — Express server and AI analysis backend
- `src/` — React Native source files, screens, services, and UI components
- `App.tsx` — React Native app entry point
- `package.json` — app dependencies and scripts
- `README.md` — this file
- `USER_GUIDE.md` — app usage guide
- `RELEASE_NOTES.md` — release summary and validation notes

## Release APK

The signed Android release APK is available as `Dissectra-release.apk` in the repo root. This APK is a signed release build and does not require `npm start`, Metro, or a development server on the device.

> Recommended: Upload the APK as a GitHub Release asset for the best mobile install experience. GitHub Release assets avoid raw repository download issues and work more reliably on Android.

## Install on Android

1. Download `Dissectra-release.apk` from the GitHub release or repository asset.
2. Open device settings and allow installs from unknown sources for your browser or file manager.
3. Tap the APK file to install.
4. Launch Dissectra from your app drawer.

## Requirements

- Node.js 20+ or compatible LTS
- Java JDK 17
- Android SDK with API 33 / 34 installed
- Android device or emulator running Android 7.0+ (API 24+)

## Local Development

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy example environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. Add backend secrets to `backend/.env`.

5. Start the backend server:

```bash
npm run backend
```

6. Start Metro (development packager):

```bash
npm start
```

7. Run the app on Android device/emulator:

```bash
npm run android
```

## Build a Signed Release APK

The project already includes release signing configuration in `android/app/build.gradle` and `android/gradle.properties`. To build the signed APK locally:

```bash
cd android
./gradlew assembleRelease
```

The built APK will be available at `android/app/build/outputs/apk/release/app-release.apk`.

## Project Scripts

- `npm start` — start Metro bundler
- `npm run android` — install and launch on Android emulator/device
- `npm run backend` — start Express backend server
- `npm test` — run Jest tests
- `npm run typecheck` — run TypeScript type checking

## Notes

- This repository is currently focused on Android deployment.
- The installed `Dissectra-release.apk` is a production-ready signed release build.
- The Android app communicates with the backend for AI analysis and model generation.

## Troubleshooting

- If installation fails, ensure the device allows unknown-source installs.
- If the APK download seems broken, use the GitHub Release asset instead of raw file downloads.
- Make sure the Android device has enough free storage space.

## Contribution

Contributions are welcome. For changes to the Android app or backend, open a pull request with a clear description of the fix or enhancement.

## License

This repository does not specify a license file. Add a license if you want to publish or share this code publicly.
