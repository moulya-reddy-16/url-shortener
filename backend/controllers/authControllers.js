import jwt from "jsonwebtoken";
const { sign } = jwt;
import { hash, compare } from "bcryptjs";
import { userModel } from "../models/User.js";
import crypto from "crypto";

// REGISTER USER
export const registerUser = async (req, res, next) => {
  try {
    const allowedRoles = ["admin", "user"];
    const { name, email, password, role = "user", gender, phoneNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await hash(password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");

    const newUserDoc = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      gender: gender || "",
      phoneNumber: phoneNumber || "",
      verificationToken,
      isVerified: false
    });

    await newUserDoc.save();

    // Log verification link to console for mock email
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
    console.log(`\n=== MOCK EMAIL SENT ===\nTo: ${email}\nSubject: Verify Email\nLink: ${verificationLink}\n========================\n`);

    res.status(201).json({ 
      message: "User registered successfully. Verification email sent (mocked).",
      mockVerificationLink: process.env.NODE_ENV !== "production" ? verificationLink : undefined
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN USER
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Auto-seed administrative details if logging in as system administrator
    if (email.toLowerCase() === "admin@minify.click" && password === "admin123") {
      let admin = await userModel.findOne({ email: "admin@minify.click" });
      if (!admin) {
        const hashedAdminPassword = await hash("admin123", 12);
        admin = new userModel({
          name: "System Administrator",
          email: "admin@minify.click",
          password: hashedAdminPassword,
          role: "admin",
          isVerified: true
        });
        await admin.save();
        console.log("Auto-seeded Administrative account admin@minify.click");
      }
    }

    const user = await userModel.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }


    const isMatched = await compare(
      password,
      user.password
    );

    if (!isMatched) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
    });
  } catch (err) {
    next(err);
  }
};


// LOGOUT USER
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};

// EMAIL VERIFICATION
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await userModel.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    
    if (email && email.toLowerCase() !== user.email) {
      // Check if email already registered by someone else
      const dup = await userModel.findOne({ email: new RegExp(`^${email}$`, "i") });
      if (dup) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

// CHANGE PASSWORD (WITH CURRENT PASSWORD CHECK)
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password is correct
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash and save new password
    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    next(err);
  }
};

// UPLOAD PROFILE IMAGE
export const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store relative path (served as static files)
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: "Profile image uploaded successfully!",
      profileImage: user.profileImage,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    next(err);
  }
};