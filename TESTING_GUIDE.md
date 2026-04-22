# Sprint 1 - Dev Auth & ERP Mock Service Guide
**Date:** April 22, 2026  
**Status:** Ready for Testing

---

## 🎯 Apa yang Sudah Dibuat

Saya telah membuat 3 fitur baru untuk memudahkan development & testing:

### 1️⃣ **Dev Auth Endpoints** ✅
- Login/register tanpa Google OAuth
- Untuk development & testing
- Routes: `/dev-auth/*`

### 2️⃣ **ERP Mock Service** ✅
- Dummy data yang mirip ERP asli
- 3 sample orders dengan production timeline
- Routes: `/erp-sync/*`

### 3️⃣ **ERP Sync Controller** ✅
- Endpoint untuk pull data dari "ERP"
- Support filtering & production status tracking
- Can be easily swapped with real ERP API later

---

## 🚀 Cara Menggunakan

### Step 1: Set NODE_ENV = development

```bash
# Windows
set NODE_ENV=development

# Linux/Mac
export NODE_ENV=development
```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
[Server] ℹ️  Dev auth routes aktif (NODE_ENV=development)
🚀 Server running on port 3000
```

---

## 📡 API ENDPOINTS - Testing Guide

### 🔐 DEV AUTH ENDPOINTS (No authentication needed)

#### 1. Login dengan Email Sederhana
```bash
POST http://localhost:3000/dev-auth/login
Content-Type: application/json

{
  "email": "dev@test.com",
  "name": "Dev User",
  "onboarding_data": null
}
```

**Response:**
```json
{
  "success": true,
  "is_new_user": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "reseller": {
    "id": "uuid-here",
    "email": "dev@test.com",
    "full_name": "Dev User",
    "status": "active",
    "phone": null,
    "address": null
  }
}
```

**Gunakan token di header untuk request authenticated:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

#### 2. Register Akun Dev Baru
```bash
POST http://localhost:3000/dev-auth/register
Content-Type: application/json

{
  "email": "newdev@test.com",
  "name": "New Dev User",
  "phone": "08123456789",
  "address": "Jl. Dev Street No. 1",
  "onboarding_data": {
    "target": "Penghasilan",
    "categories": ["Jersey BASIC"],
    "experience": "Pemula"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Akun development berhasil dibuat.",
  "token": "...",
  "reseller": { ... }
}
```

---

#### 3. List Semua Dev Users (untuk debugging)
```bash
GET http://localhost:3000/dev-auth/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    { "id": "...", "email": "dev@test.com", "name": "Dev User", "status": "active" }
  ],
  "total": 1
}
```

---

### 📦 ERP SYNC ENDPOINTS (No authentication needed for testing)

#### 1. Get Mock Orders dari ERP
```bash
GET http://localhost:3000/erp-sync/orders
GET http://localhost:3000/erp-sync/orders?status=processing
GET http://localhost:3000/erp-sync/orders?customer_name=Bintang
```

**Response:**
```json
{
  "success": true,
  "source": "mock",
  "orders": [
    {
      "id": "erp-ord-001",
      "po_number": "PO-ERP-20260401-001",
      "customer_name": "PT Bintang Jaya",
      "brand_name": "BJ Sports",
      "order_type": "BASIC",
      "status": "processing",
      "items": [
        {
          "product_name": "Jersey BASIC v2",
          "quantity": 100,
          "unit_price": 75000
        }
      ],
      "total_amount": 7500000
    }
  ],
  "total": 3
}
```

---

#### 2. Get Mock Work Orders (Lembar Kerja)
```bash
GET http://localhost:3000/erp-sync/work-orders
```

**Response:**
```json
{
  "success": true,
  "source": "mock",
  "work_orders": [
    {
      "id": "lk-001",
      "order_id": "erp-ord-001",
      "lk_number": "LK-20260405-001",
      "status": "ready_for_review",
      "size_run": "S(5) M(30) L(40) XL(25)",
      "back_name": "BINTANG JAYA",
      "back_number": "1-100"
    }
  ],
  "total": 2
}
```

---

#### 3. Get Production Stages (8 Tahapan)
```bash
GET http://localhost:3000/erp-sync/production-stages
```

**Response:**
```json
{
  "success": true,
  "source": "mock",
  "stages": [
    { "id": "stage-1", "name": "Desain", "order_index": 1 },
    { "id": "stage-2", "name": "Layout", "order_index": 2 },
    { "id": "stage-3", "name": "Print", "order_index": 3 },
    { "id": "stage-4", "name": "Roll Press", "order_index": 4 },
    { "id": "stage-5", "name": "Potong Pola", "order_index": 5 },
    { "id": "stage-6", "name": "Konveksi", "order_index": 6 },
    { "id": "stage-7", "name": "QC dan Finishing", "order_index": 7 },
    { "id": "stage-8", "name": "Selesai", "order_index": 8 }
  ],
  "total": 8
}
```

---

#### 4. Get Production Status untuk Order Tertentu
```bash
GET http://localhost:3000/erp-sync/production-status/erp-ord-001
```

**Response:**
```json
{
  "success": true,
  "source": "mock",
  "production": {
    "order_id": "erp-ord-001",
    "current_stage": {
      "stage": {
        "id": "stage-3",
        "name": "Print",
        "order_index": 3
      },
      "status": "in_progress",
      "started_at": "2026-04-06T08:00:00Z",
      "completed_at": null,
      "duration_minutes": null
    },
    "timeline": [
      {
        "stage": { "id": "stage-1", "name": "Desain", "order_index": 1 },
        "status": "completed",
        "started_at": "2026-04-02T08:00:00Z",
        "completed_at": "2026-04-03T16:00:00Z",
        "duration_minutes": 1440
      },
      ...
    ],
    "last_updated": "2026-04-22T10:00:00Z"
  }
}
```

---

#### 5. Sinkronisasi Production Stages ke Database
```bash
POST http://localhost:3000/erp-sync/sync-to-db?type=all
```

**Response:**
```json
{
  "success": true,
  "message": "Data ERP berhasil disinkronisasi ke database.",
  "synced": {
    "production_stages": 8
  }
}
```

**Catatan:** Endpoint ini hanya work di NODE_ENV=development

---

## 🧪 WORKFLOW TESTING LENGKAP

### Skenario 1: Development dari Awal

```bash
# 1. Register dev user baru
POST /dev-auth/register
{
  "email": "dev1@test.com",
  "name": "Developer 1",
  "phone": "081234567890",
  "address": "Dev Office"
}
# → Dapatkan token

