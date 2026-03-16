import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
} from "../controllers/auth.controller.js";
import { loginLimiter } from "../middlewares/ratelimiter.middleware.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);

export default router;
