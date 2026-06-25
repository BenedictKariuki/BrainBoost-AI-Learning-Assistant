import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  // check the Authorization header for the token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password -__v");
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User does not exist",
          statusCode: 401,
        });
      }
      // attach the user to the req so that other middleware can see it
      req.user = user;
      return next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
          statusCode: 401,
        });
      }
      // any other error
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      statusCode: 401,
    });
  }
};

export default protect;
