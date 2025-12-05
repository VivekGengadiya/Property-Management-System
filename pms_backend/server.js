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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add your frontend URLs here
const allowedOrigins = [
  "http://localhost:5173", // React dev
  "http://127.0.0.1:5173", // sometimes needed
  "https://frontend-property-management-system.onrender.com", // Render frontend
  "https://vasudha.ca",
  "https://www.vasudha.ca"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked: " + origin), false);
    },
    credentials: true,
  })
);



// Static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend Running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/maintenance", maintenanceRoutes);

console.log("Mounted routes:");
console.log(" - /api/users");
console.log(" - /api/properties");
console.log(" - /api/units");
console.log(" - /api/applications");
console.log(" - /api/leases");
console.log(" - /api/invoices");
console.log(" - /api/payments");
console.log(" - /api/maintenance");

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error Middleware:", err.message);

  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: "Only JPG, PNG, PDF, DOC or DOCX files are allowed.",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server error occurred.",
  });
});

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
