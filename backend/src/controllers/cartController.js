import Cart from '../models/cartModel.js';
import productModel from '../models/productModels.js';

// Helper function to parse array fields
const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
        try {
            return JSON.parse(field);
        } catch {
            return field.split(',').map(item => item.trim());
        }
    }
    return [];
};

// Add to cart
const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1, size, color } = req.body;

        // Validate required fields
        if (!userId || !productId) {
            return res.status(400).json({ 
                success: false,
                error: "User ID and Product ID are required" 
            });
        }

        // Validate quantity
        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ 
                success: false,
                error: "Quantity must be a positive number" 
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

        // Check if product is in stock
        if (product.stock === 'outOfStock') {
            return res.status(400).json({ 
                success: false,
                error: "Product is out of stock" 
            });
        }

        // Check if requested quantity is available
        if (product.quantity < qty) {
            return res.status(400).json({ 
                success: false,
                error: `Only ${product.quantity} items available in stock` 
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

        // Calculate prices
        const originalPrice = Number(product.price);
        if (isNaN(originalPrice) || originalPrice <= 0) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid product price" 
            });
        }
        const discountPercent = Number(product.discount) || 0;
        const unitPrice = discountPercent > 0 
            ? originalPrice - (originalPrice * discountPercent / 100)
            : originalPrice;
        const totalPrice = qty * unitPrice;

        // Validate calculated prices
        if (isNaN(unitPrice) || isNaN(totalPrice) || unitPrice < 0 || totalPrice < 0) {
            return res.status(400).json({ 
                success: false,
                error: "Error calculating prices" 
            });
        }

        // Find user's cart or create new one
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ 
                userId, 
                items: [] 
            });
        }

        // Check if item already exists in cart with same specifications
        const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        let quantityToDeduct = qty;

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            const existingItem = cart.items[existingItemIndex];
            const newQuantity = existingItem.quantity + qty;
            const newTotalPrice = newQuantity * unitPrice;
            
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].totalPrice = Number(newTotalPrice.toFixed(2));
            cart.items[existingItemIndex].unitPrice = Number(unitPrice.toFixed(2));
            cart.items[existingItemIndex].originalPrice = Number(originalPrice.toFixed(2));
            cart.items[existingItemIndex].discount = discountPercent;
        } else {
            // Create new item object with all required fields
            const newItem = {
                productId: productId,
                quantity: qty,
                size: size || null,
                color: color || null,
                unitPrice: Number(unitPrice.toFixed(2)) || 0,
                originalPrice: Number(originalPrice.toFixed(2)) || 0,
                discount: discountPercent || 0,
                totalPrice: Number(totalPrice.toFixed(2)) || 0
            };
            
            // Double-check that all required fields have valid values
            if (isNaN(newItem.unitPrice) || newItem.unitPrice === null) {
                newItem.unitPrice = 0;
            }
            
            if (isNaN(newItem.originalPrice) || newItem.originalPrice === null) {
                newItem.originalPrice = 0;
            }
            
            if (isNaN(newItem.totalPrice) || newItem.totalPrice === null) {
                newItem.totalPrice = 0;
            }
            
            cart.items.push(newItem);
        }

        // Before saving, validate that all items have valid product references and required fields
        cart.items = cart.items.filter(item => {
            // Check if productId exists and is valid
            if (!item.productId) {
                console.warn("Removing cart item with missing productId");
                return false;
            }
            
            // Ensure all required fields have values
            if (item.unitPrice === undefined || item.unitPrice === null) {
                item.unitPrice = 0;
            }
            if (item.originalPrice === undefined || item.originalPrice === null) {
                item.originalPrice = 0;
            }
            if (item.totalPrice === undefined || item.totalPrice === null) {
                item.totalPrice = 0;
            }
            
            return true;
        });

        // Update product quantity and stock status
        product.quantity -= quantityToDeduct;
        
        // If quantity reaches 0, update stock status to 'outOfStock'
        if (product.quantity <= 0) {
            product.quantity = 0;
            product.stock = 'outOfStock';
        }
        
        // Save product with updated quantity
        await product.save();

        // Save cart
        try {
            await cart.save();
        } catch (saveError) {
            console.error("Cart Save Error:", saveError);
            // Log the actual cart items for debugging
            console.log("Cart items before save:", JSON.stringify(cart.items, null, 2));
            return res.status(500).json({
                success: false,
                error: "Failed to save cart: " + saveError.message,
                details: saveError.errors ? Object.keys(saveError.errors).map(key => ({
                    field: key,
                    message: saveError.errors[key].message
                })) : []
            });
        }

        // Populate cart with product details for response
        const populatedCart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'name price discount image1 image2 image3 image4 category subCategory sizes colors stock quantity'
        });

        // Calculate cart totals and format response
        const cartTotal = populatedCart.items.reduce((total, item) => total + Number(item.totalPrice), 0);
        const totalItems = populatedCart.items.reduce((total, item) => total + Number(item.quantity), 0);

        // Format items with product details
        const formattedItems = populatedCart.items
            .filter(item => item.productId) // Filter out items with null productId
            .map(item => {
                const product = item.productId;
                
                // Skip if product is null or undefined
                if (!product) {
                    console.error(`Missing product reference for item: ${item._id}`);
                    return null;
                }

                return {
                    _id: item._id,
                    productId: product._id,
                    productName: product.name,
                    productImage: product.image1, // Main product image
                    allImages: [product.image1, product.image2, product.image3, product.image4].filter(img => img),
                    category: product.category,
                    subCategory: product.subCategory,
                    originalPrice: item.originalPrice,
                    discount: item.discount,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    totalPrice: item.totalPrice,
                    availableSizes: parseArrayField(product.sizes),
                    availableColors: parseArrayField(product.colors),
                    stock: product.stock,
                    availableQuantity: product.quantity
                };
            })
            .filter(Boolean); // Remove any null items from the result

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cart: {
                userId: populatedCart.userId,
                items: formattedItems,
                cartTotal: Number(cartTotal.toFixed(2)),
                totalItems: totalItems,
                cartSummary: {
                    totalProducts: formattedItems.length,
                    totalQuantity: totalItems,
                    totalAmount: Number(cartTotal.toFixed(2)),
                    totalSavings: Number(formattedItems.reduce((savings, item) => {
                        return savings + ((item.originalPrice - item.unitPrice) * item.quantity);
                    }, 0).toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error("Add to Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to add item to cart: " + error.message
        });
    }
};

