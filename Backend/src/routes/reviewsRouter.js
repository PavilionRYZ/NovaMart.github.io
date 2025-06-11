import express from "express";
import {
  verifyAdmin,
  verifyToken,
  verifySeller,
} from "../middleware/verifyUsers.js";
import { createReview } from "../controllers/reviewController.js";

const router = express.Router();

router.route("/product/review/create/:id").post(verifyToken,createReview);


export default router;