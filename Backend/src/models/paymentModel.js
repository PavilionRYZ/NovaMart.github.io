import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online"],
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to validate payment amount against order total
paymentSchema.pre("save", async function (next) {
  if (this.isModified("amount") || this.isNew) {
    const order = await mongoose.model("Order").findById(this.order);
    if (!order) throw new Error("Associated order not found");
    if (this.paymentMethod === "online" && this.amount !== order.totalAmount) {
      throw new Error(
        "Payment amount must match order total for online payments"
      );
    }
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);
