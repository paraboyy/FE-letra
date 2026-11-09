# PROJECT DETAIL — Letra Studio
## Pengembangan Frontend Sistem Informasi Manajemen Fotostudio Berbasis Web

**Versi:** 2.1.0 (Human-Crafted Luxury UI, Separated Authentication Portals & Backend Plug-and-Play Ready)  
**Framework:** Next.js 15 (App Router) + TypeScript  
**Styling:** CSS Modules + Custom Luxury Dark/Gold Design System  
**Arsitektur Integrasi:** Centralized API Client & Modular Service Layer  
**Backend Mode:** Siap dihubungkan ke Backend API eksternal (Laravel/Express/FastAPI/NestJS/dll) via `NEXT_PUBLIC_API_URL`

---

## 📌 Ringkasan Proyek

Sistem informasi manajemen foto studio berbasis web untuk **Letra Studio**, dengan antarmuka berstandar editorial luxury studio:
- **Portal Pelanggan** — Melihat profil studio & keunggulan, melihat paket foto editorial, galeri lookbook karya, reservasi interaktif 4-langkah, pelacakan status reservasi realtime, riwayat pemesanan, serta autentikasi akun pelanggan.
- **Dashboard Admin/Staff** — Portal login khusus admin, dashboard metrik KPI, manajemen reservasi & ubah status realtime, direktori pelanggan, katalog paket foto, kalender jadwal fotografer mingguan, buku kas transaksi & verifikasi pembayaran, serta analitik laporan omset.

---

## 🔐 Pemisahan Halaman Autentikasi (Auth) & Proteksi Rute (Route Guard)

Sistem membedakan portal login antara **Pelanggan** dan **Staf Admin**, serta dilengkapi **Route Guard & Role Protection** otomatis:

| Portal | URL | Hak Akses | Deskripsi |
|---|---|:---:|---|
| **Login Pelanggan** | `/auth/login` | Publik | Portal masuk untuk klien mengelola reservasi dan galeri foto pribadi (auto-redirect jika sudah login). |
| **Pendaftaran Pelanggan** | `/auth/register` | Publik | Halaman pendaftaran akun baru untuk klien baru (auto-redirect jika sudah login). |
| **Riwayat Sesi Saya** | `/history` | Pelanggan / Terautentikasi | Halaman riwayat pemesanan klien (auto-redirect ke `/auth/login` jika belum login). |
| **Login Admin & Staf** | `/admin/login` | Publik | Portal masuk khusus staf studio & admin (auto-redirect ke dashboard jika sudah login). |
| **Workspace Admin** | `/admin/*` | Admin & Staf Saja | Area terproteksi penuh. Pengunjung yang belum login otomatis diarahkan ke `/admin/login`. Akun pelanggan dilarang mengakses (*Access Denied*). |
| **Fitur Khusus Admin** | `/admin/packages`, `/photographers`, `/reports` | Admin Saja | Dibatasi secara eksplisit. Akun Staf diberikan kartu notifikasi pembatasan wewenang. |

### Mekanisme Proteksi Rute (Route Guard)
1. **Unauthenticated Guard (`AdminLayout.tsx` & `/history`):** Memastikan pengunjung yang belum terautentikasi tidak dapat mengakses halaman dan tidak memicu panggilan API tanpa token JWT. Pengguna langsung dialihkan ke portal login yang relevan.
2. **Role-Based Guard:** Memisahkan hak akses antara `customer`, `staff`, dan `admin`. Akun pelanggan yang mencoba mengakses URL `/admin/*` akan dicegat dengan tampilan proteksi *Akses Terbatas*.
3. **Backend API Scope & Guard:** Endpoint API `/reservations` membatasi data reservasi pelanggan hanya untuk email pemilik akun, dan endpoint admin memverifikasi token dan hak peran melalui middleware `authenticateToken` dan `requireRoles`.

---

## 📅 Fitur Jadwal Studio & Integrasi Google Calendar (Role Admin & Staff)

