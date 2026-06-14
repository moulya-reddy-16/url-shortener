import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    summary: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Study",
        "Entertainment",
        "Travel",
        "Work",
        "Shopping",
        "Other",
      ],
      default: "Other",
    },

    clicks: {
      type: Number,
      default: 0,
    },

    oneTime: {
      type: Boolean,
      default: false,
    },

    used: {
      type: Boolean,
      default: false,
    },

    analytics: [
        {
            country: String,
            city: String,
            browser: String,
            device: String,
            clickedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      default: null,
    },

    passwordProtected: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    
},
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export const urlModel =  mongoose.model("Url", urlSchema);