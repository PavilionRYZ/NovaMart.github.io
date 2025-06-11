import express from "express";
import {
  createPaymentIntent,
  handleWebhook,
  refundPayment,
  getPaymentByOrderId,
  getStripeConfig,
} from "../controllers/paymentController.js";
import {
  verifyToken,
  verifyUser,
  verifyAdmin,
} from "../middleware/verifyUsers.js";

const router = express.Router();

router.route("/payments/config").get(getStripeConfig);
router
  .route("/payments/webhook")
  .post(express.raw({ type: "application/json" }), handleWebhook);
router
  .route("/payments/intent")
  .post(verifyToken, verifyUser, createPaymentIntent);
router
  .route("/payments/order/:id")
  .get(verifyToken, verifyUser, getPaymentByOrderId);
router.route("/payments/refund").post(verifyToken, verifyAdmin, refundPayment);

export default router;