// Get cart with full product details
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'name price discount image1 image2 image3 image4 category subCategory sizes colors'
        });
        
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: { 
                    userId,
                    items: [], 
                    cartTotal: 0,
                    totalItems: 0,
                    cartSummary: {
                        totalProducts: 0,
                        totalQuantity: 0,
                        totalAmount: 0,
                        totalSavings: 0
                    }
                }
            });
        }

        // Calculate totals and format response
        const cartTotal = cart.items.reduce((total, item) => total + Number(item.totalPrice), 0);
        const totalItems = cart.items.reduce((total, item) => total + Number(item.quantity), 0);

        // Format items with product details
        const formattedItems = cart.items
            .filter(item => item.productId) // Filter out items with null productId
            .map(item => {
                const product = item.productId;
                
                // Skip if product is null or undefined
                if (!product) {
                    console.error(`Missing product reference for item: ${item._id}`);
                    return null;
                }

                return {
                    _id: item._id,
                    productId: product._id,
                    productName: product.name,
                    productImage: product.image1,
                    allImages: [product.image1, product.image2, product.image3, product.image4].filter(img => img),
                    category: product.category,
                    subCategory: product.subCategory,
                    originalPrice: item.originalPrice,
                    discount: item.discount,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    totalPrice: item.totalPrice,
                    availableSizes: parseArrayField(product.sizes),
                    availableColors: parseArrayField(product.colors)
                };
            })
            .filter(Boolean); // Remove any null items from the result

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            cart: {
                userId: cart.userId,
                items: formattedItems,
                cartTotal: Number(cartTotal.toFixed(2)),
                totalItems: totalItems,
                cartSummary: {
                    totalProducts: formattedItems.length,
                    totalQuantity: totalItems,
                    totalAmount: Number(cartTotal.toFixed(2)),
                    totalSavings: Number(formattedItems.reduce((savings, item) => {
                        return savings + ((item.originalPrice - item.unitPrice) * item.quantity);
                    }, 0).toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get cart: " + error.message
        });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    try {
        const { userId, productId, quantity, size, color } = req.body;

        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ 
                success: false,
                error: "User ID, Product ID, and quantity are required" 
            });
        }

        if (quantity < 0) {
            return res.status(400).json({ 
                success: false,
                error: "Quantity cannot be negative" 
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false,
                error: "Cart not found" 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false,
                error: "Item not found in cart" 
            });
        }

        const item = cart.items[itemIndex];
        const product = await productModel.findById(item.productId);
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: "Product not found" 
            });
        }

        // Calculate quantity difference
        const quantityDifference = Number(quantity) - item.quantity;
        
        // Check if we're increasing quantity and if there's enough stock
        if (quantityDifference > 0) {
            if (product.stock === 'outOfStock') {
                return res.status(400).json({ 
                    success: false,
                    error: "Product is out of stock" 
                });
            }
            
            if (product.quantity < quantityDifference) {
                return res.status(400).json({ 
                    success: false,
                    error: `Cannot add ${quantityDifference} more items. Only ${product.quantity} available in stock.` 
                });
            }
        }

        if (quantity === 0) {
            // Return product quantity to inventory before removing from cart
            product.quantity += item.quantity;
            if (product.stock === 'outOfStock' && product.quantity > 0) {
                product.stock = 'inStock';
            }
            
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Update product quantity based on the difference
            if (quantityDifference > 0) {
                // Decreasing inventory (adding more to cart)
                product.quantity -= quantityDifference;
                if (product.quantity <= 0) {
                    product.stock = 'outOfStock';
                    product.quantity = 0;
                }
            } else if (quantityDifference < 0) {
                // Increasing inventory (removing from cart)
                product.quantity += Math.abs(quantityDifference);
                if (product.stock === 'outOfStock' && product.quantity > 0) {
                    product.stock = 'inStock';
                }
            }
            
            // Update cart item
            const originalPrice = Number(product.price);
            if (isNaN(originalPrice) || originalPrice <= 0) {
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid product price" 
                });
            }
            const discountPercent = Number(product.discount) || 0;
            const unitPrice = discountPercent > 0 
                ? originalPrice - (originalPrice * discountPercent / 100)
                : originalPrice;

            // Ensure all required fields are set with proper number formatting
            item.quantity = Number(quantity);
            item.totalPrice = Number((Number(quantity) * unitPrice).toFixed(2));
            item.unitPrice = Number(unitPrice.toFixed(2));
            item.originalPrice = Number(originalPrice.toFixed(2));
            item.discount = discountPercent;
        }

        await product.save();
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
            message: "Cart updated successfully",
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
        console.error("Update Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update cart: " + error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ 
                success: false,
                error: "User ID and Product ID are required" 
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false,
                error: "Cart not found" 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId && 
                   (item.size || '').toLowerCase() === (size || '').toLowerCase() && 
                   (item.color || '').toLowerCase() === (color || '').toLowerCase()
        );

        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false,
                error: "Item not found in cart" 
            });
        }

        // Return product quantity to inventory before removing from cart
        const item = cart.items[itemIndex];
        const product = await productModel.findById(item.productId);
        if (product) {
            product.quantity += item.quantity;
            if (product.stock === 'outOfStock' && product.quantity > 0) {
                product.stock = 'inStock';
            }
            await product.save();
        }

        cart.items.splice(itemIndex, 1);
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
            message: "Item removed from cart successfully",
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
        console.error("Remove from Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to remove item from cart: " + error.message
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ 
                success: false,
                error: "Cart not found" 
            });
        }

        // Return all product quantities to inventory
        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.quantity += item.quantity;
                if (product.stock === 'outOfStock' && product.quantity > 0) {
                    product.stock = 'inStock';
                }
                await product.save();
            }
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart: {
                userId: cart.userId,
                items: [],
                cartTotal: 0,
                totalItems: 0,
                cartSummary: {
                    totalProducts: 0,
                    totalQuantity: 0,
                    totalAmount: 0,
                    totalSavings: 0
                }
            }
        });

    } catch (error) {
        console.error("Clear Cart Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to clear cart: " + error.message
        });
    }
};

