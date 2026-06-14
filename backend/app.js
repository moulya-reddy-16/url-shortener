import exp from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRoutes.js";
import urlRouter from "./routes/urlRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// CREATE EXPRESS APP
const app = exp();


// CORS
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));


// BODY PARSER
app.use(exp.json());


// COOKIE PARSER
app.use(cookieParser());


//ROUTES
app.use("/api/auth", authRouter);

app.use("/api/url", urlRouter);

// SERVE UPLOADED IMAGES
app.use("/uploads", exp.static(path.join(__dirname, "uploads")));


// 404
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    // Only log full error in development
    if (process.env.NODE_ENV !== "production") {
        console.error("Error:", err);
    } else {
        console.error("Error:", err.message);
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Validation error", error: err.message });
    }

    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID format", error: err.message });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        const value = keyValue[field];
        return res.status(409).json({
            message: "Duplicate entry",
            error: `${field} "${value}" already exists`,
        });
    }

    res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
});

export default app;
