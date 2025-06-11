import Review from "../models/reviewsModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const createReview = async (req, res, next) => {
  try {
    const { id:productId } = req.params;
    const { rating, comment, images } = req.body;

    // Validate required fields
    if (!productId || !rating) {
      return next(new ErrorHandler("Product ID and rating are required", 400));
    }

    // Validate productId
    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return next(
        new ErrorHandler("Rating must be an integer between 1 and 5", 400)
      );
    }

    // Validate comment length if provided
    if (comment && comment.length > 1000) {
      return next(
        new ErrorHandler("Comment cannot exceed 1000 characters", 400)
      );
    }

    // Validate image URLs if provided
    if (images) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!Array.isArray(images) || images.some((img) => !urlRegex.test(img))) {
        return next(new ErrorHandler("Invalid image URL(s)", 400));
      }
    }

    // Validate product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return next(new ErrorHandler("Product not found or inactive", 404));
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });
    if (existingReview) {
      return next(
        new ErrorHandler("You have already reviewed this product", 400)
      );
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment: comment || "",
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    if (error.code === 11000) {
      return next(
        new ErrorHandler("You have already reviewed this product", 400)
      );
    }
    return next(
      new ErrorHandler(`Failed to create review: ${error.message}`, 500)
    );
  }
};

// Update a review (requires user role, only own review)
const updateReview = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }
    if (review.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to update this review", 403)
      );
    }

    if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return next(
        new ErrorHandler("Rating must be an integer between 1 and 5", 400)
      );
    }
    if (comment && comment.length > 1000) {
      return next(
        new ErrorHandler("Comment cannot exceed 1000 characters", 400)
      );
    }
    if (images) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!Array.isArray(images) || images.some((img) => !urlRegex.test(img))) {
        return next(new ErrorHandler("Invalid image URL(s)", 400));
      }
    }

    const updatedFields = {};
    if (rating) updatedFields.rating = rating;
    if (comment !== undefined) updatedFields.comment = comment || "";
    if (images) updatedFields.images = images;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update review: ${error.message}`, 500)
    );
  }
};

// Delete a review (requires user role for own review, or admin)
const deleteReview = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorHandler("Not authorized to delete this review", 403)
      );
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to delete review: ${error.message}`, 500)
    );
  }
};

// Get reviews for a product 
const getProductReviews = async (req, res, next) => {
  try {
    const { id:productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return next(new ErrorHandler("Product not found or inactive", 404));
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve reviews: ${error.message}`, 500)
    );
  }
};

// Get a single review by ID 
const getReviewById = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return next(new ErrorHandler("Invalid review ID", 400));
    }

    const review = await Review.findById(reviewId)
      .populate("user", "firstName lastName avatar")
      .populate("replies.user", "firstName lastName avatar role");

    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve review: ${error.message}`, 500)
    );
  }
};

// Add a reply to a review (requires seller or admin role)
const addReply = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return next(new ErrorHandler("Reply comment is required", 400));
    }

    if (comment.length > 500) {
      return next(new ErrorHandler("Reply cannot exceed 500 characters", 400));
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    const product = await Product.findById(review.product);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (
      req.user.role !== "admin" &&
      product.seller.toString() !== req.user.id
    ) {
      return next(
        new ErrorHandler("Not authorized to reply to this review", 403)
      );
    }

    review.replies.push({
      user: req.user.id,
      comment,
    });

    await review.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(new ErrorHandler(`Failed to add reply: ${error.message}`, 500));
  }
};

// Like or unlike a review (requires user role)
const toggleLikeReview = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;

    // Validate review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    const userId = req.user.id;
    const hasLiked = review.likes.includes(userId);

    if (hasLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      review.likes.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: hasLiked
        ? "Review unliked successfully"
        : "Review liked successfully",
      data: review,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to toggle like: ${error.message}`, 500)
    );
  }
};

// Mark a review as helpful (requires user role)
const markReviewHelpful = async (req, res, next) => {
  try {
    const { id:reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: review,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Failed to mark review as helpful: ${error.message}`,
        500
      )
    );
  }
};

export {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReviewById,
  addReply,
  toggleLikeReview,
  markReviewHelpful,
};
