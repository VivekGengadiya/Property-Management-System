import { Router } from "express";
import { registerUser, loginUser, getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();


// POST /api/users/register
router.post("/register", registerUser);

// POST /api/users/login
router.post("/login", loginUser);

// GET /api/users  → list users (optional ?role=MAINTENANCE)
router.get("/", getUsers);

router.get("/profile", protect, async (req, res) => {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: user });
});


export default router;
