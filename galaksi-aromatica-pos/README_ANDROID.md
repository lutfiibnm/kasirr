# Galaksi Aromatica POS — Android Build

Project ini sudah dibungkus ke Android memakai Capacitor. Nama aplikasi di launcher: **Galaksi Aromatica POS**. Package name: `com.lutfiibnm.galaksiaromatica`. Branding aplikasi tetap memakai credit **by lutfiibnm**.

## Isi paket

- Source React/Vite POS
- Folder `android/` Capacitor
- Asset web production di `dist/`
- Asset Android di `android/app/src/main/assets/public`
- Icon dan splash screen sederhana bertema Galaksi Aromatica
- Schema database dan contoh webhook QRIS

## Cara build APK di laptop Windows

1. Install Node.js LTS.
2. Install Android Studio.
3. Buka Android Studio sekali, lalu install Android SDK yang diminta.
4. Extract ZIP ini.
5. Buka terminal di folder project.
6. Jalankan:

```bash
npm install
npm run android:sync
```

7. Buka Android project:

```bash
npm run android:open
```

8. Di Android Studio pilih:

```txt
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

9. File APK biasanya muncul di:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## Login demo

```txt
Admin PIN: 1111
Kasir PIN: 2222
```

## Catatan QRIS

QRIS di source ini masih mode arsitektur/sandbox. Untuk QRIS asli, hubungkan server function/webhook ke payment gateway resmi seperti Midtrans, Xendit, DOKU, Duitku, dan simpan secret key di environment variable. Jangan taruh secret key di frontend.

## Kenapa belum ada APK langsung?

Di environment pembuatan file ini tidak tersedia Android SDK dan Gradle tidak bisa mengunduh distribusi dari `services.gradle.org`, jadi APK tidak bisa dikompilasi langsung di sini. Project Android-nya sudah siap; tinggal build lewat Android Studio di laptop.
