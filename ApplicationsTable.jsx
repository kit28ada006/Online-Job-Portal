import React, { useState } from "react";
import axios from "axios";
import StatusBadge from "./StatusBadge";

export default function ApplicationsTable({
    applications,
    onStatusUpdate,
    onDelete,
    onViewDetails,
    token,
}) {
    const [selected, setSelected] = useState([]);
    const [bulkStatus, setBulkStatus] = useState("");

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(applications.map((app) => app._id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((appId) => appId !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/admin/applications/${applicationId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onStatusUpdate(res.data.application);
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update status");
        }
    };

    const handleBulkUpdate = async () => {
        if (selected.length === 0) {
            alert("Please select applications first");
            return;
        }
        if (!bulkStatus) {
            alert("Please select a status");
            return;
        }

        try {
            await axios.put(
                "http://localhost:5000/api/admin/applications/bulk-update",
                { applicationIds: selected, status: bulkStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh the data
            alert(`${selected.length} application(s) updated successfully`);
            setSelected([]);
            setBulkStatus("");
            window.location.reload(); // Simple refresh - you can improve this
        } catch (err) {
            console.error("Bulk update error:", err);
            alert("Failed to bulk update");
        }
    };

    if (applications.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                <p className="text-gray-500">No applications found.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Bulk Actions Bar */}
            {selected.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">
                        {selected.length} application(s) selected
                    </span>
                    <div className="flex items-center gap-3">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                        </select>
                        <button
                            onClick={handleBulkUpdate}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                            Update Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selected.length === applications.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                Applicant
                            </th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                Job
                            </th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                Applied Date
                            </th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                Status
                            </th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <tr
                                key={app._id}
                                className={`hover:bg-gray-50 transition-colors ${selected.includes(app._id) ? "bg-blue-50" : ""
                                    }`}
                            >
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(app._id)}
                                        onChange={() => handleSelectOne(app._id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {app.userId?.name || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {app.userId?.email || "N/A"}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {app.jobId?.title || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {app.jobId?.company || "N/A"}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shortlisted">Shortlisted</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Hired">Hired</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => onViewDetails(app)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onDelete(app._id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
