import express from "express";
import {
  verifyToken,
  verifySeller,
  verifyAdmin,
} from "../middleware/verifyUsers.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getSellerProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.route("/product/get/all").get(getAllProducts);
router.route("/product/add/new").post(verifyToken, verifySeller, createProduct);
router
  .route("/product/update/:id")
  .patch(verifyToken, verifySeller, updateProduct);
router
  .route("/product/delete/:id")
  .delete(verifyToken, verifySeller, deleteProduct);
router.route("/product/get/:id").get(getProductById);
router
  .route("/product/get/seller")
  .get(verifyToken, verifySeller, getSellerProducts);

export default router;
