# Aplikasi Reseller CALSUB 🏅

Platform lengkap untuk mengelola penjualan jersey custom CALSUB tanpa kerumitan operasional. Reseller dapat menerima order, mengelola pembayaran, dan memantau produksi secara real-time.

## 📱 Daftar Platform

| Platform | Teknologi | Deskripsi |
|----------|-----------|-----------|
| **Mobile App** | React Native + Expo | iOS & Android untuk reseller |
| **Admin Web** | React + Vite | Dashboard internal tim CALSUB |
| **Backend API** | Node.js + Express + Prisma | REST API dengan PostgreSQL |

## ✨ Fitur Utama

### Untuk Reseller (Mobile App)
- 🔐 **Autentikasi** via Google OAuth
- 📊 **Dashboard** dengan statistik penjualan real-time
- 📋 **Manajemen Order** - Buat, kelola, dan track pesanan
- 💳 **Sistem Pembayaran** - DP Desain, DP Produksi, integrasi Midtrans
- 🏭 **Production Tracking** - Monitor 8 tahap produksi
- 💰 **Komisi & Wallet** - Multi-tier komisi, tracking saldo
- 🎁 **Poin & Hadiah** - Kumpulkan poin, tukar dengan hadiah
- 📲 **Push Notifications** - Update status real-time via FCM

### Untuk Admin (Web Dashboard)
- 👥 **Manajemen Reseller** - Approve, set tier, monitoring performa
- 📦 **Manajemen Order** - Update status, assign ke produksi
- 🏭 **Manajemen Produksi** - Track 8 tahap, catat progress
- 💵 **Manajemen Pembayaran** - Confirm DP, kelola withdraw komisi
- 📊 **Laporan & Analitik** - Order, reseller, keuangan
- ⚙️ **Pengaturan Sistem** - Tier, poin, metode pembayaran

## 🚀 Quick Start

### Minimal Setup (3 perintah)

```bash
# 1. Backend
cd backend && npm install && npm run db:push

# 2. Mobile App
cd ../user-app && npm install

# 3. Admin Web
cd ../admin-web && npm install
```

Kemudian jalankan masing-masing dalam terminal terpisah:
```bash
cd backend && npm run dev        # Port 3000
cd user-app && npm start         # Expo
cd admin-web && npm run dev      # Port 5173
```

**Penjelasan detail:** Lihat [SPRINT_1_SETUP.md](./SPRINT_1_SETUP.md)

## 📊 Project Status

### Sprint 1 - Setup & Fondasi ✅ SELESAI

- ✅ Backend structure & API endpoints
- ✅ Database schema lengkap
- ✅ Authentication (Google OAuth + JWT)
- ✅ Order & Payment APIs
- ✅ Production Tracking APIs
- ✅ Mobile app structure
- ✅ Admin web structure

### Sprint 2 - Order & Payment 🔄 IN PROGRESS

### Sprint 3 - Produksi & Tracking ⏳ TODO
### Sprint 4 - Komisi & Poin ⏳ TODO
### Sprint 5 - Admin Web ⏳ TODO
### Sprint 6 - Notifikasi & Deploy ⏳ TODO

## 📦 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend Mobile** | React Native, Expo, React Navigation |
| **Frontend Web** | React, Vite, React Router |
| **Backend** | Node.js, Express, Prisma, PostgreSQL |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Google OAuth 2.0, JWT |
| **Payment** | Midtrans |
| **Notifications** | Firebase Cloud Messaging |
| **File Storage** | Cloudflare R2 |
| **Hosting** | VPS Hostinger, Expo EAS Build |

## 📂 Struktur Folder

```
Re-seller/
├── backend/                    # Backend API (REST)
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth middleware
│   │   └── lib/              # Utilities
│   ├── prisma/               # Database schema
│   └── package.json
│
├── user-app/                   # Mobile app (React Native)
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   ├── context/          # Auth context
│   │   ├── utils/            # API client
│   │   └── config/           # Configuration
│   └── app.json
│
├── admin-web/                  # Admin dashboard (React)
│   ├── src/
│   │   ├── context/          # Auth context
│   │   ├── utils/            # API client
│   │   ├── components/       # React components
│   │   └── pages/            # Page components
│   └── vite.config.js
│
└── SPRINT_1_SETUP.md          # Setup guide
```

## 🔌 API Endpoints (Sprint 1)

Semua endpoint terlindungi dengan JWT authentication (kecuali `/auth/google`).

