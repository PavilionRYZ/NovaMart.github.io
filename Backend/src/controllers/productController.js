import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import ApiFeatures from "../utils/apiFeatures.js";

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      images,
      category,
      discount,
      brand,
      specifications,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !stock || !images || !category) {
      return next(
        new ErrorHandler(
          "Name, description, price, stock, images, and category are required",
          400
        )
      );
    }

    // Validate price and stock
    if (price < 0) {
      return next(new ErrorHandler("Price cannot be negative", 400));
    }
    if (stock < 0) {
      return next(new ErrorHandler("Stock cannot be negative", 400));
    }

    // Validate images URLs
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (!Array.isArray(images) || images.some((img) => !urlRegex.test(img))) {
      return next(new ErrorHandler("Invalid image URL(s)", 400));
    }

    // Validate discount if provided
    if (discount && (discount < 0 || discount > 100)) {
      return next(new ErrorHandler("Discount must be between 0 and 100", 400));
    }

    // Create new product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      images,
      category,
      seller: req.user.id,
      discount: discount || 0,
      brand: brand || "",
      specifications: specifications || {},
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to create product: ${error.message}`, 500)
    );
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = Number(req.query.limit) || 12;

    // Create API Features instance
    const apiFeature = new ApiFeatures(
      Product.find({ isActive: true }),
      req.query
    )
      .search()
      .filter()
      .pagination(resultPerPage);
      console.log("Query conditions:", apiFeature.query._conditions);
    // Execute query to get products
    const products = await apiFeature.query.populate(
      "seller",
      "firstName lastName"
    );
    // console.log("Products retrieved:", products);
    // Count total products for pagination
    const totalProducts = await Product.countDocuments({
      isActive: true,
      ...apiFeature.query._conditions,
    });
    // console.log("Total products count:", totalProducts);
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products: Array.isArray(products) ? products : [],
        pagination: {
          total: totalProducts,
          page: Number(req.query.page) || 1,
          limit: resultPerPage,
          totalPages: Math.ceil(totalProducts / resultPerPage),
        },
      },
    });
  } catch (error) {
    // console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve products: ${error.message}`,
    });
  }
};

const getSellerProducts = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { seller: req.user.id };

    const products = await Product.find(query)
      .populate("seller", "firstName lastName")
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return next(new ErrorHandler("No products found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Seller products retrieved successfully",
      data: products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve products: ${error.message}`, 500)
    );
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return next(new ErrorHandler("Invalid product ID", 400));
    }

    const product = await Product.findById(id)
      .populate(
        "reviews",
        "rating comment images replies likes isVerifiedPurchase user"
      )
      .sort({ createdAt: -1 });

    if (!product || !product.isActive) {
      return next(new ErrorHandler("Product not found or inactive", 404));
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to retrieve product: ${error.message}`, 500)
    );
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const {
      name,
      description,
      price,
      stock,
      images,
      category,
      discount,
      brand,
      specifications,
      isActive,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (
      req.user.role !== "admin" &&
      product.seller.toString() !== req.user.id
    ) {
      return next(
        new ErrorHandler("Not authorized to update this product", 403)
      );
    }

    if (price && price < 0) {
      return next(new ErrorHandler("Price cannot be negative", 400));
    }
    if (stock && stock < 0) {
      return next(new ErrorHandler("Stock cannot be negative", 400));
    }
    if (images) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!Array.isArray(images) || images.some((img) => !urlRegex.test(img))) {
        return next(new ErrorHandler("Invalid image URL(s)", 400));
      }
    }
    if (discount && (discount < 0 || discount > 100)) {
      return next(new ErrorHandler("Discount must be between 0 and 100", 400));
    }

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;
    if (price) updatedFields.price = price;
    if (stock !== undefined) updatedFields.stock = stock;
    if (images) updatedFields.images = images;
    if (category) updatedFields.category = category;
    if (discount !== undefined) updatedFields.discount = discount;
    if (brand !== undefined) updatedFields.brand = brand;
    if (specifications) updatedFields.specifications = specifications;
    if (isActive !== undefined) updatedFields.isActive = isActive;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to update product: ${error.message}`, 500)
    );
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (
      req.user.role !== "admin" &&
      product.seller.toString() !== req.user.id
    ) {
      return next(
        new ErrorHandler("Not authorized to delete this product", 403)
      );
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to delete product: ${error.message}`, 500)
    );
  }
};

export {
  createProduct,
  getAllProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
