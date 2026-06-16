import { nanoid } from "nanoid";
import { hash, compare } from "bcryptjs";
import { urlModel as Url } from "../models/Url.js";
import { recordAnalytics } from "../services/analyticsService.js";
import { userModel as User } from "../models/User.js";
import os from "os";

// CREATE SHORT URL
export const createShortUrl = async (req, res) => {
  const { originalUrl, category, oneTime, customAlias, expiresAt, password } = req.body;

  if (!originalUrl) {
    return res.status(400).json({
      message: "Original URL is required",
    });
  }

  try {
    new URL(originalUrl);
  } catch {
    return res.status(400).json({
      message: "Invalid URL format",
    });
  }

  let shortCode = nanoid(7);
  
  if (customAlias) {
    // Validate alias (alphanumeric, dashes, underscores, 3-20 chars)
    const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
    if (!aliasRegex.test(customAlias)) {
      return res.status(400).json({
        message: "Alias must be alphanumeric, 3-30 characters long, and may contain dashes or underscores.",
      });
    }

    const existingCode = await Url.findOne({ shortCode: customAlias });
    if (existingCode) {
      return res.status(409).json({
        message: "This custom alias is already in use.",
      });
    }
    shortCode = customAlias;
  }

  // Prevent duplicating shortened URL (only if no custom parameters are set)
  if (!customAlias && !expiresAt && !password) {
    const existingUrl = await Url.findOne({
      originalUrl,
      createdBy: req.user.id,
      passwordProtected: false,
      expiresAt: null,
    });

    if (existingUrl) {
      return res.status(409).json({
        message: "You have already shortened this URL",
        data: existingUrl,
      });
    }
  }

  let hashedPassword = null;
  let passwordProtected = false;
  if (password && password.trim() !== "") {
    hashedPassword = await hash(password, 10);
    passwordProtected = true;
  }

  const url = await Url.create({
    originalUrl,
    shortCode,
    category: category || "Other",
    oneTime: !!oneTime,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    password: hashedPassword,
    passwordProtected,
    createdBy: req.user.id,
  });

  res.status(201).json({
    message: "Short URL created successfully",
    data: url,
  });
};

// BULK CREATE SHORT URL
export const bulkCreateShortUrl = async (req, res) => {
  const { links } = req.body; // Array of { originalUrl, category, oneTime, customAlias, expiresAt, password }

  if (!links || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({
      message: "Please provide an array of link objects to shorten.",
    });
  }

  if (links.length > 10) {
    return res.status(400).json({
      message: "Bulk shortening is limited to 10 URLs at a time.",
    });
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const { originalUrl, category, oneTime, customAlias, expiresAt, password } = link;

    if (!originalUrl) {
      errors.push({ index: i, message: "Original URL is required." });
      continue;
    }

    try {
      new URL(originalUrl);
    } catch {
      errors.push({ index: i, originalUrl, message: "Invalid URL format." });
      continue;
    }

    let shortCode = nanoid(7);
    if (customAlias) {
      const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
      if (!aliasRegex.test(customAlias)) {
        errors.push({ index: i, originalUrl, message: "Alias must be alphanumeric (3-30 chars)." });
        continue;
      }

      const existingCode = await Url.findOne({ shortCode: customAlias });
      if (existingCode) {
        errors.push({ index: i, originalUrl, message: `Alias '${customAlias}' is already in use.` });
        continue;
      }
      shortCode = customAlias;
    }

    let hashedPassword = null;
    let passwordProtected = false;
    if (password && password.trim() !== "") {
      hashedPassword = await hash(password, 10);
      passwordProtected = true;
    }

    try {
      const url = await Url.create({
        originalUrl,
        shortCode,
        category: category || "Other",
        oneTime: !!oneTime,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: hashedPassword,
        passwordProtected,
        createdBy: req.user.id,
      });
      results.push(url);
    } catch (err) {
      errors.push({ index: i, originalUrl, message: err.message });
    }
  }

  res.status(200).json({
    message: `Processed bulk shortening. Success: ${results.length}, Failures: ${errors.length}`,
    data: results,
    errors,
  });
};

