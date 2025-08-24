import express from 'express';
import { createPincode, deletePincode, getPincode } from '../controllers/pincodeController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const pinRoute = express.Router();

pinRoute.get('/', getPincode);

// Admin routes
pinRoute.post('/add', requireAdmin, createPincode);
pinRoute.delete('/delete', requireAdmin, deletePincode);

export default pinRoute;