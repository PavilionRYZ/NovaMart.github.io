import mongoose from "mongoose";

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: [
      {
        type: String,
        required: false,
        trim: true,
        validate: {
          validator: function (value) {
            return /^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(value);
          },
          message: "Invalid image URL",
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Reply cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);


reviewSchema.index({ user: 1, product: 1 }, { unique: true });


reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });


reviewSchema.pre("save", async function (next) {
  if (this.isNew) {
    const order = await mongoose.model("Order").findOne({
      user: this.user,
      "products.product": this.product,
      orderStatus: "delivered",
    });
    this.isVerifiedPurchase = !!order;
  }
  next();
});


reviewSchema.pre("save", async function (next) {
  if (this.isNew) {
    await mongoose
      .model("Product")
      .findByIdAndUpdate(
        this.product,
        { $addToSet: { reviews: this._id } },
        { new: true }
      );
  }
  next();
});

reviewSchema.post("remove", async function (doc, next) {
  await mongoose
    .model("Product")
    .findByIdAndUpdate(
      doc.product,
      { $pull: { reviews: doc._id } },
      { new: true }
    );
  next();
});

export default mongoose.model("Review", reviewSchema);
