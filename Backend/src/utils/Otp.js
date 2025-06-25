import crypto from "crypto";
import Otp from "../models/otpModel.js";

const generateOtp = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (randomBytes.readUIntBE(0, 3) % 900000) + 100000;
  return otp.toString();
};

const saveOtp = async (email, otp) => {
  try {
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expires },
      { upsert: true, new: true }
    );
    // console.log(`OTP saved for ${email}: ${otp}`);
  } catch (error) {
    console.error(`Error saving OTP for ${email}:`, error);
    throw new Error("Failed to save OTP");
  }
};

const verifyOtp = async (email, otp) => {
  try {
    // console.log(`Verifying OTP for ${email}: ${otp}`);
    const otpRecord = await Otp.findOne({ email, otp: otp.toString() });
    if (!otpRecord) {
      throw new Error("Invalid OTP");
    }
    if (new Date() > otpRecord.expires) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new Error("OTP has expired");
    }
    await Otp.deleteOne({ _id: otpRecord._id });
    // console.log(`OTP verified for ${email}`);
    return true;
  } catch (error) {
    console.error(`Error verifying OTP for ${email}:`, error);
    throw new Error(error.message || "OTP verification failed");
  }
};

export { generateOtp, saveOtp, verifyOtp };
