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

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-default-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3050",
    credentials: true,
  })
);

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  console.log("Server is closing due to uncaughtException");
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

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

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (err) => {
  console.log("Server is closing due to unhandledRejection");
  console.log(`Error: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});
