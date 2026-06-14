import exp from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  updateProfile,
  changePassword,
  uploadProfileImage,
} from "../controllers/authControllers.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const authRouter = exp.Router();

// Register
authRouter.post("/register", registerUser);

// Login
authRouter.post("/login", loginUser);


// Email Verification
authRouter.get("/verify-email/:token", verifyEmail);



// Update Profile settings
authRouter.put(
  "/update-profile",
  verifyToken("user", "admin"),
  updateProfile
);

// Change Password
authRouter.put(
  "/change-password",
  verifyToken("user", "admin"),
  changePassword
);

// Upload Profile Image
authRouter.post(
  "/upload-profile-image",
  verifyToken("user", "admin"),
  upload.single("profileImage"),
  uploadProfileImage
);

// Logout
authRouter.post(
  "/logout",
  verifyToken("user", "admin"),
  logoutUser
);

export default authRouter;