import express from 'express';

import upload from '../config/multer.js';
import { addProduct, listProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const productRoute = express.Router();

// Use upload.any() to accept any file fields
productRoute.post('/add', requireAdmin, upload.any(), addProduct);
productRoute.post('/remove', requireAdmin, removeProduct);
productRoute.get('/:id', singleProduct);
productRoute.get('/', listProduct);

// Updated route to handle file uploads for updates
productRoute.put('/update/:id', upload.any(), updateProduct);

export default productRoute;
