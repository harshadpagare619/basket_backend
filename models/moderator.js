const mongooes = require("mongoose");

const moderatorSchema = mongooes.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

moderatorSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

moderatorSchema.set("toJSON", {
    virtuals: true,
});

exports.Moderator = mongooes.model("Moderator", moderatorSchema);
exports.moderatorSchema = moderatorSchema;