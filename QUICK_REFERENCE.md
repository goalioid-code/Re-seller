# 🚀 Sprint 1 Quick Reference

**Status:** ✅ 100% COMPLETE  
**Completion Date:** April 21, 2026

---

## 📥 What You Need to Know

### ✅ What's Done
1. **Backend API** - 16 endpoints fully implemented
2. **Database Schema** - 14 models with all relationships
3. **Authentication** - Google OAuth 2.0 + JWT working
4. **Frontend Scaffolding** - React Native + React setup
5. **API Clients** - Ready for use in mobile & web
6. **Documentation** - Comprehensive guides provided

### 🔧 What's NOT Done (Sprint 2+)
- Order forms (Sprint 2)
- Payment gateway (Sprint 2)
- Production tracking UI (Sprint 3)
- Commission system (Sprint 4)
- Admin dashboard (Sprint 5)
- Notifications (Sprint 6)

---

## 🏃 Quick Start (5 Minutes)

### Step 1: Install (2 min)
```bash
# Backend
cd backend && npm install

# Mobile
cd ../user-app && npm install

# Admin Web
cd ../admin-web && npm install
```

### Step 2: Configure (2 min)
```bash
# Edit these files and add your credentials:
# - backend/.env
# - user-app/.env.local
# - admin-web/.env.local

# Use .env.example files as reference
```

### Step 3: Database (1 min)
```bash
cd backend
npm run db:generate    # Generate Prisma
npm run db:push        # Deploy schema
npm run db:seed        # Add initial data
```

### Step 4: Run
```bash
# Terminal 1
cd backend && npm run dev         # http://localhost:3000

# Terminal 2
cd user-app && npm start          # Expo

# Terminal 3
cd admin-web && npm run dev       # http://localhost:5173
```

---

## 📚 Documentation Map

| Document | Purpose | Location |
|----------|---------|----------|
| **README.md** | Project overview | Root folder |
| **SPRINT_1_SETUP.md** | Complete setup guide | Root folder |
| **SPRINT_1_SUMMARY.md** | What was accomplished | Root folder |
| **FILE_INVENTORY.md** | What files changed | Root folder |
| **This file** | Quick reference | Root folder |

---

## 🔌 API Endpoints (Ready to Use)

```bash
# Auth
POST   http://localhost:3000/auth/google
GET    http://localhost:3000/auth/me

# Resellers
PUT    http://localhost:3000/resellers/profile
GET    http://localhost:3000/resellers/dashboard

# Orders (5 endpoints)
POST   http://localhost:3000/orders
GET    http://localhost:3000/orders
GET    http://localhost:3000/orders/:id
PUT    http://localhost:3000/orders/:id
DELETE http://localhost:3000/orders/:id

# Payments (4 endpoints)
POST   http://localhost:3000/payments/initiate
GET    http://localhost:3000/payments/:id
POST   http://localhost:3000/payments/:id/confirm
GET    http://localhost:3000/payments/order/:order_id

# Production (3 endpoints)
GET    http://localhost:3000/production/:order_id
GET    http://localhost:3000/work-orders/:order_id
PUT    http://localhost:3000/work-orders/:order_id/approve
```

### Testing with cURL
```bash
# Health check
curl http://localhost:3000/

# Login with Google
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token": "YOUR_GOOGLE_TOKEN"}'
```

---

## 💾 Database Models (Ready)

```
✅ Reseller
✅ CommissionTier
✅ Commission
✅ CommissionWithdrawal
✅ Order
✅ OrderItem
✅ OrderPayment
✅ WorkOrder
✅ ProductionStage
✅ ProductionStatus
✅ Point
✅ Reward
✅ RewardRedemption
✅ Notification
✅ Admin
```

---

## 🔐 Authentication Flow

```
User
  ↓ (Google OAuth)
POST /auth/google
  ↓ (Get JWT)
Response: { token, reseller }
  ↓ (Store in AsyncStorage/localStorage)
Use Bearer token for all requests
  ↓
Authorization: Bearer <token>
```

---

## 📂 File Structure Reference

