import crypto from "crypto";
import ResetToken from "../models/resetTokenModel.js";

// Generate a secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex"); 
};


const saveResetToken = async (email, token) => {
  const expires = new Date(Date.now() + 15 * 60 * 1000); 
  await ResetToken.findOneAndUpdate(
    { email },
    { email, token, expires },
    { upsert: true, new: true }
  );
};

const verifyResetToken = async (email, token) => {
  const tokenRecord = await ResetToken.findOne({ email, token });
  if (!tokenRecord) {
    throw new Error("Invalid reset token");
  }
  if (new Date() > tokenRecord.expires) {
    throw new Error("Reset token has expired");
  }

  await ResetToken.deleteOne({ email, token });
  return true;
};

export { generateResetToken, saveResetToken, verifyResetToken };
