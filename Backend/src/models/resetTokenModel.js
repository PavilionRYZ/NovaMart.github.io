import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

resetTokenSchema.index({ email: 1, token: 1 });

resetTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("ResetToken", resetTokenSchema);
