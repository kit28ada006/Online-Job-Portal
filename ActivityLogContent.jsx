import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ActivityLogContent({ token }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/admin/activity", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [token]);

    const getActionColor = (action) => {
        if (action.includes("DELETE")) return "bg-red-100 text-red-700";
        if (action.includes("UPDATE")) return "bg-blue-100 text-blue-700";
        if (action.includes("CLONE")) return "bg-green-100 text-green-700";
        if (action.includes("EXPORT")) return "bg-purple-100 text-purple-700";
        return "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Activity & Logs</h2>
            <p className="text-gray-500">Audit trail of the last 100 administrative actions.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Time</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Admin</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Action</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Resource</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{log.adminId?.name || "Unknown"}</div>
                                    <div className="text-xs text-gray-500">{log.adminId?.email || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {log.targetType}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <p className="p-8 text-center text-gray-500">No logs found.</p>}
            </div>
        </div>
    );
}
