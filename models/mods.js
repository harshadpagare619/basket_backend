const mongoose = require('mongoose');

const moderatorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
});

moderatorSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

moderatorSchema.set('toJSON', {
    virtuals: true
});

exports.Moderator = mongoose.model('Moderator', moderatorSchema);
exports.moderatorSchema = moderatorSchema;