import express from "express";
import {
  changeUserRole,
  deleteUser,
  getAllUsers,
} from "../controllers/adminController.js";
import { verifyAdmin, verifyToken } from "../middleware/verifyUsers.js";

const router = express.Router();

router.route("/users/get/all").get(verifyToken, verifyAdmin, getAllUsers);
router.route("/user/role/change/:id").put(verifyToken, verifyAdmin, changeUserRole);
router.route("/user/delete/:id").delete(verifyToken, verifyAdmin, deleteUser);

export default router;
