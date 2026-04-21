const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
   productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
   },
   productTitle: {
    type: String,
    required: true
   },
   image: {
    type: String,
    required: true
   },
   size: {
    type: String,
    required: true
   },
   unitPrice: {
    type: Number,
    required: true
   },
   quantity: {
    type: Number,
    required: true,
    min: 1
   },
   subTotal: {
    type: Number,
    required: true
   },
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
   },
   guestId: {
    type: String,
    default: null
   }
});

cartSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

cartSchema.set('toJSON', {
    virtuals: true
});

exports.Cart = mongoose.model('Cart', cartSchema);
exports.cartSchema = cartSchema;