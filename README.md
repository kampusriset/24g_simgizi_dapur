# MBG Food Hub - SIM Gizi

MBG Food Hub adalah aplikasi Sistem Informasi Manajemen Gizi berbasis web untuk mengelola data dapur/penyedia makanan bergizi dan data mitra kerja sama. Project ini menggunakan PHP native sebagai backend, MySQL sebagai database, serta HTML, CSS, Bootstrap, Font Awesome, dan JavaScript untuk tampilan frontend.

## Fitur Utama

- Login admin dengan akun demo.
- Dashboard ringkasan data dapur dan mitra.
- Manajemen data dapur/penyedia.
- Manajemen data mitra kerja sama.
- Relasi dapur dengan mitra.
- Tambah, edit, hapus, cari, dan filter data.
- Backend API sederhana berbasis JSON.
- Tampilan responsif menggunakan Bootstrap.

## bahasa yang Digunakan

- PHP Native
- MySQL / MariaDB
- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3.3
- Font Awesome 6.5.2

## Struktur Folder

```text
simGizi_Dapur_4Thinkz_team/
├── backend/
│   ├── koneksi.php       # Konfigurasi koneksi database
│   ├── helpers.php       # Helper response JSON dan validasi input
│   ├── login.php         # Endpoint login
│   ├── dashboard.php     # Endpoint data dashboard
│   ├── dapur.php         # Endpoint CRUD data dapur
│   └── mitra.php         # Endpoint CRUD data mitra
├── database.sql          # Struktur dan data awal database
├── index.html            # Redirect ke halaman login
├── login.html            # Halaman login
├── dashboard.html        # Halaman dashboard
├── dapur.html            # Halaman manajemen dapur
├── mitra.html            # Halaman manajemen mitra
├── frontend.js           # Logic frontend dan integrasi API
├── style.css             # Styling utama aplikasi
└── README.md
```

## Persyaratan

Pastikan sudah tersedia:

- Web server lokal seperti XAMPP, Laragon, WAMP, atau Apache + PHP.
- PHP 7.4 atau versi lebih baru.
- MySQL atau MariaDB.
- Browser modern.
- Koneksi internet untuk memuat CDN Bootstrap dan Font Awesome.

## Cara Instalasi

1. Salin folder project ke direktori web server.

   Contoh untuk XAMPP:

   C:/xampp/htdocs/simGizi_Dapur_4Thinkz team

2. Jalankan Apache dan MySQL.

3. Import database dari file `database.sql`.

   Melalui phpMyAdmin:
   - Buka `http://localhost/phpmyadmin`
   - Pilih menu `Import`
   - Pilih file `database.sql`
   - Klik `Go`

   Atau melalui terminal:

   bash
   mysql -u root -p < database.sql

4. Sesuaikan konfigurasi database pada file `backend/koneksi.php`.

   Konfigurasi koneksi database:

   ```php
   $host = 'localhost';
   $user = 'simgizi_user';
   $pass = 'simgizi123';
   $db   = 'simgizi';
   ```

   Jika menggunakan XAMPP default, biasanya konfigurasi dapat diubah menjadi:

   ```php
   $host = 'localhost';
   $user = 'root';
   $pass = '';
   $db   = 'simgizi';
   ```

5. Buka aplikasi melalui browser.

   http://localhost/simGizi_Dapur_4Thinkz%20team/

## Akun Demo

Gunakan akun berikut untuk masuk ke sistem:

Username: admin
Password: admin123

Catatan: halaman `login.html` saat ini melakukan validasi akun demo di sisi frontend menggunakan `localStorage`. Project juga menyediakan endpoint `backend/login.php` untuk validasi login melalui database.

## Endpoint Backend

### Login

POST backend/login.php

Contoh body JSON:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Dashboard

```http
GET backend/dashboard.php
```

Endpoint ini mengembalikan statistik jumlah dapur, dapur aktif, dapur nonaktif, kontak kosong, total mitra, dapur terbaru, dan mitra dengan jumlah dapur terbanyak.

### Dapur

GET backend/dapur.php
POST backend/dapur.php
DELETE backend/dapur.php?id=1

Contoh body JSON untuk tambah atau edit dapur:

```json
{
  "id_dapur": "",
  "nama_dapur": "Dapur Sehat",
  "alamat": "Jl. Contoh No. 1",
  "penanggung_jawab": "Budi",
  "kontak": "08123456789",
  "status": "Aktif",
  "id_mitra": "1"
}
```

Jika `id_dapur` kosong, data baru akan ditambahkan. Jika `id_dapur` berisi ID yang sudah ada, data akan diperbarui.

### Mitra

GET backend/mitra.php
POST backend/mitra.php
DELETE backend/mitra.php?id=1

Contoh body JSON untuk tambah atau edit mitra:

```json
{
  "id_mitra": "",
  "nama_mitra": "PT Contoh Gizi",
  "jenis_mitra": "Perusahaan",
  "kontak": "08123456789",
  "email": "kontak@contoh.com",
  "alamat": "Jl. Mitra No. 1",
  "status": "Aktif"
}
```

Jika `id_mitra` kosong, data baru akan ditambahkan. Jika `id_mitra` berisi ID yang sudah ada, data akan diperbarui.

## Database

File `database.sql` berisi:

- Pembuatan database `simgizi`.
- Tabel `users`.
- Tabel `mitra`.
- Tabel `dapur`.
- Data awal admin, mitra, dan dapur.

Relasi utama:

- Satu mitra dapat memiliki banyak dapur.
- Tabel `dapur` memiliki foreign key `id_mitra` yang mengarah ke tabel `mitra`.

## Catatan Pengembangan

- Backend menggunakan response JSON untuk komunikasi dengan frontend.
- Operasi login, tambah, edit, dan hapus memakai prepared statement.
- Password user di database disimpan dalam bentuk hash.
- File `frontend.js` mengambil data dari endpoint PHP dan menampilkan data secara dinamis ke tabel.
- Data login demo pada `login.html` masih bersifat frontend-only, sehingga untuk kebutuhan produksi sebaiknya diarahkan ke endpoint `backend/login.php`.

## Developer

Project ini dikembangkan oleh 4ThinkzTeam.
