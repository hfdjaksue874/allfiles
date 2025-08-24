import mongoose from 'mongoose';

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            size: {
                type: String,
                default: null
            },
            color: {
                type: String,
                default: null
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const WishList = mongoose.model('WishList', wishListSchema);

export default WishList;