# Stock Management API Documentation

## Overview
API endpoints untuk mengelola stok produk melalui web dashboard. Semua endpoint menggunakan format JSON untuk request dan response.

## Base URL
```
http://localhost:3002/api/dashboard
```

## Authentication
Saat ini tidak ada authentication, tapi pastikan CORS sudah dikonfigurasi dengan benar.

---

## Stock CRUD Operations

### 1. Add Stock to Product
**Endpoint:** `POST /api/dashboard/products/:productId/stock/add`

**Description:** Menambahkan stok baru ke produk tertentu

**Request Body:**
```json
{
  "stockItems": [
    "email@example.com|password123|profile1|1234",
    {
      "email": "user@domain.com",
      "password": "pass123",
      "profile": "profile2",
      "pin": "5678",
      "notes": "optional notes"
    }
  ],
  "notes": "Restock batch #1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "previousStockCount": 10,
    "newStockCount": 12,
    "addedItems": 2,
    "invalidItems": 0,
    "updatedAt": "2025-09-13T10:30:00.000Z",
    "notes": "Restock batch #1",
    "addedStockItems": [
      "email@example.com|password123|profile1|1234",
      "user@domain.com|pass123|profile2|5678|optional notes"
    ]
  },
  "message": "Successfully added 2 stock items to NETFLIX 1 BULAN 1P2U BEST SELLER🔥"
}
```

### 2. Edit Specific Stock Item
**Endpoint:** `PUT /api/dashboard/products/:productId/stock/:stockIndex`

**Description:** Mengedit stok tertentu berdasarkan index

**Request Body:**
```json
{
  "stockItem": {
    "email": "newemail@example.com",
    "password": "newpass123",
    "profile": "newprofile",
    "pin": "9999"
  },
  "notes": "Updated credentials"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "stockIndex": 0,
    "oldStockItem": "oldemail@example.com|oldpass|oldprofile|1234",
    "newStockItem": "newemail@example.com|newpass123|newprofile|9999",
    "updatedAt": "2025-09-13T10:35:00.000Z",
    "notes": "Updated credentials"
  },
  "message": "Successfully updated stock item at index 0"
}
```

### 3. Delete Multiple Stock Items
**Endpoint:** `DELETE /api/dashboard/products/:productId/stock`

**Description:** Menghapus beberapa stok sekaligus dengan berbagai metode

**Request Body:**
```json
{
  "deleteType": "indexes",
  "stockIndexes": [0, 2, 4],
  "notes": "Removing invalid accounts"
}
```

**Delete Types:**
- `indexes`: Hapus berdasarkan index tertentu (requires `stockIndexes` array)
- `first`: Hapus 1 item pertama
- `last`: Hapus 1 item terakhir
- `all`: Hapus semua stok

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "deleteType": "indexes",
    "originalStockCount": 10,
    "newStockCount": 7,
    "deletedItemsCount": 3,
    "deletedItems": [
      {"index": 0, "item": "email1@example.com|pass1|profile1|1234"},
      {"index": 2, "item": "email2@example.com|pass2|profile2|5678"},
      {"index": 4, "item": "email3@example.com|pass3|profile3|9999"}
    ],
    "updatedAt": "2025-09-13T10:40:00.000Z",
    "notes": "Removing invalid accounts"
  },
  "message": "Successfully deleted 3 stock items from NETFLIX 1 BULAN 1P2U BEST SELLER🔥"
}
```

### 4. Delete Single Stock Item
**Endpoint:** `DELETE /api/dashboard/products/:productId/stock/:stockIndex`

**Description:** Menghapus 1 stok berdasarkan index

**Request Body:**
```json
{
  "notes": "Removing expired account"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "deletedIndex": 0,
    "deletedItem": "expired@example.com|oldpass|profile|1234",
    "originalStockCount": 10,
    "newStockCount": 9,
    "updatedAt": "2025-09-13T10:45:00.000Z",
    "notes": "Removing expired account"
  },
  "message": "Successfully deleted stock item at index 0"
}
```

### 5. Bulk Stock Operations
**Endpoint:** `POST /api/dashboard/products/stock/bulk-operations`

**Description:** Melakukan multiple operasi pada berbagai produk sekaligus

**Request Body:**
```json
{
  "operations": [
    {
      "productId": "net2u",
      "action": "add",
      "data": {
        "stockItems": [
          "bulk1@example.com|pass1|profile1|1111",
          "bulk2@example.com|pass2|profile2|2222"
        ]
      },
      "notes": "Bulk add for Netflix 2U"
    },
    {
      "productId": "net1u",
      "action": "delete",
      "data": {
        "deleteType": "first",
        "count": 2
      },
      "notes": "Remove first 2 items"
    },
    {
      "productId": "net1m",
      "action": "clear",
      "notes": "Clear all stock"
    }
  ]
}
```

**Supported Actions:**
- `add`: Tambah stok (requires `data.stockItems`)
- `delete`: Hapus stok (requires `data.deleteType` and optional `data.count`)
- `clear`: Hapus semua stok

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOperations": 3,
    "successfulOperations": 3,
    "failedOperations": 0,
    "results": [
      {
        "productId": "net2u",
        "action": "add",
        "success": true,
        "originalStockCount": 10,
        "newStockCount": 12,
        "addedItems": 2,
        "notes": "Bulk add for Netflix 2U"
      },
      {
        "productId": "net1u",
        "action": "delete",
        "success": true,
        "originalStockCount": 8,
        "newStockCount": 6,
        "deletedItems": 2,
        "notes": "Remove first 2 items"
      },
      {
        "productId": "net1m",
        "action": "clear",
        "success": true,
        "originalStockCount": 5,
        "newStockCount": 0,
        "clearedItems": 5,
        "notes": "Clear all stock"
      }
    ]
  },
  "message": "Bulk operations completed: 3 successful, 0 failed"
}
```

