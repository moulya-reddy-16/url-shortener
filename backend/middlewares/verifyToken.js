import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const SECRET_KEY = process.env.SECRET_KEY?.trim();

export const verifyToken = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      let token = req.cookies?.token;

      // Authorization: Bearer <token>
      if (!token) {
        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        }
      }

      // x-auth-token
      if (!token) {
        token = req.headers["x-auth-token"];
      }

      if (!token) {
        return res.status(401).json({
          message: "Please login first",
        });
      }

      if (!SECRET_KEY) {
        console.error("SECRET_KEY is not configured");
        return res.status(500).json({
          message: "Server configuration error",
        });
      }

      let decodedToken;

      try {
        decodedToken = jwt.verify(token, SECRET_KEY);
      } catch (jwtErr) {
        if (jwtErr.name === "TokenExpiredError") {
          return res.status(401).json({
            message: "Token expired",
          });
        }

        if (jwtErr.name === "JsonWebTokenError") {
          return res.status(401).json({
            message: "Invalid token",
          });
        }

        return res.status(401).json({
          message: "Authentication failed",
        });
      }

      // Role check only if roles are provided
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decodedToken.role)
      ) {
        return res.status(403).json({
          message: "You are not authorized",
        });
      }

      req.user = decodedToken;

      next();
    } catch (err) {
      console.error("verifyToken error:", err);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};