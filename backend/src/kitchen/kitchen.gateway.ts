import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    },
    namespace: '/kitchen',
})
export class KitchenGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('KitchenGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Emit new order to all kitchen clients
    emitNewOrder(order: any) {
        this.server.emit('newOrder', order);
        this.logger.log(`New order emitted: ${order.orderNumber}`);
    }

    // Emit order status update
    emitOrderStatusUpdate(orderId: string, status: string) {
        this.server.emit('orderStatusUpdate', { orderId, status });
        this.logger.log(`Order status updated: ${orderId} -> ${status}`);
    }

    // Emit order completed
    emitOrderCompleted(orderId: string) {
        this.server.emit('orderCompleted', { orderId });
        this.logger.log(`Order completed: ${orderId}`);
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket): string {
        return 'pong';
    }
}
