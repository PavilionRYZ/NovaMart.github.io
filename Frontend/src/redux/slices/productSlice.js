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
  products: [],
  product: null,
  searchResults: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  },
  isLoading: false,
  error: null,
  message: null,
};

export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      // console.log("Making request to getProducts with filters:", filters);
      // console.log("API_URL:", API_URL);
      const response = await publicAxios.get(`${API_URL}/product/get/all`, {
        params: {
          keyword: filters.keyword,
          category: filters.category,
          "price[gte]": filters.minPrice,
          "price[lte]": filters.maxPrice,
          "ratings[gte]": filters.minRating,
          page: filters.page,
          limit: filters.limit,
        },
      });
      // console.log("getProducts response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error(
        "Error in getProducts:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const getSingleProduct = createAsyncThunk(
  "products/getSingleProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get(
        `${API_URL}/product/get/${productId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(
        `${API_URL}/product/add/new`,
        productData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await authAxios.patch(
        `${API_URL}/product/update/${productId}`,
        productData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await authAxios.delete(
        `${API_URL}/product/delete/${productId}`
      );
      return { productId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const getSellerProducts = createAsyncThunk(
  "products/getSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`${API_URL}/product/get/seller`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductState: (state) => {
      state.error = null;
      state.message = null;
      state.isLoading = false;
      state.product = null;
      state.searchResults = [];
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = Array.isArray(action.payload.products)
          ? action.payload.products
          : [];
        state.pagination = action.payload.pagination || {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
        };
        state.message = "Products retrieved successfully";
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      .addCase(getSingleProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getSingleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
        state.message = "Product retrieved successfully";
      })
      .addCase(getSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
        state.message = "Product created successfully";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.message = "Product updated successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(
          (p) => p._id !== action.payload.productId
        );
        state.message = action.payload.message;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.message = "Seller products retrieved successfully";
      })
      .addCase(getSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductState, setPagination } = productSlice.actions;
export default productSlice.reducer;
