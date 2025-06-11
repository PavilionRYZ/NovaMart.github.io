import mongoose from "mongoose";

// Address Schema
const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\d{5}(-\d{4})?$/.test(value); // Validates 5-digit ZIP or 5+4 format
        },
        message: "Invalid ZIP code format",
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one address is default per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose
      .model("Address")
      .updateMany(
        { user: this.user, _id: { $ne: this._id }, isDefault: true },
        { $set: { isDefault: false } }
      );
  }
  next();
});

// Index for efficient querying by user
addressSchema.index({ user: 1, isDefault: 1 });

export default mongoose.model("Address", addressSchema);
