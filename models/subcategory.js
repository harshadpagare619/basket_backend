const mongoose = require('mongoose');

const subCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
     slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    }
})

subCategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

subCategorySchema.set('toJSON', {
    virtuals: true
});

exports.SubCategory = mongoose.model('SubCategory', subCategorySchema);
exports.subCategorySchema = subCategorySchema;