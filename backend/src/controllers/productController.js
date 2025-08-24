import productModel from '../models/productModels.js'
import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs';

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, colors,quantity, bestseller, discount, stock } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({ error: "Name, description, price, category, and subCategory are required." });
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: "Cloudinary configuration is missing" 
            });
        }

        // Handle images: upload to Cloudinary
        const images = [];
        
        // Process files from req.files array instead of req.files object
        if (req.files && req.files.length > 0) {
            // Sort files by fieldname to maintain order (image1, image2, etc.)
            const sortedFiles = req.files.sort((a, b) => {
                const aNum = parseInt(a.fieldname.replace('image', '')) || 0;
                const bNum = parseInt(b.fieldname.replace('image', '')) || 0;
                return aNum - bNum;
            });

            for (const file of sortedFiles) {
                try {
                    console.log(`Uploading ${file.fieldname} from path: ${file.path}`);
                    
                    const uploadResult = await cloudinary.uploader.upload(file.path, { 
                        folder: "products",
                        resource_type: "auto"
                    });
                    
                    images.push(uploadResult.secure_url);
                    
                    // Delete local file after successful upload
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (uploadError) {
                    console.error(`Error uploading ${file.fieldname}:`, uploadError);
                    return res.status(500).json({ 
                        success: false, 
                        error: `Failed to upload ${file.fieldname}: ${uploadError.message}` 
                    });
                }
            }
        }

        let parsedColors = [];
      let parsedSizes = [];

      // Handle colors
      if (colors) {
        try {
          if (typeof colors === 'string') {
            parsedColors = JSON.parse(colors);
          } else if (Array.isArray(colors)) {
            parsedColors = colors;
          }
        } catch (parseError) {
          console.error('Error parsing colors:', parseError);
          console.log('Colors value:', colors);
          parsedColors = [];
        }
      }

      // Handle sizes
      if (sizes) {
        try {
          if (typeof sizes === 'string') {
            parsedSizes = JSON.parse(sizes);
          } else if (Array.isArray(sizes)) {
            parsedSizes = sizes;
          }
        } catch (parseError) {
          console.error('Error parsing sizes:', parseError);
          console.log('Sizes value:', sizes);
          parsedSizes = [];
        }
      }

      console.log('Parsed colors:', parsedColors);
      console.log('Parsed sizes:', parsedSizes);

      // Ensure arrays are valid
      if (!Array.isArray(parsedColors)) parsedColors = [];
      if (!Array.isArray(parsedSizes)) parsedSizes = [];

        // Create and save product
        const product = new productModel({
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: parsedSizes,
            colors: parsedColors,
            bestseller: bestseller === 'true',
            images,
            discount: discount ? Number(discount) : 0,
            stock: stock || 'inStock',
            quantity : quantity || 1, // Default to 1 if not provided
           
            date: Date.now()
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully", 
            product 
        });
    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({
            success: false, 
            error: "Failed to add product: " + error.message
        });
    }
};

const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch products" 
        });
    }
};

const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await productModel.findByIdAndDelete(id);
        res.status(200).json({
            success: true, 
            message: "Product removed successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to remove product" 
        });
    }
};

const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: "Product not found" 
            });
        }
        res.status(200).json({ 
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({  
            success: false,
            error: "Failed to fetch product" 
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, subCategory, sizes, colors, bestseller, discount, isShow, stock } = req.body;

        console.log('Update request body:', req.body);
        console.log('Files received:', req.files);

        // Find the existing product
        const existingProduct = await productModel.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ 
                success: false,
                error: "Product not found" 
            });
        }

        // Prepare update data
        const updateData = {};

        // Only update fields that are provided
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = Number(price);
        if (category !== undefined) updateData.category = category;
        if (subCategory !== undefined) updateData.subCategory = subCategory;
        if (bestseller !== undefined) updateData.bestseller = bestseller === 'true' || bestseller === true;
        if (discount !== undefined) updateData.discount = Number(discount);
        if (isShow !== undefined) updateData.isshow = isShow === 'true' || isShow === true;
        if (stock !== undefined) updateData.stock = stock;

        // Handle sizes
        if (sizes !== undefined) {
            try {
                if (typeof sizes === 'string') {
                    updateData.sizes = JSON.parse(sizes);
                } else if (Array.isArray(sizes)) {
                    updateData.sizes = sizes;
                } else {
                    updateData.sizes = [];
                }
            } catch (error) {
                console.error('Error parsing sizes:', error);
                updateData.sizes = [];
            }
        }

        // Handle colors
        if (colors !== undefined) {
            try {
                if (typeof colors === 'string') {
                    updateData.colors = JSON.parse(colors);
                } else if (Array.isArray(colors)) {
                    updateData.colors = colors;
                } else {
                    updateData.colors = [];
                }
            } catch (error) {
                console.error('Error parsing colors:', error);
                updateData.colors = [];
            }
        }

        // Handle image updates if new images are provided
        if (req.files && req.files.length > 0) {
            const images = [...existingProduct.images]; // Start with existing images
            
            // Sort files by fieldname to maintain order
            const sortedFiles = req.files.sort((a, b) => {
                const aNum = parseInt(a.fieldname.replace('image', '')) || 0;
                const bNum = parseInt(b.fieldname.replace('image', '')) || 0;
                return aNum - bNum;
            });
            
            for (const file of sortedFiles) {
                try {
                    console.log(`Uploading ${file.fieldname} from path: ${file.path}`);
                    
                    const uploadResult = await cloudinary.uploader.upload(file.path, { 
                        folder: "products",
                        resource_type: "auto"
                    });
                    
                    // Get the index from fieldname (image1 -> 0, image2 -> 1, etc.)
                    const imageIndex = parseInt(file.fieldname.replace('image', '')) - 1;
                    if (imageIndex >= 0 && imageIndex < 4) {
                        images[imageIndex] = uploadResult.secure_url;
                    }
                    
                    // Delete local file after successful upload
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                } catch (uploadError) {
                    console.error(`Error uploading ${file.fieldname}:`, uploadError);
                    return res.status(500).json({ 
                        success: false, 
                        error: `Failed to upload ${file.fieldname}: ${uploadError.message}` 
                    });
                }
            }
            updateData.images = images;
        }

        console.log('Final update data:', updateData);

        // Update the product
        const product = await productModel.findByIdAndUpdate(id, updateData, { 
            new: true,
            runValidators: true 
        });

        res.status(200).json({ 
            success: true, 
            message: "Product updated successfully",
            product 
        });

    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to update product: " + error.message
        });
    }
};

const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        res.status(200).json({ 
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch user" 
        });
    }
};
export {
    addProduct,
    removeProduct,
    singleProduct,
    listProduct,
    updateProduct
}