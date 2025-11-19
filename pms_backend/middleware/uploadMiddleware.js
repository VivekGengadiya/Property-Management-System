import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

// ✅ Configure Cloudinary using .env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// ✅ Setup Cloudinary Storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Allowed file extensions
        const allowedFormats = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
        const ext = file.originalname.split(".").pop().toLowerCase();

        if (!allowedFormats.includes(ext)) {
            throw new Error(`Invalid file type: .${ext}. Allowed: ${allowedFormats.join(", ")}`);
        }

        return {
            folder: "pms_uploads",
            resource_type: "auto",
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
            format: ext,
        };
    },
});

// ✅ Create multer instance (no size limit)
export const upload = multer({
    storage,
});
