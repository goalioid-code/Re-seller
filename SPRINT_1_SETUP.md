# CALSUB Reseller Application - Setup Guide

## 📋 Project Overview

Aplikasi Reseller CALSUB adalah platform lengkap untuk mengelola penjualan jersey custom. Terdiri dari 3 komponen utama:

- **Backend API** (Node.js + Express + Prisma + PostgreSQL)
- **Mobile App** (React Native + Expo)
- **Admin Web** (React + Vite)

## 🏗️ Struktur Project

```
Re-seller/
├── backend/          # Backend API (REST)
├── user-app/        # Mobile app (iOS & Android)
└── admin-web/       # Admin dashboard (Web)
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan credential Supabase, Google OAuth, etc.

# Generate Prisma client
npm run db:generate

# Push database schema to Supabase
npm run db:push

# Seed initial data (commission tiers, production stages, rewards)
npm run db:seed

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 2. Mobile App Setup

```bash
cd user-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan API URL dan Firebase config

# Start Expo development server
npm start
```

### 3. Admin Web Setup

```bash
cd admin-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan API URL dan Supabase config

# Start development server
npm run dev
```

Admin Web akan berjalan di `http://localhost:5173`

## 📁 Directory Structure

### Backend (`/backend`)

```
src/
├── controllers/         # Business logic
│   ├── authController.js
│   ├── resellerController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── productionController.js
├── routes/             # API endpoints
│   ├── auth.js
│   ├── resellers.js
│   ├── orders.js
│   ├── payments.js
│   └── production.js
├── middlewares/        # Express middleware
│   └── auth.js        # JWT verification
├── lib/               # Utilities
│   └── prisma.js      # Prisma client
└── index.js           # Main app file

prisma/
├── schema.prisma      # Database schema
└── seed.js           # Seed data
```

### Mobile App (`/user-app`)

```
src/
├── screens/
│   └── Onboarding/    # Auth & signup screens
├── context/           # React context
│   └── AuthContext.js # Auth state management
├── config/            # Configuration
│   └── supabase.js    # Supabase client
├── utils/             # Utilities
│   └── apiClient.js   # API wrapper
├── components/        # Reusable components
└── assets/           # Images, fonts, etc.
```

### Admin Web (`/admin-web`)

```
src/
├── context/           # React context
│   └── AdminAuthContext.jsx
├── config/            # Configuration
│   └── supabase.js
├── utils/             # Utilities
│   └── apiClient.js
├── components/        # React components
├── pages/            # Page components
└── assets/           # Static files
```

## 🔌 API Endpoints (Sprint 1)

### Authentication
- `POST /auth/google` - Login/signup via Google OAuth
- `GET /auth/me` - Get current reseller profile

### Resellers
- `PUT /resellers/profile` - Update profile
- `GET /resellers/dashboard` - Get dashboard data

### Orders
- `POST /orders` - Create new order
- `GET /orders` - List orders
- `GET /orders/:id` - Get order detail
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Cancel order

### Payments
- `POST /payments/initiate` - Initiate payment
- `GET /payments/:id` - Get payment detail
- `POST /payments/:id/confirm` - Confirm manual payment
- `GET /payments/order/:order_id` - Get payments for order

### Production
- `GET /production/:order_id` - Get production status timeline
- `GET /work-orders/:order_id` - Get work order
- `PUT /work-orders/:order_id/approve` - Approve work order
- `GET /orders/:order_id/latest-production` - Get latest update

## 🗄️ Database Schema

### Main Tables (Own)
- `resellers` - Reseller accounts
- `orders` - Customer orders
- `order_items` - Individual items in order
- `order_payments` - Payment records
- `work_orders` - Lembar Kerja (LK)
- `production_stages` - Production stage definitions
- `production_statuses` - Status per stage per order
- `commission_tiers` - Tier configurations
- `commissions` - Commission records
- `commission_withdrawals` - Withdrawal requests
- `points` - Reward points
- `rewards` - Reward catalog
- `reward_redemptions` - Redemption history
- `notifications` - In-app notifications
- `admins` - Admin users

## 📱 Features (Sprint 1 Complete)

### Backend ✅
- [x] Google OAuth 2.0 integration
- [x] JWT session management
- [x] Reseller profile management
- [x] Order CRUD operations
- [x] Payment initiation & tracking
- [x] Production status tracking
- [x] Database schema complete

### Mobile App 🟡
- [x] Project structure setup
- [x] Auth context & API client
- [x] Onboarding screens (WIP)
- [ ] Dashboard implementation
- [ ] Order creation form
- [ ] Payment flow
- [ ] Production tracking

### Admin Web 🟡
- [x] Project structure setup
- [x] Auth context & API client
- [ ] Admin dashboard
- [ ] Reseller management
- [ ] Order management
- [ ] Payment confirmation
- [ ] Reports & analytics

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

### Mobile App (.env.local)
```
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Admin Web (.env.local)
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=...
```

## 🔄 Development Workflow

1. **Backend Development**
   - Modify controllers/routes
   - Test with Postman or similar
   - Update database schema if needed

2. **Frontend Development**
   - Use hot reload (automatic)
   - Test API integration locally
   - Use mock data if needed

3. **Database Changes**
   ```bash
   cd backend
   npm run db:push  # Deploy schema
   npm run db:seed  # Reseed if needed
   ```

## 📊 Next Steps (Sprint 2+)

- [ ] Mobile app dashboard & stats
- [ ] Order creation form with validation
- [ ] Payment gateway integration (Midtrans)
- [ ] Admin order management
- [ ] Admin reseller approval flow
- [ ] Push notifications (Firebase FCM)
- [ ] Commission & points system
- [ ] Testing & QA
- [ ] Production deployment

## 🤝 Contributing

Follow the coding standards and commit conventions:
- Use meaningful commit messages
- Keep commits small and focused
- Test before pushing

## 📞 Support

Untuk pertanyaan atau issues, hubungi tech lead team.
