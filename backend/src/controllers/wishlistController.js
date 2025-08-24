import WishList from '../models/wishListModel.js';
import productModel from '../models/productModels.js';
import Cart from '../models/cartModel.js';

// Add a helper function to parse array fields
const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') return field.split(',').map(item => item.trim());
    return [field];
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;

        // Validate required fields
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                error: "User ID and Product ID are required"
            });
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Parse sizes and colors properly
        const availableSizes = parseArrayField(product.sizes);
        const availableColors = parseArrayField(product.colors);

        // Validate size if provided
        if (size && availableSizes.length > 0) {
            const normalizedSize = size.toString().trim().toLowerCase();
            const normalizedAvailableSizes = availableSizes.map(s => s.toString().trim().toLowerCase());
            
            if (!normalizedAvailableSizes.includes(normalizedSize)) {
                return res.status(400).json({ 
                    success: false,
                    error: `Size '${size}' is not available for this product. Available sizes: ${availableSizes.join(', ')}` 
                });
            }
        }

        // Validate color if provided
        if (color && availableColors.length > 0) {
            const normalizedColor = color.toString().trim().toLowerCase();
            const normalizedAvailableColors = availableColors.map(c => c.toString().trim().toLowerCase());
            
            if (!normalizedAvailableColors.includes(normalizedColor)) {
                return res.status(400).json({ 
                    success: false,
                    error: `Color '${color}' is not available for this product. Available colors: ${availableColors.join(', ')}` 
                });
            }
        }

        // Find user's wishlist or create new one
        let wishlist = await WishList.findOne({ userId });
        if (!wishlist) {
            wishlist = new WishList({ userId, items: [] });
        }

        // Check if item already exists in wishlist with same specifications
        const existingItemIndex = wishlist.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        if (existingItemIndex > -1) {
            return res.status(400).json({
                success: false,
                error: "Product with these specifications already exists in wishlist"
            });
        }

        // Add new item to wishlist
        wishlist.items.push({
            productId: productId,
            size: size || null,
            color: color || null,
            addedAt: new Date()
        });

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Item added to wishlist successfully",
            wishlist: {
                userId: wishlist.userId,
                items: wishlist.items,
                totalItems: wishlist.items.length
            }
        });

    } catch (error) {
        console.error("Add to Wishlist Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to add item to wishlist: " + error.message
        });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const wishlist = await WishList.findOne({ userId }).populate({
            path: 'items.productId',
            model: 'Product',
            select: 'name price discount image1 image2 image3 image4 category subCategory sizes colors'
        });

        if (!wishlist || wishlist.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is empty",
                wishlist: {
                    items: [],
                    totalItems: 0
                }
            });
        }

        // Format items with product details
        const formattedItems = wishlist.items
            .filter(item => item.productId) // Filter out items with null productId
            .map(item => {
                const product = item.productId;
                
                // Skip if product is null or undefined
                if (!product) {
                    return null;
                }

                // Parse sizes and colors
                const availableSizes = parseArrayField(product.sizes);
                const availableColors = parseArrayField(product.colors);

                return {
                    _id: item._id,
                    productId: product._id,
                    productName: product.name,
                    productImage: product.image1,
                    allImages: [product.image1, product.image2, product.image3, product.image4].filter(img => img),
                    category: product.category,
                    subCategory: product.subCategory,
                    price: product.price,
                    discount: product.discount,
                    discountedPrice: product.discount > 0 
                        ? product.price - (product.price * product.discount / 100)
                        : product.price,
                    size: item.size,
                    color: item.color,
                    availableSizes: availableSizes,
                    availableColors: availableColors,
                    addedAt: item.addedAt
                };
            })
            .filter(Boolean); // Remove any null items from the result

        res.status(200).json({
            success: true,
            message: "Wishlist retrieved successfully",
            wishlist: {
                userId: wishlist.userId,
                items: formattedItems,
                totalItems: formattedItems.length
            }
        });

    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get wishlist: " + error.message
        });
    }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                error: "User ID and Product ID are required"
            });
        }

        const wishlist = await WishList.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                error: "Wishlist not found"
            });
        }

        const itemIndex = wishlist.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Item not found in wishlist"
            });
        }

        // Remove the item from wishlist
        wishlist.items.splice(itemIndex, 1);
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Item removed from wishlist successfully",
            wishlist: {
                userId: wishlist.userId,
                items: wishlist.items,
                totalItems: wishlist.items.length
            }
        });

    } catch (error) {
        console.error("Remove from Wishlist Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to remove item from wishlist: " + error.message
        });
    }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const wishlist = await WishList.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                error: "Wishlist not found"
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully",
            wishlist: {
                userId: wishlist.userId,
                items: [],
                totalItems: 0
            }
        });

    } catch (error) {
        console.error("Clear Wishlist Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to clear wishlist: " + error.message
        });
    }
};

