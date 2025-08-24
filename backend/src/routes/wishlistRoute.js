import express from 'express';
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistItem,
    moveToCart
} from '../controllers/wishlistController.js';
import authenticateUser from '../middleware/middleware.js';

const wishlistRoute = express.Router();

// Add item to wishlist
wishlistRoute.post('/add', authenticateUser, addToWishlist);

// Remove item from wishlist
wishlistRoute.delete('/remove', authenticateUser, removeFromWishlist);

// Clear entire wishlist
wishlistRoute.delete('/clear', authenticateUser, clearWishlist);

// Check if item is in wishlist
wishlistRoute.post('/check/item', authenticateUser, checkWishlistItem);

// Move item from wishlist to cart - CHANGED PATH to be more specific
wishlistRoute.post('/transfer-to-cart', authenticateUser, moveToCart);

// Get user's wishlist
wishlistRoute.get('/:userId', authenticateUser, getWishlist);

export default wishlistRoute;