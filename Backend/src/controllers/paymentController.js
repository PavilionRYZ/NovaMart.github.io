import Stripe from "stripe";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for online payment (requires user role)
const createPaymentIntent = async (req, res, next) => {
  try {
    const { id: orderId } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }
    if (order.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to pay for this order", 403)
      );
    }
    if (order.paymentMethod !== "online") {
      return next(
        new ErrorHandler("Order does not require online payment", 400)
      );
    }
    if (order.orderStatus !== "pending") {
      return next(new ErrorHandler("Only pending orders can be paid", 400));
    }

    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment && existingPayment.status === "success") {
      return next(new ErrorHandler("Order already paid", 400));
    }

    const amount = Math.round(order.totalAmount * 100); // Convert to cents
    let paymentIntent;
    if (existingPayment) {
      paymentIntent = await stripe.paymentIntents.update(
        existingPayment.paymentId,
        {
          amount: amount,
          currency: process.env.CURRENCY || "inr",
          metadata: { orderId: orderId.toString(), userId: req.user.id },
          automatic_payment_methods: { enabled: true },
        }
      );
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: process.env.CURRENCY || "inr",
        metadata: { orderId: orderId.toString(), userId: req.user.id },
        automatic_payment_methods: { enabled: true },
        description: `Payment for order #${orderId}`,
      });

      const payment = await Payment.create({
        user: req.user.id,
        order: orderId,
        amount: order.totalAmount,
        paymentId: paymentIntent.id,
        status: "pending",
        paymentMethod: "online",
      });

      await Order.findByIdAndUpdate(orderId, { payment: payment._id });
    }

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: paymentIntent.id,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to create payment intent: ${error.message}`, 500)
    );
  }
};

// Verify payment (fallback if webhook fails)
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.id;

    if (!paymentId) {
      return next(new ErrorHandler("Payment ID is required", 400));
    }

    const payment = await Payment.findOne({ paymentId }).populate("order");
    if (!payment || payment.user.toString() !== userId) {
      return next(new ErrorHandler("Payment not found or unauthorized", 404));
    }

    if (payment.status !== "pending") {
      return next(new ErrorHandler("Payment already processed", 400));
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    if (paymentIntent.status !== "succeeded") {
      payment.status = "failed";
      await payment.save();
      return next(new ErrorHandler("Payment verification failed", 400));
    }

    payment.status = "success";
    payment.order.orderStatus = "dispatched";
    await payment.save();
    await payment.order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully. Your order is now dispatched!",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to verify payment: ${error.message}`, 500)
    );
  }
};

// Handle Stripe webhook events (public endpoint, no auth required)
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return next(
        new ErrorHandler(
          `Webhook signature verification failed: ${err.message}`,
          400
        )
      );
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { orderId, userId } = paymentIntent.metadata;

      if (
        !mongoose.isValidObjectId(orderId) ||
        !mongoose.isValidObjectId(userId)
      ) {
        return next(
          new ErrorHandler("Invalid metadata in payment intent", 400)
        );
      }

      const payment = await Payment.findOneAndUpdate(
        { paymentId: paymentIntent.id },
        { status: "success" },
        { new: true }
      ).populate("order");

      if (!payment) {
        return next(new ErrorHandler("Payment record not found", 404));
      }

      payment.order.orderStatus = "dispatched";
      await payment.order.save();
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      await Payment.findOneAndUpdate(
        { paymentId: paymentIntent.id },
        { status: "failed" }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to process webhook: ${error.message}`, 500)
    );
  }
};

// Refund a payment (requires admin role)
const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return next(new ErrorHandler("Payment not found", 404));
    }
    if (payment.status !== "success") {
      return next(
        new ErrorHandler("Only successful payments can be refunded", 400)
      );
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return next(new ErrorHandler("Associated order not found", 404));
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(payment.amount * 100),
    });

    payment.status = "failed";
    await payment.save();

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: refund,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to refund payment: ${error.message}`, 500)
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
      "firstName lastName email"
    );
    if (!payment) {
      return next(new ErrorHandler("Payment not found", 404));
    }

    if (payment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorHandler("Not authorized to view this payment", 403));
    }

    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve payment: ${error.message}`, 500)
    );
  }
};

// Get Stripe configuration (public endpoint)
const getStripeConfig = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Failed to retrieve Stripe config: ${error.message}`,
        500
      )
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
