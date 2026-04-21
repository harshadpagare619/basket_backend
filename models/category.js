const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
});

categorySchema.pre("save", function(next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {lower: true, strict: true});
    }
    next();
});

categorySchema.virtual("id").get(function() {
    return this._id.toHexString();
});

categorySchema.set("toJSON", {
    virtuals: true
});

exports.Category = mongoose.model("Category", categorySchema);
exports.categorySchema = categorySchema;