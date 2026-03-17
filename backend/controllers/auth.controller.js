import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.utils.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.utils.js";
import ApiResponse from "../utils/apiResponse.utils.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    username,
    password: hashedPassword,
  });

  return res
    .status(201)
    .json(new ApiResponse(true, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError("Invalid credentials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError("Invalid credentials", 400);
  }

  const token = generateToken(user._id);

  res.json(new ApiResponse(true, { token }, "Logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(true, null, "Logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.json(new ApiResponse(true, user, "User profile retrieved successfully"));
});

export { registerUser, loginUser, getUserProfile, logoutUser };
