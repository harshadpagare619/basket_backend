const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            productName: {
                type: String,
                required: true
            },
            productImage: {
                type: String,
                required: true
            },
            productSize: {
                type: Number,
                required: true
            },
            productSizeUnit: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            productPrice: {
                type: Number,
                required: true
            }
        }
    ],
    deliveryAddress: {
        name: {
            type: String,
            required: true
        },
        streetLine1: {
            type: String,
            required: true
        },
        streetLine2: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        notes: {
            type: String
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['pending','processing', 'shipped', 'delivered', 'rejected'],
        default: 'pending'
    },
    paymentInfo: {
        id: String,
        orderId: String,
        signature: String,
        status: {
            type: String,
            enum: ['success','failed'],
            default: 'success'
        }
    }
}, {
    timestamps: true
});

orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

exports.Order = mongoose.model('Order', orderSchema);
exports.orderSchema = orderSchema;