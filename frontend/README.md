# Cimahi POS - Frontend

Modern Point of Sale (POS) system frontend built with Next.js 14, TypeScript, and TailwindCSS.

## 🚀 Features

### ✅ Implemented
- **Authentication** - Login with JWT, role-based access
- **Kasir Dashboard** - Product catalog, search, category filter
- **Shopping Cart** - Add/remove items, quantity control
- **Payment** - Multiple payment methods (Cash, Debit, QRIS, Transfer)
- **Responsive Design** - Mobile-first approach

### 🚧 Coming Soon
- Kitchen Display System (KDS)
- Admin Panel
- Reports & Analytics
- Stock Management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js >= 18
- npm or yarn
- Backend API running on http://localhost:3000

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Kasir** | kasir@cimahipos.com | cashier123 |
| **Admin** | admin@cimahipos.com | admin123 |
| **Owner** | owner@cimahipos.com | owner123 |

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── cashier/            # Kasir dashboard
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirect)
│   └── providers.tsx       # React Query provider
├── components/
│   └── cashier/            # Cashier components
│       ├── Cart.tsx
│       └── PaymentModal.tsx
├── lib/
│   ├── api.ts              # Axios instance
│   ├── utils.ts            # Utility functions
│   └── store/              # Zustand stores
│       ├── auth.ts
│       └── cart.ts
├── types/
│   └── index.ts            # TypeScript types
└── public/                 # Static assets
```

## 🎨 Features Detail

### Kasir Dashboard

- **Product Catalog**: Grid view with search and category filter
- **Shopping Cart**: Real-time cart with quantity controls
- **Payment**: Support for Cash, Debit, QRIS, and Transfer
- **Change Calculation**: Automatic change calculation for cash payments
- **Success Animation**: Smooth payment success feedback

### Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Automatic token refresh
- Protected routes

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:3000/api`.

### Endpoints Used

- `POST /auth/login` - User login
- `GET /products/available` - Get available products
- `GET /categories` - Get all categories

## 🚀 Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Next Steps

1. **Kitchen Display System**
   - Real-time order display
   - WebSocket integration
   - Order status updates

2. **Admin Panel**
   - Dashboard with statistics
   - User management (CRUD)
   - Product management (CRUD)
   - Stock management

3. **Reports**
   - Sales reports
   - Product performance
   - Charts and analytics

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

### API Connection Error

Make sure backend is running:
```bash
cd ../backend
npm run start:dev
```

### Module Not Found

```bash
rm -rf node_modules .next
npm install
```

## 📄 License

MIT

---

**Built with ❤️ for UMKM businesses**
