import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  avatar: { type: String },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model("TempUser", tempUserSchema);
