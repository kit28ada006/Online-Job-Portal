import React from "react";

const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    "Under Review": "bg-purple-100 text-purple-700 border-purple-300",
    Shortlisted: "bg-blue-100 text-blue-700 border-blue-300",
    Rejected: "bg-red-100 text-red-700 border-red-300",
    Hired: "bg-green-100 text-green-700 border-green-300",
};

export default function StatusBadge({ status }) {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
        >
            {status}
        </span>
    );
}
