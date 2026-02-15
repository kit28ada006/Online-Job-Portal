import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

/* UPLOAD RESUME */
router.post("/upload-resume", authMiddleware, upload.single("resume"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = `/uploads/resumes/${req.file.filename}`;

        res.status(200).json({
            message: "Resume uploaded successfully",
            filePath: filePath,
            fileName: req.file.originalname,
        });
    } catch (err) {
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({ message: "Failed to upload resume" });
    }
});

/* UPLOAD LOGO */
router.post("/upload-logo", authMiddleware, upload.single("logo"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = `/uploads/logos/${req.file.filename}`;

        res.status(200).json({
            message: "Logo uploaded successfully",
            filePath: filePath,
            fileName: req.file.originalname,
        });
    } catch (err) {
        console.error("LOGO UPLOAD ERROR:", err);
        res.status(500).json({ message: "Failed to upload logo" });
    }
});

export default router;
