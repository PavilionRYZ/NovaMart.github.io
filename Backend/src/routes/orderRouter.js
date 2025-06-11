import express from "express";
import {
  verifySeller,
  verifyToken,
  verifyAdmin,
} from "../middleware/verifyUsers.js";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getSellerOrders,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/order/create").post(verifyToken, createOrder);
router.route("/order/user").get(verifyToken, getUserOrders);
router.route("/orders/cancel/:id").delete(verifyToken, cancelOrder);
router.route("/orders/seller").get(verifyToken, verifySeller, getSellerOrders);
router
  .route("/order/status/update/:id")
  .put(verifyToken, verifySeller, updateOrderStatus);
router.route("/order/get/:id").get(verifyToken, getOrderById);

export default router;
