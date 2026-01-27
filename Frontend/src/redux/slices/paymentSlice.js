import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
axios.defaults.withCredentials = true;

const initialState = {
  paymentIntent: null, // for Razorpay: { orderId, amount, currency, keyId }
  paymentId: null, // optional: store razorpay orderId here (or keep null)
  stripeConfig: null, // keep name to avoid touching many imports; will store { keyId }
  isLoading: false,
  error: null,
  message: null,
  payment: null,
};

// Get Razorpay configuration (still named getStripeConfig to avoid changing imports everywhere)
export const getStripeConfig = createAsyncThunk(
  "payment/getStripeConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/payments/config`);
      // backend will return: { keyId: "rzp_test_..." }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch Razorpay config",
      );
    }
  },
);

// Create a payment intent (now creates Razorpay order)
export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/intent`, {
        id: orderId,
      });
      // backend will return: { orderId, amount, currency, keyId }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create Razorpay order",
      );
    }
  },
);

// Verify payment (Razorpay) - NOW expects {paymentId, orderId}
export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async ({ paymentId, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/verify`, {
        paymentId,
        orderId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify payment",
      );
    }
  },
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
        error.response?.data?.message || "Failed to fetch payment",
      );
    }
  },
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
        error.response?.data?.message || "Failed to refund payment",
      );
    }
  },
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
      state.payment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get config
      .addCase(getStripeConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getStripeConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stripeConfig = action.payload; // { keyId }
        state.message = "Razorpay config retrieved successfully";
      })
      .addCase(getStripeConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Razorpay order
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentIntent = action.payload; // { orderId, amount, currency, keyId }
        state.paymentId = action.payload.orderId; // store Razorpay orderId here
        state.message = "Razorpay order created successfully";
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
