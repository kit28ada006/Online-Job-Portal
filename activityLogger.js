import ActivityLog from "../models/ActivityLog.js";

/**
 * Utility to log admin activities
 * @param {string} adminId - ID of the admin performing the action
 * @param {string} action - Action performed (e.g., "DELETE_JOB")
 * @param {string} targetType - Type of resource (e.g., "JOB")
 * @param {string} targetId - ID of the resource
 * @param {string} details - Additional human-readable details
 * @param {Object} req - Request object to capture IP and User-Agent
 */
export const logActivity = async (adminId, action, targetType, targetId, details, req) => {
    try {
        await ActivityLog.create({
            adminId,
            action,
            targetType,
            targetId,
            details,
            ip: req?.ip || "",
            userAgent: req?.headers["user-agent"] || "",
        });
    } catch (err) {
        console.error("FAILED TO LOG ACTIVITY:", err);
    }
};