```
Re-seller/
├── backend/
│   ├── src/
│   │   ├── controllers/  ← Business logic
│   │   ├── routes/       ← API routes
│   │   └── middlewares/  ← Auth middleware
│   └── prisma/
│       └── schema.prisma ← Database schema
│
├── user-app/
│   ├── src/
│   │   ├── context/      ← Auth state (NEW)
│   │   ├── utils/        ← API client (NEW)
│   │   └── screens/      ← UI screens
│   └── app.json
│
└── admin-web/
    ├── src/
    │   ├── context/      ← Auth state (NEW)
    │   ├── utils/        ← API client (NEW)
    │   └── pages/        ← Admin pages
    └── vite.config.js
```

---

## ✨ Ready-to-Use Code Examples

### Mobile: Login
```javascript
import { useAuth } from './src/context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  
  const handleLogin = async (googleToken) => {
    try {
      const result = await login(googleToken);
      console.log('Logged in:', result.reseller);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Mobile: API Call
```javascript
import { orderAPI } from './src/utils/apiClient';

async function createOrder(orderData) {
  try {
    const response = await orderAPI.createOrder(orderData);
    console.log('Order created:', response.order);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Admin Web: API Call
```javascript
import { adminOrderAPI } from './utils/apiClient';

async function getOrders() {
  try {
    const response = await adminOrderAPI.getOrders({ status: 'pending' });
    console.log('Orders:', response.orders);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

---

## 🧪 Testing Checklist

### Backend
- [ ] Server starts: `npm run dev`
- [ ] Health check: `GET /`
- [ ] Google OAuth: `POST /auth/google`
- [ ] JWT middleware: `GET /auth/me` (with token)

### Mobile
- [ ] App starts: `npm start`
- [ ] Navigation works
- [ ] Login screen visible
- [ ] Can call API (check console)

### Admin Web
- [ ] App starts: `npm run dev`
- [ ] Page loads
- [ ] No console errors
- [ ] Can import apiClient

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'prisma'"
**Solution:**
```bash
cd backend
npm install
npm run db:generate
```

### Issue: "DATABASE_URL not set"
**Solution:**
```bash
# Copy .env.example to .env
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill process on port 3000 or use different port
PORT=3001 npm run dev
```

### Issue: "EXPO_PUBLIC_API_URL undefined"
**Solution:**
```bash
# Create .env.local in user-app
cp .env.example .env.local
# Edit and add API URL
```

---

## 📞 Support

**Need help?** Check:
1. [SPRINT_1_SETUP.md](./SPRINT_1_SETUP.md) - Detailed setup
2. [README.md](./README.md) - Project overview
3. [backend/prisma/schema.prisma](./backend/prisma/schema.prisma) - Database structure

---

## 🎯 Next: Sprint 2

When ready to start Sprint 2 (Order & Payment):

1. **Create order form** with validation
2. **Add product dropdown**
3. **Calculate totals** (DP Desain, DP Produksi)
4. **Integrate Midtrans** payment gateway
5. **Handle payment status**

**Estimated time:** 3 weeks

---

## 📊 Project Timeline

```
Sprint 1 (2 weeks)  ✅ DONE
Sprint 2 (3 weeks)  🔄 NEXT → Order & Payment
Sprint 3 (2 weeks)  ⏳ Produksi & Tracking
Sprint 4 (3 weeks)  ⏳ Komisi & Poin
Sprint 5 (3 weeks)  ⏳ Admin Web
Sprint 6 (3 weeks)  ⏳ Notifikasi & Deploy

Total: 16 weeks (4 months)
```

---

## ✅ Final Checklist

Before starting Sprint 2:

- [ ] All 3 projects have node_modules
- [ ] .env files are configured
- [ ] Database migrations ran successfully
- [ ] Backend starts without errors
- [ ] All 16 API endpoints are accessible
- [ ] Prisma client generated
- [ ] Mobile app opens without errors
- [ ] Admin web loads without errors
- [ ] Documentation reviewed
- [ ] Team is ready for Sprint 2

---

**Ready? Let's go! 🚀**

Next: Update this file with Sprint 2 progress.

---

*Last Updated: April 21, 2026*  
*Maintained by: Tech Team*  
*Next Review: Start of Sprint 2*
