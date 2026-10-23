import { env } from "../config/env.js";
import razorpay from "../config/razorpay.js";
import redis from "../config/redis.js";
import { findUserById, findUserByUsername } from "../DAO/user.dao.js";
import { supportModel } from "../models/support.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { username, supporterName, supporterEmail, message, coffees } =
    req.body;

  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const amount = user.coffeePrice * coffees * 100;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  });

  await supportModel.create({
    creatorId: user._id,
    supporterName,
    supporterEmail,
    message,
    coffees,
    amount,
    currency: "INR",
    status: "created",
    razorpayOrderId: order.id,
  });

  sendSuccess(res, 201, "Order created successfully", {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const verified = validatePaymentVerification(
    { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    env.RAZORPAY_KEY_SECRET,
  );
  if (!verified) {
    throw new AppError(400, "Payment verification failed");
  }
  const support = await supportModel.findOne({
    razorpayOrderId: razorpay_order_id,
  });
  if (!support) {
    throw new AppError(404, "Support record not found");
  }

  if (support.status === "paid") {
    return sendSuccess(res, 200, "Payment already verified");
  }

  support.status = "paid";
  support.razorpayPaymentId = razorpay_payment_id;
  support.paidAt = new Date();
  await support.save();

  const creator = await findUserById(support.creatorId);
  await redis.del(`creator:${creator.username}:page`, `creator:${creator.username}:leaderboard`);
  sendSuccess(res, 200, "Payment verified successfully");
});