### Auth
```
POST   /auth/google              # Login/signup via Google
GET    /auth/me                  # Get current user
```

### Resellers
```
PUT    /resellers/profile        # Update profile
GET    /resellers/dashboard      # Get dashboard stats
```

### Orders
```
POST   /orders                   # Create order
GET    /orders                   # List orders
GET    /orders/:id              # Get order detail
PUT    /orders/:id              # Update order
DELETE /orders/:id              # Cancel order
```

### Payments
```
POST   /payments/initiate        # Start payment
GET    /payments/:id            # Get payment
POST   /payments/:id/confirm    # Confirm manual payment
GET    /payments/order/:order_id # List payments
```

### Production
```
GET    /production/:order_id     # Get production timeline
GET    /work-orders/:order_id    # Get work order
PUT    /work-orders/:order_id/approve  # Approve LK
GET    /orders/:order_id/latest-production  # Latest update
```

## 🗄️ Database Models

**Reseller Management:**
- `resellers` - Akun reseller
- `commission_tiers` - Tier komisi
- `commissions` - Riwayat komisi
- `commission_withdrawals` - Pencairan komisi

**Orders & Payments:**
- `orders` - Pesanan
- `order_items` - Item dalam pesanan
- `order_payments` - Pembayaran

**Production:**
- `work_orders` - Lembar Kerja
- `production_stages` - Definisi tahap
- `production_statuses` - Status per tahap

**Rewards:**
- `points` - Poin reward
- `rewards` - Katalog hadiah
- `reward_redemptions` - Riwayat tukar

**Admin:**
- `notifications` - Notifikasi
- `admins` - User admin

## 🛠️ Development

### Local Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Mobile
cd user-app && npm start

# Terminal 3 - Admin Web
cd admin-web && npm run dev
```

### Database Management
```bash
cd backend

# Lihat database di Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push

# Seed data
npm run db:seed
```

## 📝 Environment Variables

Copy `.env.example` menjadi `.env.local` di setiap folder:

```bash
# Backend
cd backend && cp .env.example .env

# Mobile App
cd user-app && cp .env.example .env.local

# Admin Web
cd admin-web && cp .env.example .env.local
```

Kemudian isi dengan kredensial yang sesuai.

## 🧪 Testing

```bash
# Backend
cd backend
npm run test              # Run tests
npm run test:watch      # Watch mode
```

## 📖 Documentation

- [Sprint 1 Setup Guide](./SPRINT_1_SETUP.md) - Panduan setup lengkap
- [API Documentation](./backend/API.md) - Dokumentasi API lengkap
- [Database Schema](./backend/prisma/schema.prisma) - Definisi database
- [Specification](./SPEC.md) - Spesifikasi lengkap aplikasi

## 🔐 Security

- ✅ JWT authentication
- ✅ Input validation
- ✅ CORS configuration
- ✅ Secure password hashing
- ✅ Rate limiting (TBD)
- ✅ SQL injection prevention (Prisma)

## 🚀 Deployment

### Prerequisites
- PostgreSQL database (Supabase)
- Google OAuth credentials
- Midtrans merchant account
- Firebase project (untuk FCM)
- Cloudflare R2 bucket

### Deployment Steps
1. Configure production environment
2. Run database migrations
3. Build mobile apps (EAS Build)
4. Deploy backend to VPS
5. Deploy admin web to server
6. Submit to app stores

**Detail:** Lihat deployment guide (TBD)

## 📊 Timeline

**Total Estimasi:** 16 minggu (4 bulan)
- Sprint 1 (2 minggu): Setup & Fondasi ✅
- Sprint 2 (3 minggu): Order & Payment 🔄
- Sprint 3 (2 minggu): Produksi & Tracking
- Sprint 4 (3 minggu): Komisi & Poin
- Sprint 5 (3 minggu): Admin Web
- Sprint 6 (3 minggu): Notifikasi, QA & Deploy

## 👥 Tim

- **Tech Lead**: Project architecture, CI/CD
- **Backend Dev**: API development, database
- **Mobile Dev**: React Native development
- **Frontend Dev**: React admin dashboard
- **QA**: Testing, bug reporting

## 📞 Support & Contact

- Tech Lead: [contact]
- Documentation: [wiki]
- Issues: GitHub Issues
- Chat: [Slack/Discord]

## 📄 License

Internal use only - Confidential

---

**Last Updated:** April 21, 2026
**Version:** 1.0.0 - Sprint 1 Setup Complete
