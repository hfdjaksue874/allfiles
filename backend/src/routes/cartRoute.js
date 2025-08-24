import express from 'express';
import { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
} from '../controllers/cartController.js';
import authenticateUser from '../middleware/middleware.js';

const cartRoute = express.Router();

// Add item to cart
cartRoute.post('/add', authenticateUser, addToCart);

// Get user's cart
cartRoute.get('/:userId', authenticateUser, getCart);

// Update cart item quantity
cartRoute.put('/update', authenticateUser, updateCartItem);

// Remove item from cart
cartRoute.delete('/remove', authenticateUser, removeFromCart);

// Clear entire cart
cartRoute.delete('/clear', authenticateUser, clearCart);

export default cartRoute;