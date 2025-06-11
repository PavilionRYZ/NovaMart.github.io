import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token =
      req.cookies.token ||
      (req.header("Authorization") &&
      req.header("Authorization").startsWith("Bearer ")
        ? req.header("Authorization").split(" ")[1]
        : null);

    if (!token) {
      return next(new ErrorHandler("Unauthorized: No token provided", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded?.id) {
      return next(new ErrorHandler("Invalid token payload", 401));
    }

    // Fetch user and ensure they exist
    const user = await User.findById(decoded.id).select("-password -otp");
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    // Check if user account is active (e.g., not suspended)
    if (user.role === "user" && !user.addresses) {
      return next(
        new ErrorHandler("User account incomplete: Address required", 403)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Unauthorized: Token has expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Forbidden: Invalid token", 401));
    }
    return next(
      new ErrorHandler(`Authentication failed: ${error.message}`, 401)
    );
  }
};

// Verify admin role
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorHandler("Unauthorized: User not authenticated", 401)
      );
    }
    if (req.user.role !== "admin") {
      return next(new ErrorHandler("Unauthorized: Admin access required", 403));
    }
    next();
  } catch (error) {
    return next(
      new ErrorHandler(`Admin verification failed: ${error.message}`, 500)
    );
  }
};

// Verify seller role (or admin, as admins can manage products too)
export const verifySeller = (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new ErrorHandler("Unauthorized: User not authenticated", 401)
      );
    }
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return next(
        new ErrorHandler("Unauthorized: Seller or admin access required", 403)
      );
    }
    next();
  } catch (error) {
    return next(
      new ErrorHandler(`Seller verification failed: ${error.message}`, 500)
    );
  }
};
