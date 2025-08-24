import express from 'express';
import {
    addAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    getDefaultAddress
} from '../controllers/orderAddressController.js';
import authenticateUser from '../middleware/middleware.js';

const orderAddressRoute = express.Router();

// Add new address
orderAddressRoute.post('/add', authenticateUser, addAddress);

// Get all addresses for a user
orderAddressRoute.get('/user/:userId', authenticateUser, getUserAddresses);

// Get single address by ID
orderAddressRoute.get('/:addressId', authenticateUser, getAddressById);

// Get default address for a user
orderAddressRoute.get('/user/:userId/default', authenticateUser, getDefaultAddress);

// Update address
orderAddressRoute.put('/update/:addressId', authenticateUser, updateAddress);

// Set default address
orderAddressRoute.patch('/set-default/:addressId', authenticateUser, setDefaultAddress);

// Delete address (soft delete)
orderAddressRoute.delete('/delete/:addressId', authenticateUser, deleteAddress);

export default orderAddressRoute;