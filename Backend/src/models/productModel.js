import mongoose from "mongoose";

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (value) {
            return /^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(value);
          },
          message: "Invalid image URL",
        },
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    brand: {
      type: String,
      trim: true,
      required: false,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient querying by category and seller
productSchema.index({ category: 1, seller: 1 });
productSchema.index({ name: "text", description: "text" }); // Text index for search

// Pre-save middleware to validate stock and discount
productSchema.pre("save", async function (next) {
  if (this.isModified("stock") && this.stock < 0) {
    throw new Error("Stock cannot be negative");
  }
  if (
    this.isModified("discount") &&
    (this.discount < 0 || this.discount > 100)
  ) {
    throw new Error("Discount must be between 0 and 100");
  }
  next();
});

// Method to calculate discounted price
productSchema.methods.getDiscountedPrice = function () {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price;
};

export default mongoose.model("Product", productSchema);
