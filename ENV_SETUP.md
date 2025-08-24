# Setup File .env

## Langkah-langkah Setup:

### 1. Buat File .env
Buat file baru bernama `.env` di root directory project (sama level dengan `package.json`)

### 2. Isi File .env
Copy dan paste isi berikut ke file `.env`:

```bash
# API Configuration
VITE_API_URL=http://185.201.9.64:3002

# Optional: Override default API timeout (in milliseconds)
VITE_API_TIMEOUT=10000

# Optional: Enable/disable API request logging
VITE_API_LOGGING=true
```

### 3. Simpan File
Simpan file `.env` dan pastikan tidak ada ekstensi tambahan (bukan `.env.txt`)

### 4. Restart Aplikasi
Setelah membuat file `.env`, restart aplikasi:
```bash
npm run dev
```

## Verifikasi Setup

### Check Environment Banner
Setelah restart, banner di dashboard akan menampilkan:
```
Development Mode: Dashboard is configured to connect to API at http://185.201.9.64:3002
```

### Check Data Loading
Dashboard akan menampilkan data real dari API server:
- Total Pendapatan: Rp 460.800
- Total Transaksi: 21
- Pendapatan Hari Ini: Rp 364.900
- Transaksi Hari Ini: 14

## Troubleshooting

### Jika File .env Tidak Terdeteksi:
1. Pastikan nama file tepat `.env` (bukan `.env.txt`)
2. Pastikan file berada di root directory
3. Restart terminal/command prompt
4. Restart aplikasi dengan `npm run dev`

### Jika Data Tidak Muncul:
1. Check browser console untuk error
2. Check Network tab untuk API requests
3. Pastikan server API running di `185.201.9.64:3002`

## File Structure
```
bot-stats-viz/
├── .env                    ← Buat file ini
├── package.json
├── src/
├── README.md
└── ...
```

## Next Steps
Setelah file `.env` dibuat dan aplikasi restart:
1. Dashboard akan otomatis terhubung ke API server Anda
2. Semua data akan diambil dari `http://185.201.9.64:3002`
3. Tidak ada lagi dummy data - semua real data dari server 