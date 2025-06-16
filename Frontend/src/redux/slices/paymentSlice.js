import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
axios.defaults.withCredentials = true;

const initialState = {
  paymentIntent: null,
  paymentId: null,
  stripeConfig: null,
  isLoading: false,
  error: null,
  message: null,
};

// Get Stripe configuration
export const getStripeConfig = createAsyncThunk(
  "payment/getStripeConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/payments/config`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Stripe config"
      );
    }
  }
);

// Create a payment intent
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/intent`, {
        id: orderId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment intent"
      );
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/verify`, {
        paymentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify payment"
      );
    }
  }
);

// Get payment by order ID
export const getPaymentByOrderId = createAsyncThunk(
  "payment/getPaymentByOrderId",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/payments/order/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment"
      );
    }
  }
);

// Refund a payment
export const refundPayment = createAsyncThunk(
  "payment/refundPayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/refund`, {
        paymentId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to refund payment"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.error = null;
      state.message = null;
      state.isLoading = false;
      state.paymentIntent = null;
      state.paymentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Stripe config
      .addCase(getStripeConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getStripeConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stripeConfig = action.payload;
        state.message = "Stripe config retrieved successfully";
      })
      .addCase(getStripeConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentIntent = action.payload;
        state.paymentId = action.payload.paymentId;
        state.message = "Payment intent created successfully";
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get payment by order ID
      .addCase(getPaymentByOrderId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getPaymentByOrderId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payment = action.payload;
        state.message = "Payment retrieved successfully";
      })
      .addCase(getPaymentByOrderId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refund payment
      .addCase(refundPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payment = action.payload;
        state.message = "Payment refunded successfully";
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
