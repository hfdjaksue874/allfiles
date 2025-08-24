import mongoose from "mongoose";

const orderAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[6-9]\d{9}$/.test(v); // Indian phone number validation
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
  
    addressLine1: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    addressLine2: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ''
    },
    landmark: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ''
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    pincode: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[1-9][0-9]{5}$/.test(v); // Indian pincode validation
            },
            message: 'Please enter a valid 6-digit pincode'
        }
    },
   
   
    
}, { timestamps: true });



// Pre-save middleware to ensure only one default address per user
orderAddressSchema.pre('save', async function(next) {
    if (this.isDefault && this.isModified('isDefault')) {
        // Remove default flag from other addresses of the same user
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

const OrderAddress = mongoose.models.OrderAddress || mongoose.model("OrderAddress", orderAddressSchema);

export default OrderAddress;