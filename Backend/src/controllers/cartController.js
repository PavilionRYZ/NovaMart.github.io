import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

// Get user's cart
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name images price discount stock isActive"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: { user: req.user.id, items: [], totalPrice: 0 },
      });
    }

    let totalPrice = 0;
    cart.items = cart.items.filter(
      (item) =>
        item.product &&
        item.product.isActive &&
        item.product.stock >= item.quantity
    );
    for (const item of cart.items) {
      const discountedPrice =
        item.product.price * (1 - (item.product.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    }
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve cart: ${error.message}`, 500)
    );
  }
};

// Add item to cart
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(new ErrorHandler("Product ID is required", 400));
    }
    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return next(new ErrorHandler("Quantity must be a positive integer", 400));
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return next(new ErrorHandler("Product not found or inactive", 404));
    }
    if (product.stock < quantity) {
      return next(
        new ErrorHandler(`Insufficient stock for ${product.name}`, 400)
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [], totalPrice: 0 });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return next(
          new ErrorHandler(`Insufficient stock for ${product.name}`, 400)
        );
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.product);
      const discountedPrice = prod.price * (1 - (prod.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    }
    cart.totalPrice = totalPrice;

    await cart.save();

    // Populate cart for response
    await cart.populate(
      "items.product",
      "name images price discount stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to add item to cart: ${error.message}`, 500)
    );
  }
};

// Update item quantity in cart
const updateItemQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate required fields
    if (!productId || quantity === undefined) {
      return next(
        new ErrorHandler("Product ID and quantity are required", 400)
      );
    }
    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return next(new ErrorHandler("Quantity must be a positive integer", 400));
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Find item in cart
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return next(new ErrorHandler("Item not found in cart", 404));
    }

    // Validate product stock
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return next(new ErrorHandler("Product not found or inactive", 404));
    }
    if (product.stock < quantity) {
      return next(
        new ErrorHandler(`Insufficient stock for ${product.name}`, 400)
      );
    }

    // Update quantity
    item.quantity = quantity;

    // Recalculate total price
    let totalPrice = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.product);
      const discountedPrice = prod.price * (1 - (prod.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    }
    cart.totalPrice = totalPrice;

    await cart.save();

    // Populate cart for response
    await cart.populate(
      "items.product",
      "name images price discount stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Item quantity updated successfully",
      data: cart,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update item quantity: ${error.message}`, 500)
    );
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return next(new ErrorHandler("Item not found in cart", 404));
    }
    cart.items.splice(itemIndex, 1);

    let totalPrice = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.product);
      const discountedPrice = prod.price * (1 - (prod.discount || 0) / 100);
      totalPrice += discountedPrice * item.quantity;
    }
    cart.totalPrice = totalPrice;

    await cart.save();

    await cart.populate(
      "items.product",
      "name images price discount stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to remove item from cart: ${error.message}`, 500)
    );
  }
};

// Clear cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
        data: { user: req.user.id, items: [], totalPrice: 0 },
      });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to clear cart: ${error.message}`, 500)
    );
  }
};

export {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
};
