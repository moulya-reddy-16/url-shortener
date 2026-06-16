export const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`;
export const HOST_URL = BASE_URL.replace(/\/api$/, "");

/**
 * Get the redirection URL prefix for shortcodes.
 */
export const getShortUrlPrefix = (networkIp = "localhost") => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${HOST_URL}/api/url/r/`;
  }
  const host = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? networkIp : window.location.hostname;
  return `http://${host}:5000/api/url/r/`;
};

/**
 * Custom fetch wrapper to handle JSON payloads, cookies (credentials),
 * and standard auth headers cleanly.
 */
export const api = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default credentials to 'include' so cookies are always sent/received
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Get token from localStorage if cookie is not being used
  const token = localStorage.getItem("token");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    credentials: "include", // Essential for HttpOnly Cookie authentication
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    // If token expired or invalid, clear session and redirect to login
    if (response.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};
