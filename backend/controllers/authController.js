import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate jwt token
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
    algorithm: "HS256",
  });
  return token;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  //   const resErrors = validationResult(req);
  //   console.log(resErrors.errors);
  //   res.json({ message: "Success" });
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }] }); // doc instance
    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Email already in use"
            : "Username already taken",
        statusCode: 400,
      });
    }
    // create user
    const user = await User.create({ username, email, password });
    // generate a token to return to the user
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "User registration successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  let token;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: !email ? "Please provide an email" : "Please provide a password",
        statusCode: 400,
      });
    }
    // include the password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }
    // all good
    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        token,
      },
      message: "Login Successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body || {};
    const updates = {
      ...(username && { username }),
      ...(email && { email }),
      ...(profileImage && { profileImage }),
    };
    Object.assign(req.user, updates);
    const updatedUser = await req.user.save();
    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route  /api/auth/change-password
// @access Private
export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.user._id }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "This user does not exist",
        statusCode: 401,
      });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password required",
        statusCode: 400,
      });
    }
    if (!user.matchPassword(currentPassword)) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
