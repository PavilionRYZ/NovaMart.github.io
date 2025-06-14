import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

//import reducers
import authReducer from "./slices/authSlice.js";
import productReducer from "./slices/productSlice.js";
import orderReducer from "./slices/orderSlice.js";
import cartReducer from "./slices/cartSlice.js";
import reviewReducer from "./slices/reviewSlice.js";
import adminReducer from "./slices/adminSlice.js";
import addressReducer from "./slices/addressSlice.js";
import paymentReducer from "./slices/paymentSlice.js";


const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  order: orderReducer,
  cart:cartReducer,
  review:reviewReducer,
  admin:adminReducer,
  address:addressReducer,
  payment:paymentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
