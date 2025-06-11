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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const otp = generateOtp();
    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    // Store temp user data in session
    req.session.tempUser = {
      email,
      password,
      phone,
      firstName,
      lastName,
      avatar,
    };
    req.session.tempUserExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return next(new ErrorHandler(`User signup failed: ${error.message}`, 500));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ErrorHandler("Email and OTP are required", 400));
    }

    await validateOtp(email, otp);

    // Retrieve temp user from session
    const tempUser = req.session.tempUser;
    const tempUserExpiry = req.session.tempUserExpiry;

    if (!tempUser || !tempUserExpiry) {
      return next(new ErrorHandler("Session expired or invalid", 400));
    }

    // Check if session has expired
    if (Date.now() > tempUserExpiry) {
      delete req.session.tempUser;
      delete req.session.tempUserExpiry;
      return next(new ErrorHandler("Session expired", 400));
    }

    if (tempUser.email !== email) {
      return next(new ErrorHandler("Email mismatch", 400));
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

    // Clear temp user data from session
    delete req.session.tempUser;
    delete req.session.tempUserExpiry;

    sendResponseWithToken(newUser, res);
  } catch (error) {
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
};
