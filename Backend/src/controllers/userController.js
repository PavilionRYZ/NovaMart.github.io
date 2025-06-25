import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import {
  generateOtp,
  saveOtp,
  verifyOtp as validateOtp,
} from "../utils/Otp.js";
import { sendOtpEmail, sendResetPasswordEmail } from "../config/mailer.js";
import {
  generateResetToken,
  saveResetToken,
  verifyResetToken,
} from "../utils/resetTokenUtils.js";
import TempUser from "../models/tempUserModel.js";

const sendResponseWithToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY,
  });
  const { password, googleId, refreshToken, ...rest } = user._doc;

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: process.env.COOKIE_MAX_AGE,
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "User logged in successfully",
      user: rest,
    });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(new ErrorHandler(`Failed to get user: ${error.message}`, 500));
  }
};

const signup = async (req, res, next) => {
  try {
    const { email, password, phone, firstName, lastName, avatar } = req.body;

    if (!email || !password || !firstName) {
      return next(
        new ErrorHandler("Email, password, and first name are required", 400)
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorHandler("Invalid email format", 400));
    }

    if (password.length < 6) {
      return next(
        new ErrorHandler("Password must be at least 6 characters", 400)
      );
    }

    if (firstName.length < 3) {
      return next(
        new ErrorHandler("First name must be at least 3 characters", 400)
      );
    }

    if (phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return next(new ErrorHandler("Invalid phone number", 400));
      }
    }

    if (avatar) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!urlRegex.test(avatar)) {
        return next(new ErrorHandler("Invalid avatar URL", 400));
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const otp = generateOtp();
    await saveOtp(normalizedEmail, otp);
    await sendOtpEmail(normalizedEmail, otp);

    // Store temp user in database
    await TempUser.deleteMany({ email: normalizedEmail });
    const tempUser = await TempUser.create({
      email: normalizedEmail,
      password,
      phone,
      firstName,
      lastName,
      avatar,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    // console.log(`Temp user saved for ${normalizedEmail}:`, tempUser);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Signup error:", error);
    return next(new ErrorHandler(`User signup failed: ${error.message}`, 500));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    // console.log("Verify OTP request:", { email, otp });

    if (!email || !otp) {
      return next(new ErrorHandler("Email and OTP are required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase(); // Normalize email
    await validateOtp(normalizedEmail, otp);

    const tempUser = await TempUser.findOne({ email: normalizedEmail });
    // console.log(`Temp user query result for ${normalizedEmail}:`, tempUser);
    if (!tempUser) {
      // console.error("No temp user found for:", normalizedEmail);
      return next(new ErrorHandler("Session expired or invalid", 400));
    }

    if (tempUser.expiresAt < new Date()) {
      // console.error("Temp user expired for:", normalizedEmail);
      await TempUser.deleteOne({ email: normalizedEmail });
      return next(new ErrorHandler("Session expired", 400));
    }

    const newUser = await User.create({
      email: tempUser.email,
      password: tempUser.password,
      phone: tempUser.phone,
      firstName: tempUser.firstName,
      lastName: tempUser.lastName,
      avatar: tempUser.avatar || "",
      provider: "local",
    });

    await TempUser.deleteOne({ email: normalizedEmail });
    // console.log(`User created and temp user deleted for ${normalizedEmail}`);

    sendResponseWithToken(newUser, res);
  } catch (error) {
    // console.error("OTP verification error:", error);
    return next(
      new ErrorHandler(`OTP verification failed: ${error.message}`, 400)
    );
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    if (user.provider === "google") {
      return next(new ErrorHandler("Use Google login for this account", 400));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    sendResponseWithToken(user, res);
  } catch (error) {
    return next(new ErrorHandler(`Login failed: ${error.message}`, 500));
  }
};

const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("token", {
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    return next(new ErrorHandler(`Logout failed: ${error.message}`, 500));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { firstName, lastName, phone, avatar } = req.body;
    if (!firstName && !lastName && !phone && !avatar) {
      return next(new ErrorHandler("No fields to update", 400));
    }

    // Validate fields if provided
    if (firstName && firstName.length < 3) {
      return next(
        new ErrorHandler("First name must be at least 3 characters", 400)
      );
    }
    if (lastName && lastName.length > 0 && lastName.length < 3) {
      return next(
        new ErrorHandler(
          "Last name must be at least 3 characters if provided",
          400
        )
      );
    }
    if (phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return next(new ErrorHandler("Invalid phone number", 400));
      }
    }
    if (avatar) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!urlRegex.test(avatar)) {
        return next(new ErrorHandler("Invalid avatar URL", 400));
      }
    }

    const updatedFields = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName !== undefined) updatedFields.lastName = lastName || "";
    if (phone) updatedFields.phone = phone;
    if (avatar) updatedFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    const { password, googleId, refreshToken, ...rest } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: rest,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update profile: ${error.message}`, 500)
    );
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Old and new passwords are required", 400));
    }

    if (newPassword.length < 6) {
      return next(
        new ErrorHandler("New password must be at least 6 characters", 400)
      );
    }

    if (user.provider === "google") {
      return next(
        new ErrorHandler(
          "Use forgot password to set a password for Google accounts",
          400
        )
      );
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to update password: ${error.message}`, 500)
    );
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorHandler("Invalid email format", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const token = generateResetToken();
    await saveResetToken(email, token);
    await sendResetPasswordEmail(email, token);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to send reset link: ${error.message}`, 500)
    );
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { email, newPassword, confirmNewPassword } = req.body;
  try {
    if (!email || !token || !newPassword || !confirmNewPassword) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    if (token.length !== 64) {
      return next(new ErrorHandler("Invalid reset token format", 400));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorHandler("Invalid email format", 400));
    }
    if (newPassword.length < 6) {
      return next(
        new ErrorHandler("New password must be at least 6 characters", 400)
      );
    }
    if (newPassword !== confirmNewPassword) {
      return next(new ErrorHandler("Passwords do not match", 400));
    }
    await verifyResetToken(email, token);

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.password = newPassword;
    if (user.provider === "google") {
      user.provider = "hybrid";
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    // console.log(error);
    return next(
      new ErrorHandler(`Failed to reset password: ${error.message}`, 400)
    );
  }
};

export {
  signup,
  verifyOtp,
  login,
  logout,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendResponseWithToken,
  getCurrentUser,
};
