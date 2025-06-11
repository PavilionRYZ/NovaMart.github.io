import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

otpSchema.index({ email: 1, phone: 1 });

otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
