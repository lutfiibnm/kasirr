# Galaksi Aromatica POS - Revisi Layout Final

Perubahan revisi:

- Admin dan kasir digabung menjadi 1 akun Operator.
- Layout tidak tabrakan lagi: setiap fitur punya halaman full sendiri.
- Halaman POS hanya berisi pilih menu, order type, nomor meja, keranjang, dan pembayaran.
- Tombol Simpan di POS dihapus karena membingungkan.
- Pembayaran punya 2 metode: Cash dan QRIS.
- QRIS muncul hanya saat tombol Bayar ditekan, dalam popup/modal QRIS.
- Setelah simulasi QRIS masuk, invoice langsung tercetak otomatis.
- Setelah pembayaran Cash berhasil, invoice langsung tercetak otomatis.
- Invoice dinamis mengikuti pesanan asli di keranjang.
- Riwayat transaksi mulai dari 0.
- Laporan penjualan mulai dari 0 dan baru terisi setelah transaksi.
- Menu bisa tambah, edit, hapus, dan upload/ubah gambar.
- Print hanya mencetak struk, bukan seluruh halaman aplikasi.

## Login

PIN demo:

```txt
1111
```

## Jalankan Web

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:5173/
```

## Build Android

```bash
npm run build
npm run android:sync
npm run android:open
```

Di Android Studio:

```txt
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

Hasil APK debug biasanya ada di:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## Upload ke GitHub

```bash
git init
git add .
git commit -m "Revisi final Galaksi Aromatica POS"
git branch -M main
git remote add origin https://github.com/USERNAME/galaksi-aromatica-pos.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.
