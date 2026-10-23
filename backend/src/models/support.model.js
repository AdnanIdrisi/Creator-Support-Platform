import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    supporterName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    supporterEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    message: {
        type: String,
        maxlength: 200,
    },
    coffees: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        enum: ["INR"],
        default: "INR",
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created",
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
    },
    paidAt: {
        type: Date,
    },
}, { timestamps: true });

supportSchema.index({ creatorId: 1, status: 1, createdAt: -1 });
supportSchema.index({ razorpayOrderId: 1 }, { unique: true });

export const supportModel = mongoose.model("Support", supportSchema);