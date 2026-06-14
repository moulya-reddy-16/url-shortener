import { urlModel as Url } from "../models/Url.js";

/**
 * Basic parsing of user agent string to identify device and browser.
 * Zero external dependencies.
 */
export const parseUserAgent = (uaString) => {
  if (!uaString) return { browser: "Unknown", device: "Desktop" };

  let browser = "Unknown";
  let device = "Desktop";
  const ua = uaString.toLowerCase();

  // Browser detection
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  } else if (ua.includes("edge") || ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("chrome")) {
    browser = "Chrome";
  } else if (ua.includes("safari")) {
    browser = "Safari";
  }

  // Device detection
  if (ua.includes("ipad") || ua.includes("tablet") || ua.includes("playbook") || ua.includes("silk")) {
    device = "Tablet";
  } else if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) {
    device = "Mobile";
  }

  return { browser, device };
};

/**
 * Asynchronously record visit analytics including geolocation and device info.
 */
export const recordAnalytics = async (urlId, userAgent, ip) => {
  const { browser, device } = parseUserAgent(userAgent);
  let country = "Unknown";
  let city = "Unknown";

  // Check for localhost/loopback IP
  if (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("::ffff:127.0.0.1") ||
    ip.toLowerCase() === "localhost"
  ) {
    country = "Localhost";
    city = "Localhost";
  } else {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

      const response = await fetch(`http://ip-api.com/json/${ip}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const geoData = await response.json();
        if (geoData.status === "success") {
          country = geoData.country || "Unknown";
          city = geoData.city || "Unknown";
        }
      }
    } catch (err) {
      console.warn(`Geolocation lookup failed for IP ${ip}:`, err.message);
    }
  }

  try {
    await Url.findByIdAndUpdate(urlId, {
      $push: {
        analytics: {
          country,
          city,
          browser,
          device,
          clickedAt: new Date(),
        },
      },
    });
  } catch (dbErr) {
    console.error(`Failed to save analytics to database for URL ${urlId}:`, dbErr.message);
  }
};
