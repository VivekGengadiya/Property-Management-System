// authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-passwordHash");
        if (!req.user) return res.status(401).json({ message: "User no longer exists" });
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// authMiddleware.js (inside authorizeRoles)
export const authorizeRoles = (...roles) => (req, res, next) => {
  const userRole = req.user.role; // e.g., "OWNER"
  // normalize synonyms
  const normalized = (r) => (r === 'OWNER' ? 'LANDLORD' : r);
  const want = new Set(roles.map(normalized));
  const have = normalized(userRole);
  if (!want.has(have)) {
    return res.status(403).json({ success:false, message:`Access denied: ${userRole} not allowed` });
  }
  next();
};