// GET MY URLS
export const getMyUrls = async (req, res) => {
  const urls = await Url.find({
    createdBy: req.user.id,
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    count: urls.length,
    data: urls,
  });
};

// GET URL BY ID
export const getUrlById = async (req, res) => {
  const { id } = req.params;

  const url = await Url.findOne({
    _id: id,
    createdBy: req.user.id,
  });

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  res.status(200).json({
    data: url,
  });
};

// UPDATE URL
export const updateUrl = async (req, res) => {
  const { id } = req.params;

  const url = await Url.findOne({
    _id: id,
    createdBy: req.user.id,
  });

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  const { category, oneTime, shortCode, expiresAt, password, isActive } = req.body;

  if (category !== undefined) {
    url.category = category;
  }

  if (oneTime !== undefined) {
    url.oneTime = oneTime;
  }

  if (isActive !== undefined) {
    url.isActive = isActive;
  }

  if (expiresAt !== undefined) {
    url.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  if (password !== undefined) {
    if (password === "" || password === null) {
      url.password = null;
      url.passwordProtected = false;
    } else {
      url.password = await hash(password, 10);
      url.passwordProtected = true;
    }
  }

  if (shortCode && shortCode !== url.shortCode) {
    const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
    if (!aliasRegex.test(shortCode)) {
      return res.status(400).json({
        message: "Alias must be alphanumeric, 3-30 characters long.",
      });
    }

    const existingCode = await Url.findOne({ shortCode });
    if (existingCode) {
      return res.status(409).json({
        message: "This custom alias is already in use.",
      });
    }
    url.shortCode = shortCode;
  }

  await url.save();

  res.status(200).json({
    message: "URL updated successfully",
    data: url,
  });
};

// DELETE URL
export const deleteUrl = async (req, res) => {
  const { id } = req.params;

  const url = await Url.findOne({
    _id: id,
    createdBy: req.user.id,
  });

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  await Url.findByIdAndDelete(id);

  res.status(200).json({
    message: "URL deleted successfully",
  });
};

// UNLOCK PASSWORD-PROTECTED URL
export const unlockShortUrl = async (req, res) => {
  const { shortCode } = req.params;
  const { password } = req.body;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).json({
      message: "Short URL not found",
    });
  }

  if (!url.passwordProtected) {
    return res.status(400).json({
      message: "This link is not password protected",
    });
  }

  const isMatched = await compare(password, url.password);
  if (!isMatched) {
    return res.status(401).json({
      message: "Incorrect password",
    });
  }

  // Increment clicks on successful unlock & record analytics
  url.clicks += 1;
  if (url.oneTime) {
    url.used = true;
  }
  await url.save();

  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;

  recordAnalytics(url._id, userAgent, ip).catch((err) => {
    console.error("Error logging analytics asynchronously:", err.message);
  });

  res.status(200).json({
    originalUrl: url.originalUrl,
  });
};

