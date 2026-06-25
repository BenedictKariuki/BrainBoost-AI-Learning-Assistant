import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { STATUS_CODES } from "http";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRoute.js";
import documentRouter from "./routes/documentRoute.js";
import flashcardRouter from "./routes/flashcardRoute.js";
import aiRouter from "./routes/aiRoute.js";
import quizRouter from "./routes/quizRoute.js";
import progressRouter from "./routes/progressRoute.js";

// __dirname and __filename global variables are only available to commonjs modules. For ES6, you must use import.meta.url to derive these paths

// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url); // file URL => path
const __dirname = path.dirname(__filename);

const app = express();

// connect to MongoDB
connectDB();

// cors middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// json middleware
app.use(express.json());

// parsing URL-encoded strings into a JS object and populating req.body
app.use(express.urlencoded({ extended: true }));

// static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRouter);
app.use("/api/documents", documentRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/progress", progressRouter);

// error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found!",
    statusCode: STATUS_CODES[404],
  });
});

// listening
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening in ${process.env.NODE_ENV} on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
