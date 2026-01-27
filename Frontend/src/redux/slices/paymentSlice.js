import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
axios.defaults.withCredentials = true;

const initialState = {
  paymentIntent: null, // { orderId, amount, currency, keyId }
  paymentId: null,     // store razorpay orderId here
  stripeConfig: null,  // { keyId }
  isLoading: false,
  error: null,
  message: null,
  payment: null,
};

export const getStripeConfig = createAsyncThunk(
  "payment/getStripeConfig",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/payments/config`);
      return response.data.data; // { keyId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch Razorpay config"
      );
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/intent`, { id: orderId });
      return response.data.data; // { orderId, amount, currency, keyId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create Razorpay order"
      );
    }
  }
);

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
        error.response?.data?.message || error.message || "Failed to verify payment"
      );
    }
  }
);

export const getPaymentByOrderId = createAsyncThunk(
  "payment/getPaymentByOrderId",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/payments/order/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch payment"
      );
    }
  }
);

export const refundPayment = createAsyncThunk(
  "payment/refundPayment",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/payments/refund`, { paymentId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to refund payment"
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
      state.payment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStripeConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getStripeConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stripeConfig = action.payload;
        state.message = "Razorpay config retrieved successfully";
      })
      .addCase(getStripeConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentIntent = action.payload;
        state.paymentId = action.payload.orderId;
        state.message = "Razorpay order created successfully";
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

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
