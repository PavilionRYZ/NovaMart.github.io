import express from "express";
import { verifyToken } from "../middleware/verifyUsers.js";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getUserAddresses,
  updateAddress,
} from "../controllers/addressController.js";
import rateLimit from "express-rate-limit";
const router = express.Router();

const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 updates per minute
  message: "Too many update requests, please try again later",
});

router.route("/user/address/create").post(verifyToken, createAddress);
router
  .route("/user/address/update/:id")
  .patch(verifyToken, updateLimiter, updateAddress);
router.route("/user/address/delete/:id").delete(verifyToken, deleteAddress);
router.route("/user/address/get/all").get(verifyToken, getUserAddresses);
router.route("/user/address/get/:id").get(verifyToken, getAddressById);

export default router;
