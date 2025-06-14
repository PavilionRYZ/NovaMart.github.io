import express from "express";
import {
  changeUserRole,
  deleteUser,
  getAllUsers,
} from "../controllers/adminController.js";
import { verifyAdmin, verifyToken } from "../middleware/verifyUsers.js";

const router = express.Router();

router.route("/admin/users/get/all").get(verifyToken, verifyAdmin, getAllUsers);
router
  .route("/admin/user/role/change/:id")
  .put(verifyToken, verifyAdmin, changeUserRole);
router
  .route("/admin/user/delete/:id")
  .delete(verifyToken, verifyAdmin, deleteUser);

export default router;