# 2. List semua orders dari ERP (tidak perlu auth)
GET /erp-sync/orders

# 3. Get production status untuk order pertama
GET /erp-sync/production-status/erp-ord-001

# 4. Sync production stages ke database (seed data)
POST /erp-sync/sync-to-db?type=all

# 5. Gunakan token dari step 1 untuk akses dashboard
GET /resellers/dashboard
Authorization: Bearer <token dari step 1>
```

---

### Skenario 2: Existing User Login

```bash
# 1. Login dengan email yang sudah ada
POST /dev-auth/login
{
  "email": "dev@test.com"
}
# → Dapatkan token

# 2. Get dashboard data
GET /resellers/dashboard
Authorization: Bearer <token>
```

---

## 🔧 Environment Variables

**Add ke `.env` file:**

```bash
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=your-google-id (optional for dev)
USE_MOCK_ERP=true
```

---

## 📊 Mock Data Included

**3 Sample Orders sudah tersedia:**

| Order ID | Customer | Type | Status | Items | Total |
|----------|----------|------|--------|-------|-------|
| erp-ord-001 | PT Bintang Jaya | BASIC | processing | 100 Jersey | Rp 7.5M |
| erp-ord-002 | Sekolah SMA Al-Azhar | LIGA | design | 50 Jersey | Rp 6.75M |
| erp-ord-003 | Tim Bola Voli Garuda | MAKLOON | layout | 30 Jersey | Rp 6M |

**Production Timeline untuk setiap order:**
- Order 1: Sedang di tahap Print (3/8)
- Order 2: Sedang di tahap Potong Pola (5/8)
- Order 3: Sedang di tahap Layout (2/8)

---

## ⚙️ Cara Integrate dengan Real ERP Nanti

**Timeline:**
- Sprint 2-3: Use mock data
- Sprint 3 akhir: Swap to real ERP API

**Cara swap:**
```javascript
// File: backend/src/services/erpService.js
// Line: const USE_MOCK = process.env.USE_MOCK_ERP === 'true';

// Development: 
// USE_MOCK_ERP=true → gunakan mock data

// Production: 
// USE_MOCK_ERP=false → panggil real ERP API
// Tambahkan real API call di sini:
const getOrdersFromERP = async (options) => {
  if (!USE_MOCK) {
    return fetch('https://erp.calsub.id/api/orders', ...)
  }
  return mockOrders;
}
```

---

## 📝 Testing Checklist

- [ ] Start backend server (NODE_ENV=development)
- [ ] Test `/dev-auth/register` - buat akun baru
- [ ] Test `/dev-auth/login` - login dengan akun existing
- [ ] Test `/dev-auth/users` - list semua users
- [ ] Test `/erp-sync/orders` - dapatkan mock orders
- [ ] Test `/erp-sync/work-orders` - dapatkan mock LK
- [ ] Test `/erp-sync/production-stages` - dapatkan 8 tahapan
- [ ] Test `/erp-sync/production-status/erp-ord-001` - tracking production
- [ ] Test `/erp-sync/sync-to-db` - populate database
- [ ] Test `/resellers/dashboard` dengan token dari dev-auth

---

## 🎉 Selesai!

Sekarang Anda bisa:
- ✅ Test API tanpa Google OAuth
- ✅ Pull mock orders dari "ERP"
- ✅ Track production status
- ✅ Develop Sprint 2 order features

Next: Implementasi Admin Approval Flow (Task 1.11) & Admin Web dashboard.