// Check if product is in wishlist
const checkWishlistItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        console.log("Request body received:", req.body); // Add this for debugging

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                error: "User ID and Product ID are required"
            });
        }

        const wishlist = await WishList.findOne({ userId });
        
        if (!wishlist) {
            return res.status(200).json({
                success: true,
                inWishlist: false
            });
        }

        const isInWishlist = wishlist.items.some(
            item => item.productId.toString() === productId
        );

        res.status(200).json({
            success: true,
            inWishlist: isInWishlist
        });

    } catch (error) {
        console.error("Check Wishlist Item Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to check wishlist item: " + error.message
        });
    }
};


// Move item from wishlist to cart
const moveToCart = async (req, res) => {
    console.log("moveToCart function called with body:", req.body); // Add this debug line
    
    try {
        const { userId, productId, quantity = 1, size, color } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                error: "User ID and Product ID are required"
            });
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        // Remove from wishlist
        const wishlist = await WishList.findOne({ userId });
        if (wishlist) {
            const itemIndex = wishlist.items.findIndex(
                item => item.productId.toString() === productId && 
                       (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                       (item.color || '').toLowerCase() === (color || '').toLowerCase()
            );
            
            if (itemIndex > -1) {
                wishlist.items.splice(itemIndex, 1);
                await wishlist.save();
            }
        }

        // Calculate prices for cart
        const originalPrice = Number(product.price);
        const discountPercent = Number(product.discount) || 0;
        const unitPrice = discountPercent > 0 
            ? originalPrice - (originalPrice * discountPercent / 100)
            : originalPrice;
        const totalPrice = quantity * unitPrice;

        // Find user's cart or create new one
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ 
                userId, 
                items: [] 
            });
        }

        // Check if item already exists in cart with same specifications
        const existingCartItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        if (existingCartItemIndex > -1) {
            // Update quantity if item exists
            const existingItem = cart.items[existingCartItemIndex];
            const newQuantity = existingItem.quantity + Number(quantity);
            const newTotalPrice = newQuantity * unitPrice;
            
            cart.items[existingCartItemIndex].quantity = newQuantity;
            cart.items[existingCartItemIndex].totalPrice = Number(newTotalPrice.toFixed(2));
        } else {
            // Create new item object with all required fields
            cart.items.push({
                productId: productId,
                quantity: Number(quantity),
                size: size || null,
                color: color || null,
                unitPrice: Number(unitPrice.toFixed(2)),
                originalPrice: Number(originalPrice.toFixed(2)),
                discount: discountPercent,
                totalPrice: Number(totalPrice.toFixed(2))
            });
        }

        await cart.save();

        // Calculate cart totals
        const cartTotal = cart.items.reduce((total, item) => total + Number(item.totalPrice), 0);
        const totalItems = cart.items.reduce((total, item) => total + Number(item.quantity), 0);
        
        // Calculate total savings
        const totalSavings = cart.items.reduce((savings, item) => {
            return savings + ((item.originalPrice - item.unitPrice) * item.quantity);
        }, 0);

        res.status(200).json({
            success: true,
            message: "Item moved to cart successfully",
            cart: {
                userId: cart.userId,
                items: cart.items,
                cartTotal: Number(cartTotal.toFixed(2)),
                totalItems: totalItems,
                cartSummary: {
                    totalProducts: cart.items.length,
                    totalQuantity: totalItems,
                    totalAmount: Number(cartTotal.toFixed(2)),
                    totalSavings: Number(totalSavings.toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error("Move to Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to move item to cart: " + error.message
        });
    }
};

export {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistItem,
    moveToCart
};