Halaman Jadwal Roster Studio (`/admin/schedule`) dirancang untuk dapat diakses oleh **Admin** maupun **Staff** guna mengawasi ketersediaan studio dan fotografer secara realtime:

1. **Filter Fleksibel Fotografer:**
   - Admin/Staff dapat memfilter jadwal berdasarkan fotografer spesifik atau menampilkan seluruh fotografer dalam satu matriks mingguan/bulanan.
2. **Sinkronisasi Google Calendar (1-Click Intent Web):**
   - Setiap sesi pemotretan yang diklik menyediakan tombol direct link `+ Tambah ke Google Calendar`. Link ini membuka antarmuka pembuatan acara Google Calendar resmi dengan tanggal, jam, durasi, nama klien, paket foto, dan lokasi studio yang sudah terisi otomatis.
3. **Ekspor Berkas iCalendar (.ics) Universal:**
   - **Per Sesi:** Admin/Staff dapat mengunduh berkas `.ics` per sesi untuk kalender fotografer atau klien.
   - **Batch Roster Export:** Menyediakan tombol ekspor seluruh jadwal fotografer aktif di periode terpilih ke dalam 1 berkas `.ics` terpadu untuk diimpor sekaligus ke Google Calendar, Outlook, maupun Apple Calendar.
4. **Efisiensi Database:**
   - Dengan menyimpan salinan jadwal pemotretan ke Google Calendar fotografer/klien, tim studio tidak perlu terus-menerus membebani server database lokal untuk query jadwal harian atau arsip histori lampau.
5. **Kesiapan Otomatisasi API Cloud (Google Cloud Platform):**
   - Google Calendar API resmi memiliki **kuota gratis hingga 1.000.000 permintaan/hari (Free Tier)**. Sistem telah disiapkan untuk dihubungkan dengan Google Cloud Service Account apabila ingin otomatisasi dua arah di masa depan.

---

## 🔌 Panduan Untuk Developer Backend (BE)

Jika teman Anda sedang membuat API Backend, frontend ini telah siap menerima data secara instan. Berikut adalah panduan langkahnya:

### 1. Hubungkan URL Backend
Cukup isi file `.env.local` pada root project `letra-studio/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
*(Ganti dengan URL server backend teman Anda, misal `http://127.0.0.1:8000/api`)*.

### 2. Format Response Standar yang Diharapkan Frontend

