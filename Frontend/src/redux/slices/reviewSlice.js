import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const publicAxios = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const initialState = {
  reviews: [],
  review: null,
  error: null,
  isLoading: false,
  message: null,
};

export const createReview = createAsyncThunk(
  "review/createReview",
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(
        `${API_URL}/product/review/create/${id}`,
        reviewData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create review"
      );
    }
  }
);

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await authAxios.put(
        `${API_URL}/product/review/update/${id}`,
        reviewData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review"
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async ({ id }, { rejectWithValue }) => {
    try {
      await authAxios.delete(`${API_URL}/product/review/delete/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review"
      );
    }
  }
);

export const getProductReviews = createAsyncThunk(
  "review/getProductReviews",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get(
        `${API_URL}/product/reviews/get/${id}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get product reviews"
      );
    }
  }
);

export const getReviewById = createAsyncThunk(
  "review/getReviewById",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get(`${API_URL}/review/get/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get review"
      );
    }
  }
);

export const replyReview = createAsyncThunk(
  "review/replyReview",
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(`${API_URL}/review/reply/${id}`, {
        comment,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reply to review"
      );
    }
  }
);

export const toggleLikeReview = createAsyncThunk(
  "review/toggleLikeReview",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(`${API_URL}/review/like/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle like review"
      );
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  "review/markReviewHelpful",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(`${API_URL}/review/helpful/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark review helpful"
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearReviewState: (state) => {
      state.review = null;
      state.error = null;
      state.isLoading = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload);
        state.review = action.payload;
        state.message = "Review created successfully";
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review
        );
        state.review = action.payload;
        state.message = "Review updated successfully";
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload.id
        );
        state.review = null;
        state.message = "Review deleted successfully";
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(getProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
        state.message = "Product reviews fetched successfully";
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(getReviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.review = action.payload;
        state.message = "Review fetched successfully";
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(replyReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(replyReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review
        );
        state.review = action.payload;
        state.message = "Reply added successfully";
      })
      .addCase(replyReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(toggleLikeReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(toggleLikeReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review
        );
        state.review = action.payload;
        state.message = action.payload.likes.includes(state.user?.id)
          ? "Review liked successfully"
          : "Review unliked successfully";
      })
      .addCase(toggleLikeReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(markReviewHelpful.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review
        );
        state.review = action.payload;
        state.message = "Review marked as helpful";
      })
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      });
  },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
