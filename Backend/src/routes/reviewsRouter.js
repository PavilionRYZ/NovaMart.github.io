import express from "express";
import {
  verifyAdmin,
  verifyToken,
  verifySeller,
  verifyUser,
} from "../middleware/verifyUsers.js";
import {
  addReply,
  createReview,
  deleteReview,
  getProductReviews,
  getReviewById,
  markReviewHelpful,
  toggleLikeReview,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.route("/product/review/create/:id").post(verifyToken, createReview);
router
  .route("/product/review/update/:id")
  .put(verifyToken, verifyUser, updateReview);
router
  .route("/product/review/delete/:id")
  .delete(verifyToken, verifyUser, verifySeller, deleteReview);
router.route("/product/reviews/get/:id").get(getProductReviews);
router.route("/review/get/:id").get(getReviewById);
router.route("/review/reply/:id").post(verifyToken, verifySeller, addReply);
router
  .route("/review/like/:id")
  .post(verifyToken, verifyUser, toggleLikeReview);
router
  .route("/review/helpful/:id")
  .post(verifyToken, verifyUser, markReviewHelpful);

  
export default router;
