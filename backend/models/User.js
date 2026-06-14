import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say", ""],
      default: "",
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const userModel = mongoose.model("User", userSchema);