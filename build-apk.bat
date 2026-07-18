@echo off
REM Build Release APK for Dissectra
REM This will create an installable APK file

echo ==========================================
echo Building Dissectra Release APK
echo ==========================================
echo.

REM Ensure Metro is running (optional - for bundle generation)
echo Step 1: Generating JS bundle...
cd android
.
\gradlew.bat assembleRelease --console=plain 2>&1

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo BUILD SUCCESSFUL!
echo ==========================================
echo.
echo APK location:
echo   android\app\build\outputs\apk\release\app-release.apk
echo.
echo To install on your phone:
echo   1. Enable USB debugging on your phone
echo   2. Connect phone via USB
echo   3. Run: adb install android\app\build\outputs\apk\release\app-release.apk
echo.
echo OR copy the APK to your phone and install directly.
echo.
pause
