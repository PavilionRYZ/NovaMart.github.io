import express from "express";
import {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/verifyUsers.js";

const router = express.Router();

router.route("/cart/get").get(verifyToken, getCart);
router.route("/cart/add/item").post(verifyToken, addItemToCart);
router.route("/cart/update/item").put(verifyToken, updateItemQuantity);
router.route("/cart/remove/item/:id").delete(verifyToken, removeItemFromCart);
router.route("/cart/clear").delete(verifyToken, clearCart);

export default router;
