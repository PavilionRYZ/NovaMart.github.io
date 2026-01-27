import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order for online payment (requires user role)
const createPaymentIntent = async (req, res, next) => {
  try {
    const { id: orderId } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    if (order.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to pay for this order", 403),
      );
    }

    if (order.paymentMethod !== "online") {
      return next(
        new ErrorHandler("Order does not require online payment", 400),
      );
    }

    if (order.orderStatus !== "pending") {
      return next(new ErrorHandler("Only pending orders can be paid", 400));
    }

    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment && existingPayment.status === "success") {
      return next(new ErrorHandler("Order already paid", 400));
    }

    // Razorpay uses smallest currency unit (paise for INR)
    const amountInPaise = Math.round(order.totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: (process.env.CURRENCY || "INR").toUpperCase(),
      receipt: `receipt_${orderId}_${Date.now()}`,
      notes: {
        orderId: orderId.toString(),
        userId: req.user.id,
      },
    });

    if (existingPayment) {
      existingPayment.paymentId = razorpayOrder.id; // storing razorpay ORDER id here
      existingPayment.status = "pending";
      await existingPayment.save();
    } else {
      const payment = await Payment.create({
        user: req.user.id,
        order: orderId,
        amount: order.totalAmount,
        paymentId: razorpayOrder.id, // storing razorpay ORDER id here
        status: "pending",
        paymentMethod: "online",
      });

      await Order.findByIdAndUpdate(orderId, { payment: payment._id });
    }

    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Failed to create Razorpay order: ${error.message}`,
        500,
      ),
    );
  }
};

// Verify payment (fallback if webhook fails)
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !orderId) {
      return next(
        new ErrorHandler("Payment ID and Order ID are required", 400),
      );
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    if (order.user.toString() !== userId) {
      return next(new ErrorHandler("Not authorized", 403));
    }

    // Fetch payment from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    if (razorpayPayment.status !== "captured") {
      return next(new ErrorHandler("Payment not captured / failed", 400));
    }

    // Update Payment record for this order
    const paymentRecord = await Payment.findOne({ order: orderId });
    if (!paymentRecord)
      return next(new ErrorHandler("Payment record not found", 404));

    // Optional: validate amount
    if (razorpayPayment.amount !== Math.round(paymentRecord.amount * 100)) {
      paymentRecord.status = "failed";
      await paymentRecord.save();
      return next(new ErrorHandler("Payment amount mismatch", 400));
    }

    // Save Razorpay paymentId somewhere:
    // Your schema only has `paymentId`. Currently it's used to store ORDER id at creation time.
    // We'll overwrite it with PAYMENT id after success to match your previous logic.
    paymentRecord.paymentId = paymentId;
    paymentRecord.status = "success";
    await paymentRecord.save();

    order.orderStatus = "dispatched";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Your order is now dispatched!",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to verify payment: ${error.message}`, 500),
    );
  }
};

// Handle Razorpay webhook events (public endpoint, no auth required)
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return next(new ErrorHandler("Webhook secret not configured", 500));
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return next(new ErrorHandler("Missing x-razorpay-signature header", 400));
    }

    // IMPORTANT: Razorpay signature expects raw body string.
    // If your webhook route currently uses express.raw(), make sure server doesn't JSON-parse before it.
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return next(
        new ErrorHandler("Webhook signature verification failed", 400),
      );
    }

    const event = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString("utf8"))
      : req.body;

    // Common events: payment.captured, payment.failed
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;

      const orderId = paymentEntity?.notes?.orderId;
      const userId = paymentEntity?.notes?.userId;

      if (
        !mongoose.isValidObjectId(orderId) ||
        !mongoose.isValidObjectId(userId)
      ) {
        return next(new ErrorHandler("Invalid metadata in payment notes", 400));
      }

      // Update payment record by order (more reliable than matching by paymentId)
      const paymentRecord = await Payment.findOne({ order: orderId }).populate(
        "order",
      );
      if (!paymentRecord)
        return next(new ErrorHandler("Payment record not found", 404));

      paymentRecord.paymentId = paymentEntity.id; // store Razorpay PAYMENT id
      paymentRecord.status = "success";
      await paymentRecord.save();

      paymentRecord.order.orderStatus = "dispatched";
      await paymentRecord.order.save();
    }

    if (event.event === "payment.failed") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity?.notes?.orderId;

      if (mongoose.isValidObjectId(orderId)) {
        await Payment.findOneAndUpdate(
          { order: orderId },
          { status: "failed" },
        );
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to process webhook: ${error.message}`, 500),
    );
  }
};

// Refund a payment (requires admin role)
const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) return next(new ErrorHandler("Payment not found", 404));
    if (payment.status !== "success") {
      return next(
        new ErrorHandler("Only successful payments can be refunded", 400),
      );
    }

    const order = await Order.findById(payment.order);
    if (!order)
      return next(new ErrorHandler("Associated order not found", 404));

    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(payment.amount * 100),
      notes: { orderId: order._id.toString(), reason: "Refund" },
    });

    payment.status = "failed"; // or introduce "refunded" status if you want
    await payment.save();

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: refund,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to refund payment: ${error.message}`, 500),
    );
  }
};

// Get payment details by order ID (requires user for own orders or admin)
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const payment = await Payment.findOne({ order: orderId }).populate(
      "user",
      "firstName lastName email",
    );

    if (!payment) return next(new ErrorHandler("Payment not found", 404));

    if (payment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorHandler("Not authorized to view this payment", 403));
    }

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve payment: ${error.message}`, 500),
    );
  }
};

// Replace Stripe config endpoint with Razorpay Key ID
const getStripeConfig = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Failed to retrieve Razorpay config: ${error.message}`,
        500,
      ),
    );
  }
};

export {
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
  refundPayment,
  getPaymentByOrderId,
  getStripeConfig,
};
