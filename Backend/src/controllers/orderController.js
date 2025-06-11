import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Address from "../models/addressModel.js";
import Payment from "../models/paymentModel.js";
import Cart from "../models/cartModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

// Create a new order (requires user role)
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddressId, paymentMethod } = req.body;

    if (!shippingAddressId || !paymentMethod) {
      return next(
        new ErrorHandler(
          "Shipping address and payment method are required",
          400
        )
      );
    }

    if (!["cash_on_delivery", "online"].includes(paymentMethod)) {
      return next(new ErrorHandler("Invalid payment method", 400));
    }

    const address = await Address.findById(shippingAddressId);
    if (!address || address.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Invalid or unauthorized shipping address", 404)
      );
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler("Cart is empty", 400));
    }

    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product.isActive) {
        return next(
          new ErrorHandler(`Product ${product.name} is inactive`, 400)
        );
      }
      if (product.stock < item.quantity) {
        return next(
          new ErrorHandler(`Insufficient stock for ${product.name}`, 400)
        );
      }

      const discountedPrice = product.getDiscountedPrice();
      totalAmount += discountedPrice * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
      });

      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    let payment;
    if (paymentMethod === "online") {
      payment = await Payment.create({
        user: req.user.id,
        amount: totalAmount,
        paymentStatus: "pending",
      });
    }

    const sellerId = cart.items[0].product.seller;
    if (!sellerId) {
      return next(new ErrorHandler("Seller not found for products", 404));
    }

    const order = await Order.create({
      user: req.user.id,
      products: orderItems,
      totalAmount,
      shippingAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
      },
      paymentMethod,
      payment: payment ? payment._id : undefined,
      orderStatus: "pending",
      seller: sellerId,
    });

    await Product.bulkWrite(productUpdates);

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to create order: ${error.message}`, 500)
    );
  }
};

// Update order status (requires seller or admin role)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (req.user.role !== "admin" && order.seller.toString() !== req.user.id) {
      return next(new ErrorHandler("Not authorized to update this order", 403));
    }

    if (order.orderStatus === "delivered") {
      return next(
        new ErrorHandler("Cannot update status of a delivered order", 400)
      );
    }

    if (
      !["pending", "dispatched", "shipped", "delivered"].includes(orderStatus)
    ) {
      return next(new ErrorHandler("Invalid order status", 400));
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update order status: ${error.message}`, 500)
    );
  }
};

// Cancel an order (requires user role for own orders, or admin)
const cancelOrder = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (
      order.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      order.seller.toString() !== req.user.id
    ) {
      return next(new ErrorHandler("Not authorized to cancel this order", 403));
    }

    if (order.orderStatus !== "pending") {
      return next(new ErrorHandler("Only pending orders can be canceled", 400));
    }

    const productUpdates = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } },
      },
    }));

    await Product.bulkWrite(productUpdates);

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to cancel order: ${error.message}`, 500)
    );
  }
};

// Get user's orders (requires user role)
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product", "name images price")
      .populate("seller", "firstName lastName")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve orders: ${error.message}`, 500)
    );
  }
};

// Get seller's orders (requires seller or admin role)
const getSellerOrders = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { seller: req.user.id };

    const orders = await Order.find(query)
      .populate("products.product", "name images price")
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No orders found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Seller orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve orders: ${error.message}`, 500)
    );
  }
};

// Get a single order by ID (requires user for own orders, seller for their orders, or admin)
const getOrderById = async (req, res, next) => {
  try {
    const { id: orderId } = req.params;

    // Validate order ID
    if (!mongoose.isValidObjectId(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findById(orderId)
      .populate("products.product", "name images price")
      .populate("user", "firstName lastName email")
      .populate("seller", "firstName lastName")
      .populate("payment");

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (
      order.user.toString() !== req.user.id &&
      order.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new ErrorHandler("Not authorized to view this order", 403));
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve order: ${error.message}`, 500)
    );
  }
};

export {
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getUserOrders,
  getSellerOrders,
  getOrderById,
};
