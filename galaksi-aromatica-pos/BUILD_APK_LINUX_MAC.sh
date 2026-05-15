#!/usr/bin/env bash
set -e
echo "Build APK - Galaksi Aromatica POS by lutfiibnm"
npm install
npm run android:sync
cd android
./gradlew assembleDebug
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
