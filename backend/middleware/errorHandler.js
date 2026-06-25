const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // mongoose bad ObjectId
  if (err.name === "CastError") {
    message = "Resource not found!";
    statusCode = 404;
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    message = `${field} already exists`;
    statusCode = 400;
  }

  // mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size exceeds the maximum limit of 20MB";
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  // if not any of the above errors
  console.log("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
