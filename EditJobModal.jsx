import React, { useState, useEffect } from "react";
import axios from "axios";

const EditJobModal = ({ job, onClose, onUpdate, token }) => {
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        description: "",
        salary: "",
        jobType: "",
        deadline: "",
        companyLogo: "",
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (job && job._id) {
            setFormData({
                title: job.title || "",
                company: job.company || "",
                location: job.location || "",
                description: job.description || "",
                salary: job.salary || "",
                jobType: job.jobType || "",
                deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : "",
                companyLogo: job.companyLogo || "",
            });
            setLogoPreview(job.companyLogo ? `http://localhost:5000${job.companyLogo}` : "");
        } else {
            // Creation mode - reset to empty
            setFormData({
                title: "",
                company: "",
                location: "",
                description: "",
                salary: "",
                jobType: "Onsite",
                deadline: "",
                companyLogo: "",
            });
            setLogoPreview("");
        }
        setLogoFile(null);
    }, [job]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let currentLogoPath = formData.companyLogo;

            // 1. Upload Logo if a new file is selected
            if (logoFile) {
                setUploading(true);
                const uploadData = new FormData();
                uploadData.append("logo", logoFile);

                const uploadRes = await axios.post(
                    "http://localhost:5000/api/upload/upload-logo",
                    uploadData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                currentLogoPath = uploadRes.data.filePath;
                setUploading(false);
            }

            const finalData = { ...formData, companyLogo: currentLogoPath };

            if (job && job._id) {
                // UPDATE MODE
                const res = await axios.put(
                    `http://localhost:5000/api/jobs/${job._id}`,
                    finalData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onUpdate(res.data.job);
            } else {
                // CREATE MODE (using admin add endpoint)
                const res = await axios.post(
                    "http://localhost:5000/api/jobs",
                    finalData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onUpdate(res.data.job);
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError(job && job._id ? "Failed to update job." : "Failed to post job.");
            setUploading(false);
        } finally {
            setLoading(false);
        }
    };

    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {job && job._id ? "Edit Job" : "Post New Job"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Logo Upload Section */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="w-16 h-16 rounded overflow-hidden bg-white border flex items-center justify-center text-gray-400">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-xs text-center px-1">No Logo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Salary</label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g. ₹10,000 - ₹20,000 or 5 LPA"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">Supports ranges and text (like Naukri)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Type</label>
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            >
                                <option value="">Select Type</option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${job && job._id ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                        >
                            {uploading ? "Uploading Logo..." : (loading ? "Saving..." : (job && job._id ? "Save Changes" : "Post Job"))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJobModal;