### 6. Get Stock Item Details
**Endpoint:** `GET /api/dashboard/products/:productId/stock/:stockIndex`

**Description:** Mendapatkan detail stok tertentu berdasarkan index

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "stockIndex": 0,
    "totalStockCount": 10,
    "stockItem": {
      "raw": "user@example.com|password123|profile1|1234|notes",
      "index": 0,
      "email": "user@example.com",
      "password": "password123",
      "profile": "profile1",
      "pin": "1234",
      "notes": "notes"
    }
  }
}
```

### 7. Replace All Stock
**Endpoint:** `PUT /api/dashboard/products/:productId/stock/replace-all`

**Description:** Mengganti semua stok dengan stok baru

**Request Body:**
```json
{
  "stockItems": [
    "new1@example.com|newpass1|profile1|1111",
    "new2@example.com|newpass2|profile2|2222",
    {
      "email": "new3@example.com",
      "password": "newpass3",
      "profile": "profile3",
      "pin": "3333"
    }
  ],
  "notes": "Complete stock replacement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "net2u",
    "productName": "NETFLIX 1 BULAN 1P2U BEST SELLER🔥",
    "originalStockCount": 10,
    "newStockCount": 3,
    "validItems": 3,
    "invalidItems": 0,
    "updatedAt": "2025-09-13T11:00:00.000Z",
    "notes": "Complete stock replacement"
  },
  "message": "Successfully replaced all stock for NETFLIX 1 BULAN 1P2U BEST SELLER🔥. 3 valid items, 0 invalid items."
}
```

---

## Stock Format

### String Format
```
"email|password|profile|pin|notes"
```

### Object Format
```json
{
  "email": "required",
  "password": "required", 
  "profile": "optional",
  "pin": "optional",
  "notes": "optional"
}
```

### Validation Rules
- Email dan password wajib diisi
- Format string harus menggunakan separator `|`
- Minimal 2 bagian (email|password)
- Profile, pin, dan notes bersifat opsional

---

## Error Handling

### Common Error Responses

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**400 - Invalid Request:**
```json
{
  "success": false,
  "message": "Invalid request body. Required: stockItems array (non-empty)"
}
```

**400 - Invalid Stock Format:**
```json
{
  "success": false,
  "message": "No valid stock items found",
  "invalidItems": [
    {
      "index": 0,
      "item": "invalid-item",
      "reason": "Email and password are required"
    }
  ]
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Usage Examples

### JavaScript/Fetch Examples

```javascript
// Add stock
const addStock = async (productId, stockItems) => {
  const response = await fetch(`/api/dashboard/products/${productId}/stock/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stockItems: stockItems,
      notes: 'Added via web interface'
    })
  });
  
  return await response.json();
};

// Edit stock item
const editStock = async (productId, index, stockData) => {
  const response = await fetch(`/api/dashboard/products/${productId}/stock/${index}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stockItem: stockData,
      notes: 'Updated via web interface'
    })
  });
  
  return await response.json();
};

// Delete stock item
const deleteStock = async (productId, index) => {
  const response = await fetch(`/api/dashboard/products/${productId}/stock/${index}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notes: 'Deleted via web interface'
    })
  });
  
  return await response.json();
};
```

### cURL Examples

```bash
# Add stock
curl -X POST http://localhost:3002/api/dashboard/products/net2u/stock/add \
  -H "Content-Type: application/json" \
  -d '{
    "stockItems": [
      "test@example.com|testpass|profile1|1234"
    ],
    "notes": "Test add"
  }'

# Edit stock
curl -X PUT http://localhost:3002/api/dashboard/products/net2u/stock/0 \
  -H "Content-Type: application/json" \
  -d '{
    "stockItem": {
      "email": "updated@example.com",
      "password": "newpass",
      "profile": "profile1",
      "pin": "5678"
    },
    "notes": "Updated credentials"
  }'

# Delete stock
curl -X DELETE http://localhost:3002/api/dashboard/products/net2u/stock/0 \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Removed invalid account"
  }'
```

---

## Tips & Best Practices

1. **Validation:** Selalu validasi format stok sebelum mengirim ke API
2. **Batch Operations:** Gunakan bulk operations untuk efisiensi saat mengelola banyak stok
3. **Error Handling:** Selalu cek response `success` dan handle error dengan baik
4. **Notes:** Gunakan field `notes` untuk tracking perubahan
5. **Index Management:** Hati-hati dengan index saat delete, karena index bisa berubah setelah operasi delete
6. **Backup:** Selalu backup database sebelum melakukan operasi bulk yang besar

---

## Product IDs
Beberapa contoh Product ID yang tersedia:
- `net2u` - Netflix 1 Bulan 1P2U
- `net1u` - Netflix 1 Bulan 1P1U  
- `net1m` - Netflix 1 Minggu 1P1U
- Dan lainnya sesuai database produk Anda 