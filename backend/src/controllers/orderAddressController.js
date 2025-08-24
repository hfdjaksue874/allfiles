import OrderAddress from '../models/orderAddressModel.js';
import mongoose from 'mongoose';

// Add new address
const addAddress = async (req, res) => {
    try {
        const {
            userId,
            name,
            phoneNumber,
            email, // Add missing email
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            
        } = req.body;

        // Validate required fields
        if (!userId || !name || !phoneNumber || !email || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                error: "All required fields must be provided"
            });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid user ID format"
            });
        }

        // Check if this is the user's first address, make it default
        const existingAddresses = await OrderAddress.find({ userId, isActive: true });
        const shouldBeDefault = existingAddresses.length === 0 || isDefault === true;

        // Create new address
        const newAddress = new OrderAddress({
            userId,
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim().toLowerCase(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2?.trim() || '',
            landmark: landmark?.trim() || '',
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
       
        });

        await newAddress.save();

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: newAddress
        });

    } catch (error) {
        console.error("Add Address Error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to add address: " + error.message
        });
    }
};

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }
        

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid user ID format"
            });
        }

        const addresses = await OrderAddress.find({ 
            userId, 
            isActive: true 
        }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Addresses retrieved successfully",
            addresses,
            totalAddresses: addresses.length
        });

    } catch (error) {
        console.error("Get User Addresses Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get addresses: " + error.message
        });
    }
};

// Get single address by ID
const getAddressById = async (req, res) => {
    try {
        const { addressId } = req.params;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                error: "Address ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid address ID format"
            });
        }

        const address = await OrderAddress.findOne({ 
            _id: addressId, 
            isActive: true 
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                error: "Address not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Address retrieved successfully",
            address
        });

    } catch (error) {
        console.error("Get Address By ID Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get address: " + error.message
        });
    }
};

// Get default address for a user
const getDefaultAddress = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid user ID format"
            });
        }

        const defaultAddress = await OrderAddress.findOne({ 
            userId, 
            isDefault: true, 
            isActive: true 
        });

        if (!defaultAddress) {
            return res.status(404).json({
                success: false,
                error: "No default address found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Default address retrieved successfully",
            address: defaultAddress
        });

    } catch (error) {
        console.error("Get Default Address Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get default address: " + error.message
        });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updateData = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                error: "Address ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid address ID format"
            });
        }

        // Remove fields that shouldn't be updated directly
        delete updateData.userId;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Trim string fields
        Object.keys(updateData).forEach(key => {
            if (typeof updateData[key] === 'string') {
                updateData[key] = updateData[key].trim();
            }
        });

        const updatedAddress = await OrderAddress.findOneAndUpdate(
            { _id: addressId, isActive: true },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({
                success: false,
                error: "Address not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress
        });

    } catch (error) {
        console.error("Update Address Error:", error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update address: " + error.message
        });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { userId } = req.body;

        if (!addressId || !userId) {
            return res.status(400).json({
                success: false,
                error: "Address ID and User ID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID format"
            });
        }

        // Check if address exists and belongs to user
        const address = await OrderAddress.findOne({ 
            _id: addressId, 
            userId, 
            isActive: true 
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                error: "Address not found"
            });
        }

        // Remove default flag from all other addresses
        await OrderAddress.updateMany(
            { userId, _id: { $ne: addressId } },
            { isDefault: false }
        );

        // Set this address as default
        address.isDefault = true;
        await address.save();

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address
        });

    } catch (error) {
        console.error("Set Default Address Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to set default address: " + error.message
        });
    }
};

// Delete address (soft delete)
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { userId } = req.body;

        if (!addressId || !userId) {
            return res.status(400).json({
                success: false,
                error: "Address ID and User ID are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID format"
            });
        }

        // Check if address exists and belongs to user
        const address = await OrderAddress.findOne({ 
            _id: addressId, 
            userId, 
            isActive: true 
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                error: "Address not found"
            });
        }

        // If this is the default address, set another address as default
        if (address.isDefault) {
            const otherAddress = await OrderAddress.findOne({
                userId,
                _id: { $ne: addressId },
                isActive: true
            });

            if (otherAddress) {
                otherAddress.isDefault = true;
                await otherAddress.save();
            }
        }

        // Soft delete the address
        address.isActive = false;
        await address.save();

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete address: " + error.message
        });
    }
};

// Export all functions
export {
    addAddress,
    getUserAddresses,
    getAddressById,
    getDefaultAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress
};
