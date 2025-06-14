import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const initialState = {
  users: [],
  pagination: null,
  isLoading: false,
  error: null,
  message: null,
};

// Get all users with query parameters
export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(queryParams).toString();
      const response = await axios.get(
        `${API_URL}/admin/users/get/all?${params}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get all users"
      );
    }
  }
);

// Change user role
export const changeUserRole = createAsyncThunk(
  "admin/changeUserRole",
  async ({ id, newRole }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/user/role/change/${id}`,
        { newRole }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change user role"
      );
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async ({ id }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/admin/user/delete/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.users = [];
      state.pagination = null;
      state.error = null;
      state.isLoading = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.message = "Users retrieved successfully";
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(changeUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload.userId
            ? { ...user, role: action.payload.role }
            : user
        );
        state.message = "User role updated successfully";
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload.id
        );
        state.message = "User deleted successfully";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.message = action.payload;
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
