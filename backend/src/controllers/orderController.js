
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import productModel from '../models/productModels.js';

// Create a new order from cart
const createOrder = async (req, res) => {
    try {
        const { userId, addressId, paymentMethod, paymentStatus = "pending" } = req.body;

        // Validate required fields
        if (!userId || !addressId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: "User ID, address ID, and payment method are required"
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'name price discount image1 category subCategory'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Cart is empty"
            });
        }

        // Format order products
        const orderProducts = cart.items.map(item => {
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.unitPrice,
                size: item.size || null,
                color: item.color || null
            };
        });

        // Calculate total price
        const totalPrice = cart.items.reduce((total, item) => total + Number(item.totalPrice), 0);

        // Create new order
        const newOrder = new Order({
            userId,
            products: orderProducts,
            totalPrice: Number(totalPrice.toFixed(2)),
            shippingAddress: addressId,
            paymentMethod,
            paymentStatus
        });

        await newOrder.save();

        // Clear the cart after successful order creation
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create order: " + error.message
        });
    }
};

// Get all orders for a user
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const orders = await Order.find({ userId })
            .populate({
                path: 'products.productId',
                select: 'name image1 category subCategory'
            })
            .populate('shippingAddress')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders
        });

    } catch (error) {
        console.error("Get User Orders Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get orders: " + error.message
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: "Order ID is required"
            });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'products.productId',
                select: 'name image1 category subCategory'
            })
            .populate('shippingAddress');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            order
        });

    } catch (error) {
        console.error("Get Order Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get order: " + error.message
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                error: "Order ID and status are required"
            });
        }

        // Validate status
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update order status: " + error.message
        });
    }
};

export {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
};
