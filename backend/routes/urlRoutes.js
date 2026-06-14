import exp from "express";

import {
  createShortUrl,
  bulkCreateShortUrl,
  getMyUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getUrlAnalytics,
  redirectUrl,
  unlockShortUrl,
  getAllUrls,
  adminDeleteUrl,
  getPlatformAnalytics,
  getNetworkIp,
} from "../controllers/urlControllers.js";

import { verifyToken } from "../middlewares/verifyToken.js";

const urlRouter = exp.Router();


// PUBLIC ROUTES (must come before /:id wildcard)

// Get Backend Host Network IP
urlRouter.get(
  "/network-ip",
  getNetworkIp
);

// Unlock Password-Protected URL
urlRouter.post(
  "/unlock/:shortCode",
  unlockShortUrl
);

// Redirect Short URL
urlRouter.get(
  "/r/:shortCode",
  redirectUrl
);


// ADMIN ROUTES (must come before /:id wildcard)

// Get All URLs
urlRouter.get(
  "/admin/all",
  verifyToken("admin"),
  getAllUrls
);

// Platform Analytics
urlRouter.get(
  "/admin/analytics",
  verifyToken("admin"),
  getPlatformAnalytics
);

// Delete Any URL
urlRouter.delete(
  "/admin/:id",
  verifyToken("admin"),
  adminDeleteUrl
);


// USER ROUTES (specific paths before wildcard /:id)

// Create Short URL
urlRouter.post(
  "/create",
  verifyToken("user", "admin"),
  createShortUrl
);

// Bulk Create Short URLs
urlRouter.post(
  "/bulk-create",
  verifyToken("user", "admin"),
  bulkCreateShortUrl
);

// Get My URLs
urlRouter.get(
  "/my-urls",
  verifyToken("user", "admin"),
  getMyUrls
);

// URL Analytics (must be before /:id)
urlRouter.get(
  "/analytics/:id",
  verifyToken("user", "admin"),
  getUrlAnalytics
);

// Get URL By ID (wildcard — must come last among GETs)
urlRouter.get(
  "/:id",
  verifyToken("user", "admin"),
  getUrlById
);

// Update URL
urlRouter.patch(
  "/:id",
  verifyToken("user", "admin"),
  updateUrl
);

// Delete URL
urlRouter.delete(
  "/:id",
  verifyToken("user", "admin"),
  deleteUrl
);


export default urlRouter;