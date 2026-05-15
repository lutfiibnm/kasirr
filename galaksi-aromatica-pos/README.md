# Galaksi Aromatica POS

Aplikasi kasir cafe modern untuk tablet, dibuat **by lutfiibnm**.

Stack:
- React + Vite + TypeScript
- Capacitor Android
- LocalStorage demo database
- Android package ID: `com.lutfiibnm.galaksiaromatica`

## Fitur yang sudah ada

- Login demo admin/kasir
- POS / kasir tablet landscape
- Dine In dan Take Away
- Nomor meja untuk Dine In
- Nama pelanggan
- Tambah item ke keranjang
- Tambah/kurang quantity
- Catatan item, misalnya less sugar
- Reset/simpan order
- Pembayaran tunai
- Simulasi QRIS masuk otomatis
- Notifikasi pembayaran QRIS masuk
- Print struk thermal
- Manajemen menu
- Tambah menu
- Edit menu
- Hapus menu
- Upload/ubah gambar menu dari file lokal
- Laporan penjualan
- Grafik penjualan sederhana
- Riwayat transaksi
- Pengaturan cafe
- Logo sketsa Galaksi Aromatica
- Nama aplikasi, shortcut, taskbar/launcher, manifest, dan Android ID sudah disamakan

## Login demo

```txt
Admin PIN : 1111
Kasir PIN : 2222
```

## Identitas aplikasi

Semua sudah dibuat konsisten:

```txt
Nama aplikasi Android : Galaksi Aromatica POS
Nama shortcut/PWA     : Galaksi Aromatica POS
Package/Application ID: com.lutfiibnm.galaksiaromatica
Credit                : by lutfiibnm
```

File yang mengatur identitas:

```txt
capacitor.config.ts
public/manifest.webmanifest
android/app/build.gradle
android/app/src/main/res/values/strings.xml
android/app/src/main/res/mipmap-*/ic_launcher.png
```

## Cara menjalankan web app di laptop

```bash
npm install
npm run dev
```

Buka alamat yang muncul, biasanya:

```txt
http://localhost:5173
```

## Cara build web production

```bash
npm run build
npm run preview
```

Build web sudah dites berhasil dengan perintah:

```bash
npm run build
```

## Cara sinkron ke Android

```bash
npm install
npm run android:sync
```

Perintah ini akan:

1. Build React/Vite ke folder `dist/`
2. Copy hasil build ke `android/app/src/main/assets/public`
3. Update konfigurasi Capacitor Android

## Cara bikin APK di Android Studio

1. Install **Android Studio**.
2. Buka Android Studio.
3. Pilih **Open**.
4. Pilih folder ini:

```txt
android/
```

5. Tunggu Gradle sync selesai.
6. Klik menu:

```txt
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

7. APK debug biasanya keluar di:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

Kalau mau langsung pakai terminal:

```bash
cd android
./gradlew assembleDebug
```

Untuk Windows:

```bat
cd android
gradlew.bat assembleDebug
```

Atau klik file:

```txt
BUILD_APK_WINDOWS.bat
```

## Catatan jujur soal APK

Source Android dan web build sudah disiapkan dan `npm run build` + `npx cap sync android` sudah berhasil.

Di environment pembuatan file ini, APK belum bisa dikompilasi langsung karena Gradle butuh download dari `services.gradle.org`, sedangkan environment tidak punya akses internet/Android SDK. Di laptop kamu, selama Android Studio dan internet aktif, project ini tinggal dibuka lalu build APK.

## Simulasi QRIS masuk

Di halaman POS:

1. Tambahkan menu ke keranjang.
2. Klik **Bayar / Pay**.
3. Pilih **Simulasi QRIS Masuk**.
4. Sistem akan membuat status QRIS pending sebentar.
5. Setelah sekitar 1 detik, notifikasi pembayaran masuk otomatis.
6. Struk muncul dengan status **LUNAS**.

Ini simulasi aman. Untuk QRIS asli tetap butuh payment gateway resmi seperti Midtrans/Xendit/DOKU/Duitku dan webhook.

## Cara upload ke GitHub dari awal

Buka terminal di folder project ini:

```bash
cd galaksi-aromatica-pos
```

Bersihkan file yang tidak perlu:

```bash
rm -rf node_modules
```

Inisialisasi Git:

```bash
git init
git add .
git commit -m "Initial commit Galaksi Aromatica POS"
```

Buat repository baru di GitHub dengan nama misalnya:

```txt
galaksi-aromatica-pos
```

Jangan centang README saat buat repo, karena README sudah ada di project.

Hubungkan ke GitHub:

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/galaksi-aromatica-pos.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.

## Cara update GitHub setelah ada perubahan

```bash
git add .
git commit -m "Update UI dan fitur POS"
git push
```

## Cara clone dari GitHub ke laptop lain

```bash
git clone https://github.com/USERNAME/galaksi-aromatica-pos.git
cd galaksi-aromatica-pos
npm install
npm run dev
```

## Struktur penting

```txt
src/main.tsx                         UI dan logic aplikasi
src/styles.css                       desain aplikasi
public/manifest.webmanifest          nama shortcut/PWA/icon
public/icon-192.png                  icon shortcut
public/icon-512.png                  icon shortcut besar
android/app/build.gradle             Android applicationId
android/app/src/main/res/values      nama app Android
android/app/src/main/res/mipmap-*    icon Android launcher
android/app/src/main/assets/public   hasil build web untuk APK
```
