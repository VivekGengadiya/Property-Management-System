import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, Email, Password, and Role are required"
            });
        }

        // Email format validation
        const allowedEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!allowedEmailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Password security validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Allowed role validation
        const allowedRoles = ["LANDLORD", "TENANT", "MAINTENANCE"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`
            });
        }

        // Prevent duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            phone,
            role,
            passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get users (optional filter by role)
export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;

        const filter = {};
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter).select("-passwordHash");

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