// Process purchase/checkout
const processPurchase = async (req, res) => {
    try {
        const { userId, shippingAddress, paymentMethod } = req.body;

        if (!userId || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ 
                success: false,
                error: "User ID, shipping address, and payment method are required" 
            });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Cart is empty"
            });
        }

        // Validate all items are still available and prices are current
        const purchaseItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    error: `Product ${item.productId} is no longer available`
                });
            }

            // Recalculate current price
            const currentPrice = product.discount > 0 
                ? product.price - (product.price * product.discount / 100)
                : product.price;

            const itemTotal = item.quantity * currentPrice;
            totalAmount += itemTotal;

            purchaseItems.push({
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                unitPrice: currentPrice,
                originalPrice: product.price,
                discount: product.discount,
                totalPrice: itemTotal
            });
        }

        // Create purchase summary
        const purchaseSummary = {
            userId,
            items: purchaseItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            totalItems: purchaseItems.reduce((total, item) => total + item.quantity, 0),
            shippingAddress,
            paymentMethod,
            orderDate: new Date()
        };

        // Here you would typically:
        // 1. Process payment
        // 2. Create order record
        // 3. Update inventory
        // 4. Clear cart
        // 5. Send confirmation email

        // For now, just clear the cart
        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Purchase processed successfully",
            purchaseSummary
        });

    } catch (error) {
        console.error("Process Purchase Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process purchase: " + error.message
        });
    }
};

export { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    processPurchase 
};
