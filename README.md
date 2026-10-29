# DEPARTEMEN ENERGY CONSERVATION - WEB PROFILE EXPERIENCE

Dokumentasi serah terima (*handover documentation*) untuk Tim IT Perusahaan.

---

## 📌 Ringkasan Proyek
Halaman profil interaktif untuk **Departemen Energy Conservation**. Didesain dengan alur *storytelling scroll journey* (tanpa navbar atas) agar dapat langsung diintegrasikan ke dalam menu internal portal web perusahaan tanpa bertabrakan dengan navigasi utama.

### Fitur Utama:
- **No-Navbar Layout**: Disesuaikan khusus untuk *in-app/portal navigation*.
- **Scroll Progress Indicator**: Bar indikator progres pembacaan di bagian atas.
- **Floating Chapter Navigator**: Titik navigasi pintar di sisi kanan untuk lompat cepat antarbab (*quick-jump*) + tombol *Back to Top*.
- **Cinematic Pinned Stage**: Hero stage yang di-pin sepanjang ±3.6 layar dengan 6 adegan animasi berurutan (GSAP ScrollTrigger).
- **Scope Implementasi Bergambar**: Tiga pilar utama — Energy Source (100% REC PLN), Solar PV Rooftop, dan Efisiensi Program — masing-masing dengan foto dokumentasi dan metrik kapasitas.
- **Dynamic Timeline Line**: Garis rekam jejak yang menyala dan memanjang mengikuti scroll pengguna.
- **Galeri Dokumentasi & Lightbox Modal**: Enam kartu resmi — Green Energy Partnership, Trofi REC PLN, ISO 50001, MCAP, POME 2025, dan Training Energy Awareness — dengan filter kategori (Penghargaan / Sertifikat / Kegiatan) dan pop-up pratinjau resolusi tinggi.
- **Animated Impact Counters**: Metrik pencapaian yang menghitung otomatis saat terlihat di layar (mendukung nilai desimal & pemisah ribuan).
- **Smooth Scroll**: Lenis 1.1.18 yang disinkronkan dengan GSAP ticker.

---

## 📂 Struktur File
```text
energy-conservation-dept/
│
├── index.html          # Struktur utama halaman profil
├── style.css           # Desain visual, layout grid, dan animasi
├── script.js           # Engine interaksi (scroll observer, counters, modal, filter)
│
├── doc-iso.jpg         # Foto penyerahan ISO 50001 (background Closing)
├── doc-rec.jpg         # Foto serah terima sertifikat REC PLN (Pilar 01)
├── doc-audit.jpg       # Foto inspeksi panel PV (Pilar 02)
├── doc-workshop.jpg    # Foto workshop edukasi (Pilar 03)
├── achievements.jpg    # Infografis capaian (belum dipakai di halaman)
│
├── assets/
│   ├── penghargaan/
│   │   ├── Green Energy Partnership by PLN.jpg   # Kartu Galeri 01
│   │   └── REC by PLN.jpg                        # Kartu Galeri 02
│   ├── sertifikat/
│   │   ├── iso 50001.jpg                         # Kartu Galeri 03
│   │   ├── mcap.png                              # Kartu Galeri 04
│   │   └── pome 2025.jpg                         # Kartu Galeri 05
│   └── kegiatan/
│       └── Training Energy Awereness.jpg         # Kartu Galeri 06
│
└── README.md           # Petunjuk implementasi teknis untuk Tim IT
```

> Nama file di `assets/` memakai spasi. Di HTML selalu tulis sebagai `%20`, contoh: `assets/sertifikat/pome%202025.jpg`.

---

## 🚀 Petunjuk Integrasi untuk Tim IT

### Opsi 1: Integrasi via Iframe (Direkomendasikan untuk Portal Intranet)
Jika portal web perusahaan menggunakan dashboard atau CMS modular:
```html
<iframe 
  src="/path-to-folder/index.html" 
  width="100%" 
  height="100vh" 
  style="border: none; min-height: 100vh; width: 100%; display: block;"
  loading="lazy"
  title="Profil Departemen Energy Conservation">
</iframe>
```

### Opsi 2: Standalone URL / Routing
Cukup letakkan seluruh isi folder ini ke direktori web server (Apache, Nginx, IIS, atau folder `public`/`dist` pada framework web):
- Contoh path: `https://portal.perusahaan.com/departemen/energy-conservation/`

