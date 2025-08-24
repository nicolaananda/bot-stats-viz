# Konfigurasi API Server

## API Server Details
- **IP Address**: `185.201.9.64`
- **Port**: `3002`
- **Base URL**: `http://185.201.9.64:3002`

## Setup Environment

### 1. Buat File .env
Buat file `.env` di root directory project dengan isi:

```bash
# API Configuration
VITE_API_URL=http://185.201.9.64:3002

# Optional: Override default API timeout (in milliseconds)
VITE_API_TIMEOUT=10000

# Optional: Enable/disable API request logging
VITE_API_LOGGING=true
```

### 2. Verifikasi Konfigurasi
Setelah membuat file `.env`, aplikasi akan otomatis menggunakan API server Anda.

## Testing Connection

### 1. Start Aplikasi
```bash
npm run dev
```

### 2. Check Environment Banner
Banner di dashboard akan menampilkan:
```
Development Mode: Dashboard is configured to connect to API at http://185.201.9.64:3002
```

### 3. Test API Endpoints
Buka browser developer tools → Network tab untuk melihat:
- API requests ke `185.201.9.64:3002`
- Response dari server
- Error handling jika ada masalah

## Troubleshooting

### Jika API Tidak Bisa Diakses:

1. **Check Server Status**
   ```bash
   # Test koneksi ke server
   curl http://185.201.9.64:3002/api/dashboard/overview
   ```

2. **Check Firewall**
   - Pastikan port 3002 terbuka di server
   - Check firewall rules di server

3. **Check CORS**
   - Server harus mengizinkan requests dari `http://localhost:5173`
   - Pastikan CORS header sudah dikonfigurasi

4. **Check Network**
   - Pastikan server bisa diakses dari jaringan Anda
   - Test ping ke IP address

### Common Error Messages:

- **Connection Refused**: Server tidak running atau port salah
- **CORS Error**: Server tidak mengizinkan cross-origin requests
- **Timeout**: Server lambat atau network issue
- **404 Not Found**: Endpoint tidak ada atau salah

## API Endpoints yang Diharapkan

Pastikan server Anda menyediakan endpoint berikut:

```
GET http://185.201.9.64:3002/api/dashboard/overview
GET http://185.201.9.64:3002/api/dashboard/chart/daily
GET http://185.201.9.64:3002/api/dashboard/chart/monthly
GET http://185.201.9.64:3002/api/dashboard/users/activity
GET http://185.201.9.64:3002/api/dashboard/users/stats
GET http://185.201.9.64:3002/api/dashboard/users/:userId/transactions
GET http://185.201.9.64:3002/api/dashboard/products/stats
GET http://185.201.9.64:3002/api/dashboard/transactions/recent
GET http://185.201.9.64:3002/api/dashboard/transactions/search/:reffId
GET http://185.201.9.64:3002/api/dashboard/export/:format
```

## Response Format

Semua endpoint harus mengembalikan response dalam format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "message": null
}
```

## Next Steps

1. **Buat file `.env`** dengan konfigurasi di atas
2. **Restart aplikasi** dengan `npm run dev`
3. **Check environment banner** untuk memastikan URL benar
4. **Test dashboard** untuk melihat data dari API server
5. **Check console** untuk error atau warning

Jika ada masalah, check:
- Browser console untuk error messages
- Network tab untuk failed requests
- Server logs untuk backend issues 