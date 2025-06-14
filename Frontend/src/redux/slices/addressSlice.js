import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const initialState = {
  addresses: [],
  address: null,
  error: null,
  isLoading: false,
  message: null,
};

// Create a new address
export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/user/address/create`,
        addressData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create address"
      );
    }
  }
);

// Update an existing address
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/user/address/update/${id}`,
        addressData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address"
      );
    }
  }
);

// Delete an address
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/user/address/delete/${id}`
      );
      return { id }; // Return id for state update
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address"
      );
    }
  }
);

// Get all addresses for the user
export const getAllAddress = createAsyncThunk(
  "address/getAllAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/user/address/get/all`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch addresses"
      );
    }
  }
);

// Get a single address by ID
export const getAddressById = createAsyncThunk(
  "address/getAddressById",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/user/address/get/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressState: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.push(action.payload);
        state.address = action.payload;
        state.message = "Address created successfully";
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.map((addr) =>
          addr._id === action.payload._id ? action.payload : addr
        );
        state.address = action.payload;
        state.message = "Address updated successfully";
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(
          (addr) => addr._id !== action.payload.id
        );
        state.address = null;
        state.message = "Address deleted successfully";
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        state.message = "Addresses retrieved successfully";
      })
      .addCase(getAllAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAddressById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAddressById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload;
        state.message = "Address retrieved successfully";
      })
      .addCase(getAddressById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddressState } = addressSlice.actions;
export default addressSlice.reducer;