// GET URL ANALYTICS
export const getUrlAnalytics = async (req, res) => {
  const { id } = req.params;

  const url = await Url.findOne({
    _id: id,
    createdBy: req.user.id,
  });

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  // Aggregate stats from the analytics array
  const countryStats = {};
  const cityStats = {};
  const browserStats = {};
  const deviceStats = {};
  const clicksByDate = {}; // Track daily clicks

  if (url.analytics && Array.isArray(url.analytics)) {
    url.analytics.forEach((click) => {
      const country = click.country || "Unknown";
      const city = click.city || "Unknown";
      const browser = click.browser || "Unknown";
      const device = click.device || "Unknown";

      countryStats[country] = (countryStats[country] || 0) + 1;
      cityStats[city] = (cityStats[city] || 0) + 1;
      browserStats[browser] = (browserStats[browser] || 0) + 1;
      deviceStats[device] = (deviceStats[device] || 0) + 1;

      // Click timestamp formatting
      if (click.clickedAt) {
        const dateStr = new Date(click.clickedAt).toISOString().split("T")[0];
        clicksByDate[dateStr] = (clicksByDate[dateStr] || 0) + 1;
      }
    });
  }

  // Sort clicks by date
  const sortedClicksByDate = Object.entries(clicksByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .reduce((acc, [date, count]) => {
      acc[date] = count;
      return acc;
    }, {});

  // Get recent 10 clicks history (newest first)
  const sortedAnalytics = url.analytics
    ? [...url.analytics].sort((a, b) => new Date(b.clickedAt) - new Date(a.clickedAt))
    : [];

  const recentClicks = sortedAnalytics.slice(0, 10).map((click) => ({
    country: click.country,
    city: click.city,
    browser: click.browser,
    device: click.device,
    clickedAt: click.clickedAt,
  }));

  res.status(200).json({
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    category: url.category,
    clicks: url.clicks,
    oneTime: url.oneTime,
    used: url.used,
    expiresAt: url.expiresAt,
    isActive: url.isActive,
    passwordProtected: url.passwordProtected,
    createdAt: url.createdAt,
    stats: {
      countries: countryStats,
      cities: cityStats,
      browsers: browserStats,
      devices: deviceStats,
      clicksByDate: sortedClicksByDate,
      recentClicks,
    },
  });
};

// REDIRECT URL
export const redirectUrl = async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

  if (!url) {
    // Redirect to frontend Page Not Found / 404
    return res.redirect(`${frontendUrl}/error?msg=not-found`);
  }

  if (!url.isActive) {
    return res.redirect(`${frontendUrl}/error?msg=inactive`);
  }

  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    return res.redirect(`${frontendUrl}/error?msg=expired`);
  }

  if (url.oneTime && url.used) {
    return res.redirect(`${frontendUrl}/error?msg=expired`);
  }

  if (url.passwordProtected) {
    // Redirect to frontend unlock screen
    return res.redirect(`${frontendUrl}/unlock/${shortCode}`);
  }

  // Increment clicks
  url.clicks += 1;

  if (url.oneTime) {
    url.used = true;
  }

  await url.save();

  // Extract client info
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;

  // Run analytics in the background
  recordAnalytics(url._id, userAgent, ip).catch((err) => {
    console.error("Error logging analytics asynchronously:", err.message);
  });

  return res.redirect(url.originalUrl);
};

// ADMIN - GET ALL URLS
export const getAllUrls = async (req, res) => {
  const urls = await Url.find()
    .populate("createdBy", "name email role")
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    count: urls.length,
    data: urls,
  });
};

// ADMIN - DELETE ANY URL
export const adminDeleteUrl = async (req, res) => {
  const { id } = req.params;

  const url = await Url.findById(id);

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  await Url.findByIdAndDelete(id);

  res.status(200).json({
    message: "URL deleted by admin",
  });
};

// ADMIN - PLATFORM ANALYTICS
export const getPlatformAnalytics = async (req, res) => {
  const totalUrls = await Url.countDocuments();
  const totalUsers = await User.countDocuments();

  const totalClicksResult = await Url.aggregate([
    {
      $group: {
        _id: null,
        totalClicks: {
          $sum: "$clicks",
        },
      },
    },
  ]);

  const totalClicks =
    totalClicksResult.length > 0
      ? totalClicksResult[0].totalClicks
      : 0;

  // Aggregate category stats
  const categoryStatsResult = await Url.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = {};
  categoryStatsResult.forEach((stat) => {
    const categoryName = stat._id || "Other";
    categoryStats[categoryName] = stat.count;
  });

  res.status(200).json({
    totalUrls,
    totalClicks,
    totalUsers,
    categoryStats,
    generatedAt: new Date(),
  });
};

// ADMIN - GET BACKEND HOST NETWORK IP
export const getNetworkIp = async (req, res) => {
  const interfaces = os.networkInterfaces();
  let ipAddress = "localhost";
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress !== "localhost") break;
  }
  
  res.status(200).json({ ipAddress });
};