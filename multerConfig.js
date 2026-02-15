import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directories if they don't exist
const resumeDir = "./uploads/resumes";
const logoDir = "./uploads/logos";

[resumeDir, logoDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "logo") {
            cb(null, logoDir);
        } else {
            cb(null, resumeDir);
        }
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId_timestamp_originalname
        const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "logo") {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only images (JPG, PNG, WEBP, GIF) are allowed for logos!"));
        }
    } else {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and DOC/DOCX files are allowed for resumes!"));
        }
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter,
});

export default upload;
