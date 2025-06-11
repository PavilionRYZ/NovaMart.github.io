import Address from "../models/addressModel.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create a new address
const createAddress = async (req, res, next) => {
  try {
    const { street, city, state, country, zipCode, isDefault } = req.body;

    if (!street || !city || !state || !country || !zipCode) {
      return next(new ErrorHandler("All address fields are required", 400));
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      return next(new ErrorHandler("Invalid ZIP code format", 400));
    }

    const address = await Address.create({
      user: req.user.id,
      street,
      city,
      state,
      country,
      zipCode,
      isDefault: isDefault || false,
    });

    const user = await User.findById(req.user.id);
    user.addresses.push(address._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to create address: ${error.message}`, 500)
    );
  }
};

// Update an existing address
const updateAddress = async (req, res, next) => {
  try {
    const { id:addressId } = req.params;
    const { street, city, state, country, zipCode, isDefault } = req.body;

    const address = await Address.findById(addressId);
    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }
    if (address.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to update this address", 403)
      );
    }

    if (zipCode) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(zipCode)) {
        return next(new ErrorHandler("Invalid ZIP code format", 400));
      }
    }

    // Prepare updated fields
    const updatedFields = {};
    if (street) updatedFields.street = street;
    if (city) updatedFields.city = city;
    if (state) updatedFields.state = state;
    if (country) updatedFields.country = country;
    if (zipCode) updatedFields.zipCode = zipCode;
    if (isDefault !== undefined) updatedFields.isDefault = isDefault;

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update address: ${error.message}`, 500)
    );
  }
};

// Delete an address
const deleteAddress = async (req, res, next) => {
  try {
    const { id:addressId } = req.params;

    const address = await Address.findById(addressId);
    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }
    if (address.user.toString() !== req.user.id) {
      return next(
        new ErrorHandler("Not authorized to delete this address", 403)
      );
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: addressId },
    });

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to delete address: ${error.message}`, 500)
    );
  }
};

// View all addresses for the user
const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    if (!addresses || addresses.length === 0) {
      return next(new ErrorHandler("No addresses found for this user", 404));
    }

    res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve addresses: ${error.message}`, 500)
    );
  }
};

// View a single address
const getAddressById = async (req, res, next) => {
  try {
    const { id:addressId } = req.params;

    const address = await Address.findById(addressId);
    if (!address) {
      return next(new ErrorHandler("Address not found", 404));
    }
    if (address.user.toString() !== req.user.id) {
      return next(new ErrorHandler("Not authorized to view this address", 403));
    }

    res.status(200).json({
      success: true,
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve address: ${error.message}`, 500)
    );
  }
};

export {
  createAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  getAddressById,
};
