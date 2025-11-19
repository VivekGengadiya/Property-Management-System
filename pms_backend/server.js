import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Routes
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";

dotenv.config();
const app = express();

// ✅ Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173",
    credentials: true}));

// ✅ [Optional Legacy] Serve static uploads (for old local files, not Cloudinary)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Atlas connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Health Check API
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PMS Backend Running with Cloudinary Integration!",
        timestamp: new Date().toISOString(),
    });
});

// ✅ Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// ✅ Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});
// ✅ Global Error Handler for Upload or Validation Errors
app.use((err, req, res, next) => {
    if (err) {
        console.error("🔥 Upload/Error Middleware:", err.message);

        // Detect file type error (multer or cloudinary)
        if (err.message.includes("Invalid file type")) {
            return res.status(400).json({
                success: false,
                message: "Only JPG, PNG, PDF, DOC or DOCX files are allowed.",
            });
        }

        // Generic fallback
        return res.status(500).json({
            success: false,
            message: err.message || "Server error occurred.",
        });
    }
    next();
});


// ✅ Start Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
