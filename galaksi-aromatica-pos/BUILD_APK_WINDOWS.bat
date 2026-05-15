@echo off
echo ========================================
echo Build APK - Galaksi Aromatica POS
echo by lutfiibnm
echo ========================================
call npm install
if errorlevel 1 goto error
call npm run android:sync
if errorlevel 1 goto error
cd android
call gradlew.bat assembleDebug
if errorlevel 1 goto error
echo.
echo APK selesai dibuat:
echo android\app\build\outputs\apk\debug\app-debug.apk
goto end
:error
echo.
echo Build gagal. Pastikan Android Studio, Android SDK, dan internet aktif.
:end
pause
