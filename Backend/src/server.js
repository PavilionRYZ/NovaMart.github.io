import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToMongo from "./config/mongoDB.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();
connectToMongo();

const app = express();

// IMPORTANT: Keep raw body for Razorpay webhooks
app.use((req, res, next) => {
  if (req.path === "/api/v1/payments/webhook") return next();
  return express.json()(req, res, next);
});

// Session store
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  ttl: 24 * 60 * 60,
});

mongoStore.on("error", (error) => {
  console.error("MongoDB session store error:", error);
});

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-default-secret",
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3050",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Routes
import userRouter from "./routes/userRouter.js";
import addressRouter from "./routes/addressRouter.js";
import productRouter from "./routes/productsRouter.js";
import orderRouter from "./routes/orderRouter.js";
import adminRouter from "./routes/adminRouter.js";
import reviewRouter from "./routes/reviewsRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import cartRouter from "./routes/cartRouter.js";

app.use("/api/v1", userRouter);
app.use("/api/v1", addressRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", paymentRouter);

// Global error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Error:", err);
  res.status(statusCode).json({ success: false, statusCode, message });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
