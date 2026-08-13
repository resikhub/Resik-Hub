# RESIK Hub — Live Test Frontend

Frontend statis tanpa framework/build step. Bisa langsung dibuka di browser.

## Struktur utama
- `index.html` — landing page
- `login.html` — pilih Warga/Admin
- `dashboard-warga.html` — Home Warga
- `riwayat-penukaran.html` — Riwayat + Tukar Poin Lainnya
- `reward.html` — Reward/Katalog Hadiah
- `transaksi-baru.html` — Pindai QR + transaksi baru
- `sampah.html` — kategori sampah
- `profil.html` — profil, ID Digital, Skor Hijau, Pencapaian
- `peringkat-desa.html` — ranking desa
- `dashboard-admin.html` — dashboard Admin
- `css/style.css` — seluruh styling responsive
- `js/app.js` — navigasi, role login, localStorage, reward

## Flow yang sudah terhubung
Landing → Login
Login Warga → Dashboard Warga
Login Admin → Dashboard Admin
Dashboard → Tambah Sampah/Pindai QR → Transaksi Baru
Dashboard → Riwayat → Tukar Poin Lainnya → Reward
Dashboard → Sampah → Kategori Sampah
Dashboard → Profil → Skor Hijau → Riwayat
Profil → Pencapaian → Peringkat Desa

## Testing
Buka `index.html` langsung di Chrome/Edge/Firefox. Semua halaman memakai path relatif dan tidak membutuhkan server/backend.

Untuk testing lebih nyaman:
- VS Code + Live Server, atau
- Python: `python -m http.server 5500`

Catatan: QR camera pada versi ini adalah simulasi UI; backend/QR scanner asli membutuhkan API/server dan permission kamera.

## Kamera QR Asli
Halaman `transaksi-baru.html` sudah menggunakan kamera perangkat secara langsung.
- Jalankan melalui **localhost** (mis. VS Code Live Server) atau **HTTPS**.
- Izinkan permission kamera ketika browser memintanya.
- Kamera belakang diprioritaskan pada HP.
- Browser modern dengan `BarcodeDetector` akan memakai scanner native.
- Browser tanpa `BarcodeDetector` memakai fallback `jsQR` dari CDN.
- Format QR fleksibel: `CIT-8829-X`, `CIT-8829-X|Ahmad Subarjo`, JSON seperti `{"id":"CIT-8829-X","name":"Ahmad Subarjo"}`, atau URL dengan parameter `id`/`name`.
