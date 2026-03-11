# WebSocket Testing Guide

## 🔌 WebSocket Gateway for Kitchen Display

### Connection Details

**Endpoint:** `ws://localhost:3000/kitchen`  
**Namespace:** `/kitchen`  
**CORS:** Enabled for `http://localhost:3001`

---

## 📡 Events

### Server → Client Events

#### 1. `newOrder`
Emitted when a new order is created (DINE_IN only).

**Payload:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD202602180001",
  "orderType": "DINE_IN",
  "tableNumber": "5",
  "customerName": "John Doe",
  "orderItems": [
    {
      "product": {
        "name": "Nasi Goreng",
        "category": { "name": "Makanan" }
      },
      "quantity": 2,
      "notes": "Extra pedas"
    }
  ],
  "status": "PENDING",
  "createdAt": "2026-02-18T03:00:00Z"
}
```

#### 2. `orderStatusUpdate`
Emitted when kitchen order status changes.

**Payload:**
```json
{
  "orderId": "uuid",
  "status": "COOKING" | "DONE"
}
```

#### 3. `orderCompleted`
Emitted when order is marked as DONE.

**Payload:**
```json
{
  "orderId": "uuid"
}
```

### Client → Server Events

#### 1. `ping`
Test connection.

**Response:** `"pong"`

---

## 🧪 Testing WebSocket

### Option 1: Using wscat (CLI)

```bash
# Install wscat
npm install -g wscat

# Connect to kitchen namespace
wscat -c ws://localhost:3000/kitchen

# Send ping
> ping

# You'll receive events when orders are created/updated
```

### Option 2: Using JavaScript (Browser Console)

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000/kitchen');

// Listen for connection
socket.on('connect', () => {
  console.log('✓ Connected to kitchen gateway');
});

// Listen for new orders
socket.on('newOrder', (order) => {
  console.log('🆕 New Order:', order);
});

// Listen for status updates
socket.on('orderStatusUpdate', (data) => {
  console.log('📝 Status Update:', data);
});

// Listen for completed orders
socket.on('orderCompleted', (data) => {
  console.log('✅ Order Completed:', data);
});

// Test ping
socket.emit('ping', (response) => {
  console.log('Ping response:', response);
});
```

### Option 3: Using Postman

1. Create new WebSocket Request
2. URL: `ws://localhost:3000/kitchen`
3. Connect
4. Listen for events

---

## 🔄 Integration Flow

### 1. Create Order (Triggers WebSocket)

```bash
# Create a DINE_IN order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "orderType": "DINE_IN",
    "tableNumber": "5",
    "items": [
      {"productId": "PRODUCT_ID", "quantity": 2}
    ],
    "paymentMethod": "CASH"
  }'

# WebSocket will emit: newOrder event
```

### 2. Update Kitchen Order Status

```bash
# Get kitchen order ID
KITCHEN_ORDER_ID="..."

# Update to COOKING
curl -X PATCH http://localhost:3000/api/kitchen/orders/$KITCHEN_ORDER_ID/status \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  -H "Content-Type: application/json" \
  -d '{"status": "COOKING"}'

# WebSocket will emit: orderStatusUpdate event

# Update to DONE
curl -X PATCH http://localhost:3000/api/kitchen/orders/$KITCHEN_ORDER_ID/status \
  -H "Authorization: Bearer $(cat token_CASHIER.txt)" \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'

# WebSocket will emit: orderStatusUpdate + orderCompleted events
```

---

## 🎯 Frontend Integration

### React/Next.js Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useKitchenSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/kitchen');
    
    newSocket.on('connect', () => {
      console.log('Connected to kitchen');
    });

    newSocket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
      // Show notification
      toast.success(`New order: ${order.orderNumber}`);
    });

    newSocket.on('orderStatusUpdate', ({ orderId, status }) => {
      setOrders(prev => 
        prev.map(o => o.id === orderId ? { ...o, status } : o)
      );
    });

    newSocket.on('orderCompleted', ({ orderId }) => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, orders };
}
```

---

## ✅ Testing Checklist

- [ ] Connect to WebSocket successfully
- [ ] Receive `newOrder` event when DINE_IN order created
- [ ] Receive `orderStatusUpdate` when status changes
- [ ] Receive `orderCompleted` when order is done
- [ ] Ping/pong works
- [ ] Multiple clients can connect simultaneously
- [ ] Reconnection works after disconnect

---

## 🐛 Troubleshooting

### Connection Refused
- Check if backend server is running
- Verify port 3000 is not blocked
- Check CORS settings

### No Events Received
- Ensure you're creating DINE_IN orders (not TAKEAWAY/DELIVERY)
- Check server logs for WebSocket emissions
- Verify you're listening to correct event names

### Multiple Connections
- Each browser tab creates a new connection
- Use `socket.id` to identify clients
- Implement authentication if needed

---

**Ready for real-time kitchen display!** 🚀
