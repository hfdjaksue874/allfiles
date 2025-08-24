
import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/orderController.js';
import authenticateUser from '../middleware/middleware.js';

const orderRoute = express.Router();

// Create a new order
orderRoute.post('/create', authenticateUser, createOrder);

// Get all orders for a user
orderRoute.get('/user/:userId', authenticateUser, getUserOrders);

// Get order by ID
orderRoute.get('/:orderId', authenticateUser, getOrderById);

// Update order status
orderRoute.patch('/status/:orderId', authenticateUser, updateOrderStatus);

export default orderRoute;
