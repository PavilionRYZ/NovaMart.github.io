import mongoose from "mongoose";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Product from "../models/productModel.js";
import Address from "../models/addressModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendRoleChangeEmail } from "../config/mailer.js";

//get all users
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new ErrorHandler("Invalid page number", 400));
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new ErrorHandler("Limit must be between 1 and 100", 400));
    }

    const query = {};

    if (role && ["user", "seller", "admin"].includes(role)) {
      query.role = role;
    } else if (role) {
      return next(new ErrorHandler("Invalid role filter", 400));
    }

    if (isActive !== undefined) {
      const isActiveBool =
        isActive === "true" ? true : isActive === "false" ? false : null;
      if (isActiveBool === null) {
        return next(new ErrorHandler("Invalid isActive filter", 400));
      }
      query.isActive = isActiveBool;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ];
    }

    const allowedSortFields = [
      "email",
      "firstName",
      "lastName",
      "role",
      "createdAt",
    ];
    if (!allowedSortFields.includes(sortBy)) {
      return next(new ErrorHandler("Invalid sort field", 400));
    }
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(query)
      .select("email firstName lastName role isActive createdAt")
      .sort({ [sortBy]: sortDirection })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          totalUsers,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve users: ${error.message}`, 500)
    );
  }
};

// Change user role (requires admin role)
const changeUserRole = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const { newRole } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return next(new ErrorHandler("Invalid user ID", 400));
    }
    if (!["user", "seller", "admin"].includes(newRole)) {
      return next(new ErrorHandler("Invalid role", 400));
    }
    if (req.user.id === userId && newRole !== "admin") {
      return next(
        new ErrorHandler("Admins cannot downgrade their own role", 403)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (user.role === newRole) {
      return next(new ErrorHandler(`User is already a ${newRole}`, 400));
    }

    user.role = newRole;
    await user.save();

    try {
      await sendRoleChangeEmail(user.email, newRole);
    } catch (emailError) {
      console.error(
        `Failed to send role change email to ${user.email}:`,
        emailError
      );
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to change user role: ${error.message}`, 500)
    );
  }
};

// Delete user and associated data (requires admin role)
const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return next(new ErrorHandler("Invalid user ID", 400));
    }
    if (req.user.id === userId) {
      return next(new ErrorHandler("Admins cannot delete themselves", 403));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Cart.deleteOne({ user: userId }, { session });
      await Address.deleteMany({ user: userId }, { session });
      await Payment.deleteMany({ user: userId }, { session });

      await Order.updateMany(
        { user: userId },
        { $set: { user: null } },
        { session }
      );

      if (user.role === "seller") {
        await Product.updateMany(
          { seller: userId },
          { $set: { isActive: false } },
          { session }
        );
      }

      await User.deleteOne({ _id: userId }, { session });

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "User and associated data deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to delete user: ${error.message}`, 500)
    );
  }
};

export { changeUserRole, deleteUser, getAllUsers };
