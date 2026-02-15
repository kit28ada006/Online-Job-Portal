import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true, // e.g., "DELETE_JOB", "UPDATE_APPLICATION", "TOGGLE_FEATURED"
        },
        targetType: {
            type: String,
            required: true, // e.g., "JOB", "APPLICATION", "USER"
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        details: {
            type: String,
            default: "",
        },
        ip: {
            type: String,
            default: "",
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Index for efficient querying of recent logs
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ adminId: 1 });
activityLogSchema.index({ targetType: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