#### Response Sukses (`HTTP 200 OK` / `HTTP 201 Created`):
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": { ... } // Dapat berupa objek ataupun array
}
```

#### Response Error (`HTTP 400`, `401`, `404`, `500`):
```json
{
  "success": false,
  "message": "Pesan error untuk user",
  "errors": {
    "email": ["Email tidak valid"]
  }
}
```

### 3. Daftar Endpoint API yang Digunakan Frontend

| Modul | Method & Path | Digunakan Oleh Halaman FE | Keterangan |
|---|---|---|---|
| **Auth** | `POST /auth/login` | `/auth/login` & `/admin/login` | Login user, mengembalikan `{ id, name, email, role, token }` |
| **Auth** | `POST /auth/register` | `/auth/register` | Registrasi pelanggan baru |
| **Paket** | `GET /packages` | `/`, `/packages`, `/reservation`, `/admin/packages` | Ambil semua paket foto (filter: `category`, `search`) |
| **Paket** | `GET /packages/:id` | `/packages/[id]` | Detail paket foto |
| **Paket** | `POST /packages` | `/admin/packages` | Tambah paket baru |
| **Paket** | `PUT /packages/:id` | `/admin/packages` | Update paket |
| **Paket** | `DELETE /packages/:id` | `/admin/packages` | Hapus paket |
| **Reservasi** | `GET /reservations` | `/history`, `/admin/reservations`, `/admin/dashboard`, `/admin/schedule` | Ambil daftar reservasi (filter: `status`, `search`) |
| **Reservasi** | `GET /reservations/:id` | `/reservation/status` | Tracking status reservasi by ID |
| **Reservasi** | `POST /reservations` | `/reservation` | Pembuatan booking baru oleh pelanggan |
| **Reservasi** | `PATCH /reservations/:id/status` | `/admin/reservations` | Ubah status (`pending`, `confirmed`, `completed`, `cancelled`) |
| **Reservasi** | `DELETE /reservations/:id` | `/admin/reservations` | Hapus reservasi |
| **Pelanggan** | `GET /customers` | `/admin/customers`, `/admin/dashboard` | Daftar direktori pelanggan |
| **Fotografer** | `GET /photographers` | `/reservation`, `/admin/photographers`, `/admin/schedule` | Roster fotografer & jadwal kerja |
| **Transaksi** | `GET /transactions` | `/admin/transactions` | Daftar transaksi & pembayaran |
| **Transaksi** | `PATCH /transactions/:id/verify` | `/admin/transactions` | Verifikasi pembayaran DP / lunas |
| **Laporan** | `GET /reports/dashboard` | `/admin/dashboard`, `/admin/reports` | Ringkasan metrik KPI studio |
| **Laporan** | `GET /reports/revenue` | `/admin/dashboard`, `/admin/reports` | Data omset bulanan |
| **Laporan** | `GET /reports/packages` | `/admin/reports` | Performa kontribusi per paket |
| **Studio** | `GET /studio/services` | `/` | Daftar keunggulan studio |
| **Studio** | `GET /studio/testimonials` | `/` | Testimoni ulasan klien |

---

## 🗂️ Struktur File Penting

```
letra-studio/
├── .env.example                 # Contoh variabel environment
├── PROJECT_DETAIL.md            # Dokumentasi ini
├── components/
│   ├── shared/
│   │   └── Icons.tsx            # Set Icon SVG presisi (pengganti emoji)
│   ├── customer/
│   │   ├── Navbar.tsx           # Navigasi publik
│   │   └── Footer.tsx           # Footer studio
│   └── admin/
│       └── AdminLayout.tsx      # Sidebar & header admin
├── lib/
│   ├── types.ts                 # TypeScript model & contract interface
│   ├── api.ts                   # Fetch client dengan auto bearer token
│   ├── mockStore.ts             # In-memory store untuk mock API
│   └── services/                # Modular API services
├── app/
│   ├── (customer)/              # Halaman portal pelanggan
│   │   ├── page.tsx             # Landing page
│   │   ├── packages/page.tsx    # Halaman paket & harga
│   │   ├── portfolio/page.tsx   # Lookbook karya
│   │   ├── reservation/page.tsx # Multi-step booking
│   │   ├── reservation/status/page.tsx # Status tracking
│   │   └── history/page.tsx     # Riwayat reservasi
│   ├── auth/
│   │   ├── login/page.tsx       # Login PELANGGAN
│   │   └── register/page.tsx    # Register PELANGGAN
│   └── admin/
│       ├── login/page.tsx       # Login KHUSUS ADMIN & STAF
│       ├── dashboard/page.tsx   # Dashboard analitik
│       ├── reservations/page.tsx # Manajemen reservasi
│       ├── customers/page.tsx   # Manajemen pelanggan
│       ├── packages/page.tsx    # Manajemen paket
│       ├── schedule/page.tsx    # Jadwal studio & roster fotografer (Filter per fotografer, Google Calendar 1-Click Sync & .ICS Batch Export)
│       ├── transactions/page.tsx # Manajemen transaksi
│       ├── photographers/page.tsx # Roster fotografer
│       └── reports/page.tsx     # Laporan keuangan
```

---

## 🚀 Cara Menjalankan

```bash
# Masuk ke direktori
cd letra-studio

# Jalankan server
npm run dev

# Akses via browser:
# Pelanggan: http://localhost:3000
# Login Pelanggan: http://localhost:3000/auth/login
# Login Admin: http://localhost:3000/admin/login
# Dashboard Admin: http://localhost:3000/admin/dashboard
```
