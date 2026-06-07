# KSP Digital — Sistem Unggah & Penilaian Dokumen Pembelajaran

Aplikasi ini telah direstrukturisasi agar frontend dapat di-hosting di **Vercel** (atau hosting statis lainnya) dan backend tetap menggunakan **Google Apps Script** (GAS) sebagai API. Ini memisahkan antarmuka web (frontend) dari pengelolaan penyimpanan (Google Drive) dan database (Google Sheets) secara profesional.

---

## Struktur Proyek

```
KSPdigital/
├── index.html           → Entry point halaman web statis
├── css/
│   └── styles.css       → CSS stylesheet premium (tema oranye)
├── js/
│   ├── api.js           → API wrapper (fetch ke GAS Web App URL)
│   └── app.js           → Controller dan logika JavaScript sisi klien
├── gas/
│   ├── Main.gs          → Endpoint API POST (doPost)
│   ├── SheetService.gs  → CRUD operasi Google Sheets (Guru, Submissions)
│   ├── DriveService.gs  → Upload file PDF ke Google Drive
│   └── AuthService.gs   → Autentikasi login asesor
├── README.md            → Panduan penyebaran ini
└── design.md            → Referensi token desain (Typeface 75)
```

### Arsitektur Backend (Server-less via Google Apps Script)

Backend menggunakan arsitektur Service Layer yang dipanggil melalui endpoint `doPost` di `Main.gs`:
- File-file `.gs` harus disalin ke project Google Apps Script.
- Semua pemanggilan menggunakan metode POST dengan format payload: `{ "action": "functionName", "data": {...} }`.

### Arsitektur Frontend (Vercel-Ready Static Web)

Frontend adalah website statis murni yang tidak bergantung pada templating Apps Script (`<?!= ?>`):
- `index.html` menyertakan file menggunakan `<link rel="stylesheet">` dan `<script src="...">`.
- `api.js` memfasilitasi komunikasi `fetch` ke URL Web App Apps Script, serta menangani *Mock Mode* untuk testing secara lokal tanpa server.

---

## Langkah-Langkah Penyebaran (Deployment)

Proses deployment terbagi dua: Deployment Backend (API) ke Google, dan Deployment Frontend ke Vercel.

### TAHAP 1: Deployment Backend (Google Apps Script)

1. Buka [script.google.com](https://script.google.com) dan klik **New Project**. Beri nama **KSP Digital API**.
2. Buat file-file berikut di dalam editor script dan copy isinya dari folder `gas/`:
   - `Main.gs` (rename dari Code.gs default)
   - `SheetService.gs`
   - `DriveService.gs`
   - `AuthService.gs`
3. Simpan proyek (`Ctrl + S`).
4. Klik **Deploy** → **New deployment**.
5. Klik ikon gerigi (**Select type**) → pilih **Web app**.
6. Konfigurasi:
   - **Description**: KSP Digital API.
   - **Execute as**: **Me (emailanda@gmail.com)**.
   - **Who has access**: **Anyone**.
7. Klik **Deploy**. Lakukan otorisasi jika diminta (Advanced -> Go to KSP Digital API).
8. Salin **Web App URL** yang dihasilkan. Ini adalah endpoint API Anda.

### TAHAP 2: Konfigurasi Frontend

1. Buka file `js/api.js` menggunakan text editor.
2. Temukan variabel `GAS_WEB_APP_URL` di bagian atas file:
   ```javascript
   const GAS_WEB_APP_URL = "ISI_DENGAN_WEB_APP_URL_YANG_ANDA_SALIN";
   ```
3. Ganti value kosong tersebut dengan URL yang Anda salin dari Tahap 1.
4. Simpan file `api.js`.

### TAHAP 3: Deployment Frontend (Vercel)

1. Buat repository baru di akun GitHub Anda (misal: `ksp-digital`).
2. Upload seluruh file di folder `KSPdigital` (termasuk folder `css`, `js`, `index.html`) ke repository tersebut. (Folder `gas` boleh ikut di-upload sebagai dokumentasi).
3. Login ke [Vercel](https://vercel.com/) menggunakan akun GitHub.
4. Klik **Add New...** → **Project**.
5. Import repository `ksp-digital` yang baru Anda buat.
6. Biarkan setelan "Framework Preset" sebagai `Other` dan "Root Directory" default.
7. Klik **Deploy**.
8. Setelah selesai, Vercel akan memberikan URL publik (misal: `https://ksp-digital.vercel.app`). Anda dan guru-guru sudah bisa mengakses aplikasi KSP Digital.

---

## Mock Mode (Uji Coba Lokal Offline)

Aplikasi memiliki fitur "Mock Mode" (Mode Simulasi) untuk development.
- Mock mode akan aktif secara otomatis jika aplikasi dijalankan langsung dengan protokol `file://` di browser komputer lokal.
- Mode ini menggunakan `localStorage` browser. Data unggahan tidak dikirim ke Google Sheet, tetapi disimpan sementara di browser, jadi Anda bisa mencoba fitur Upload File, Tab Asesor, Penilaian, dll tanpa perlu mengkonfigurasi Google Apps Script sama sekali.
- Username/Password untuk login asesor lokal: `admin` / `admin` atau `asesor` / `kspwadaslintang`.

---

## Akun Asesor Produksi

Kredensial produksi dapat diubah via **Script Properties** di Google Apps Script editor (`Project Settings` -> `Script Properties`):
- Parameter: `ASESOR_USERNAME` dan `ASESOR_PASSWORD`.
- Jika belum di set, default yang dipakai adalah `asesor` / `kspwadaslintang`.
