import React from "react";
import axios from "axios";

export default function ApplicantDetailsModal({ application, onClose, token, onStatusUpdate }) {
    const handleStatusChange = async (newStatus) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/admin/applications/${application._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onStatusUpdate(res.data.application);
            alert(`Application ${newStatus === "Accepted" ? "accepted" : "status updated"}!`);
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update status");
        }
    };

    const handleViewResume = () => {
        if (application.resume) {
            window.open(`http://localhost:5000${application.resume}`, "_blank");
        } else {
            alert("No resume uploaded");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Applicant Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Job Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Applied For</h3>
                        <p className="text-lg font-bold text-blue-600">{application.jobId?.title || "N/A"}</p>
                        <p className="text-gray-600">{application.jobId?.company || "N/A"}</p>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            <p className="text-gray-900 font-medium">{application.fullName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            <p className="text-gray-900">{application.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                            <p className="text-gray-900">{application.phone}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Applied Date</label>
                            <p className="text-gray-900">{new Date(application.appliedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${application.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : application.status === "Shortlisted"
                                        ? "bg-blue-100 text-blue-700"
                                        : application.status === "Rejected"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                }`}
                        >
                            {application.status}
                        </span>
                    </div>

                    {/* Experience */}
                    {application.experience && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Experience</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{application.experience}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {application.skills && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Skills</label>
                            <p className="text-gray-900">{application.skills}</p>
                        </div>
                    )}

                    {/* Cover Letter */}
                    {application.coverLetter && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Cover Letter</label>
                            <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                {application.coverLetter}
                            </p>
                        </div>
                    )}

                    {/* Resume */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Resume</label>
                        {application.resume ? (
                            <button
                                onClick={handleViewResume}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                View Resume
                            </button>
                        ) : (
                            <p className="text-gray-500 italic">No resume uploaded</p>
                        )}
                    </div>

                    {/* Admin Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleStatusChange("Shortlisted")}
                                disabled={application.status === "Shortlisted"}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Shortlist
                            </button>
                            <button
                                onClick={() => handleStatusChange("Hired")}
                                disabled={application.status === "Hired"}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Accept / Hire
                            </button>
                            <button
                                onClick={() => handleStatusChange("Rejected")}
                                disabled={application.status === "Rejected"}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleStatusChange("Pending")}
                                disabled={application.status === "Pending"}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reset to Pending
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
