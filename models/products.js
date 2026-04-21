const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        default: 0,
        required: true
    },
    newPrice: {
        type: Number,
        default: 0,
        required: true
    },
    countInStock: {
        type: Number,
        default: 0,
        required: true
    },
    size: {
        type: Number,
        default: 0,
        required: true
    },
    sizeUnit: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
})

productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true
});

exports.Product = mongoose.model('Product', productSchema);

exports.productSchema = productSchema;