### Opsi 3: Integrasi ke Framework (React / Next.js / Vue / Laravel)
- Pindahkan file gambar ke folder `public/assets/`.
- Salin CSS ke stylesheet modular atau global CSS.
- Logika JavaScript pada `script.js` menggunakan standar DOM API `document.addEventListener('DOMContentLoaded')` dan `IntersectionObserver` sehingga dapat dipindahkan ke hook `useEffect()` atau `onMounted()`.

---

## 🛠️ Panduan Kustomisasi Konten

1. **Mengubah Angka Metrik (Chapter 6)**:
   Di `index.html` cari kelas `.num-value`. Angka dan satuan dipisah dua `<span>` agar satuan bisa tampil lebih kecil:
   ```html
   <div class="num-value" data-target="100" data-suffix="%">
     <span class="nv-num">0</span><span class="nv-suffix">%</span>
   </div>
   ```
   Cukup ubah `data-target` dan `data-suffix` — teks `.nv-suffix` akan disinkronkan otomatis oleh `script.js`. Atribut opsional: `data-decimals="1"` (desimal) dan `data-sep=","` (pemisah ribuan/desimal gaya Indonesia).

2. **Menambah/Mengganti Foto Dokumentasi (Chapter 5)**:
   Gambar galeri diambil dari folder `assets/`. Ganti file dengan nama yang sama, atau perbarui tag `<img>` dan atribut data di `.gallery-card`:
   ```html
   <div class="gallery-card" data-category="cert" data-title="Judul Baru" data-badge="Label Lightbox" data-desc="Keterangan foto...">
     <div class="gcard-img-wrap is-doc">
       <img src="assets/sertifikat/nama-baru.jpg" alt="..." loading="lazy" />
     </div>
   </div>
   ```
   - `data-category`: `award` (Penghargaan) · `cert` (Sertifikat) · `activity` (Kegiatan).
   - Tambahkan kelas `is-doc` pada `.gcard-img-wrap` untuk sertifikat/trofi/scan agar tampil utuh (`object-fit: contain`), bukan terpotong. Untuk foto kegiatan/lapangan, biarkan tanpa `is-doc` agar memenuhi kartu (`object-fit: cover`).
   - Bila menambah kartu baru, pastikan tombol filter di atas grid tetap sesuai kategori yang tersedia.

3. **Mengubah Scope Implementasi (Chapter 3)**:
   Setiap pilar adalah `.scope-acc` (akordeon) di dalam `#scopeAccordion`. Item yang sedang fokus otomatis terbuka lewat ScrollTrigger; saat sudah terlewati, item kembali menjadi baris ringkas.
   - Kepala baris: `.scope-acc-kicker` (label kecil), `.scope-acc-name` (judul), `.scope-acc-summary` (ringkasan kanan).
   - Panel detail: `.scope-detail-media` (foto + `.scope-media-badge` + `.scope-media-stat`) dan `.scope-detail-body` (`.scope-desc`, `.scope-sites`, `.scope-foot`).
   - Untuk mengubah kapasitas Solar PV, cari `.scope-metric` dan sesuaikan isi `.scope-metric strong`.
   - Tambah/hapus pilar: duplikasi satu `<article class="scope-acc">` dan pastikan `aria-controls` serta `id` panel (`scope-panel-N`) tetap unik.

---

## 📞 Spesifikasi & Kompatibilitas
- **Browser Support**: Chrome, Edge, Safari, Firefox, Opera (versi modern desktop & mobile).
- **Responsive**: Otomatis beradaptasi pada resolusi Layar Desktop (1920px, 1440px), Laptop (1280px), Tablet (768px), dan Smartphone (375px+).
- **Dependensi Eksternal** (via CDN, pin versi tetap):
  - GSAP 3.12.5 & ScrollTrigger — engine animasi scroll.
  - Lenis 1.1.18 — smooth scroll.
  - Google Fonts (Plus Jakarta Sans).
- **Aksesibilitas**: Menghormati `prefers-reduced-motion` — animasi intro dan scrub dinonaktifkan bagi pengguna yang mematikan animasi.
- **Security**: Tidak menggunakan `eval()`; tidak ada script eksternal selain tiga library di atas dan Google Fonts.
