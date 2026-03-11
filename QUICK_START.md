# Quick Start Guide - Cimahi POS

## 🚀 Start Backend & Frontend

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev

# Wait for:
# ✅ Database connected
# [Nest] ... LOG [NestApplication] Nest application successfully started
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm run dev

# Access: http://localhost:3001
```

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Kasir | kasir@cimahipos.com | cashier123 |
| Admin | admin@cimahipos.com | admin123 |
| Owner | owner@cimahipos.com | owner123 |

## 📍 Routes

- `/login` - Login page
- `/cashier` - Kasir dashboard (CASHIER role)
- `/kitchen` - Kitchen display (all roles)
- `/admin` - Admin panel (ADMIN, OWNER)

## 🐛 Troubleshooting Login

### Issue: "Login gagal"

**Check 1: Backend Running?**
```bash
curl http://localhost:3000/api
# Should return: {"message":"Cimahi POS API"}
```

**Check 2: Test Login Directly**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kasir@cimahipos.com","password":"cashier123"}'
  
# Should return token
```

**Check 3: Browser Console**
- Open DevTools (F12)
- Go to "Network" tab
- Try login
- Click on "login" request
- Check "Response" tab for error

**Check 4: CORS Error?**
If you see CORS error in console:
```bash
# Backend .env should have:
FRONTEND_URL=http://localhost:3001
```

### Common Fixes

**Port 3000 in use:**
```bash
lsof -ti :3000 | xargs kill -9
cd backend && npm run start:dev
```

**Database not seeded:**
```bash
cd backend
npx prisma db seed
```

**Clear browser cache:**
- Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)
- Or clear localStorage in DevTools Console:
```javascript
localStorage.clear()
location.reload()
```

## ✅ Verify Everything Works

```bash
cd backend
./test-api.sh
# Should show mostly PASS
```

## 📞 Still Having Issues?

1. Check browser console for errors
2. Check backend terminal for errors  
3. Verify `.env` files exist:
   - `backend/.env`
   - `frontend/.env.local`
4. Try different browser
5. Check if antivirus/firewall blocking ports

---

**Need help?** Share:
- Browser console errors (screenshot)
- Backend terminal output
- Result of `./test-api.sh`
