# Startup Script - Cimahi POS

echo "🚀 Starting Cimahi POS System"
echo "=============================="
echo ""

# Kill existing processes
echo "1. Cleaning up existing processes..."
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "nest start" 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
sleep 2
echo "✓ Cleanup complete"
echo ""

# Start backend
echo "2. Starting Backend (port 3000)..."
cd backend
npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Waiting for backend to start..."
sleep 10

# Check if backend is running
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo "✓ Backend is running on port 3000"
else
    echo "✗ Backend failed to start!"
    echo "   Check logs: tail -f /tmp/backend.log"
    exit 1
fi
echo ""

# Start frontend
echo "3. Starting Frontend (port 3001)..."
cd ../frontend
PORT=3001 npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo "   Waiting for frontend to start..."
sleep 5

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✓ Frontend is running on port 3001"
else
    echo "✗ Frontend failed to start!"
    echo "   Check logs: tail -f /tmp/frontend.log"
    exit 1
fi
echo ""

echo "=============================="
echo "✅ System is ready!"
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:3000/api"
echo "   Frontend: http://localhost:3001"
echo "   Swagger:  http://localhost:3000/api/docs"
echo ""
echo "🔐 Login:"
echo "   Email:    kasir@cimahipos.com"
echo "   Password: cashier123"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "=============================="
