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
          // Updated regex to support multiple ZIP code formats:
          // - 5 digits: 12345
          // - 5 digits with 4-digit extension: 12345-6789
          // - 6 digits: 123456
          // - Other common international formats
          return /^(\d{5}(-\d{4})?|\d{6}|\d{4}|\w{1,2}\d{1,2}\s?\d{1,2}\w{1,2})$/i.test(value);
        },
        message: "Invalid ZIP/Postal code format. Supported formats: 12345, 12345-6789, 123456, or international postal codes",
      },
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^(\+\d{1,3}[-.\s]?)?\d{7,15}$/.test(value.replace(/[-.\s]/g, ''));
        },
        message: "Invalid mobile number format. Use formats like: +91-9876543210, 9876543210, or +1-555-123-4567",
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