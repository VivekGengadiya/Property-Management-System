import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// ✅ Load .env file
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

cloudinary.api.ping((err, res) => {
    if (err) console.error("❌ Cloudinary not connected:", err.message);
    else console.log("✅ Cloudinary working:", res);
});
