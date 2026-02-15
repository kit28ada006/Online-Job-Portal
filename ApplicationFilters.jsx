import React, { useState } from "react";

export default function ApplicationFilters({ jobs, onFilter }) {
    const [filters, setFilters] = useState({
        jobId: "",
        jobType: "",
        status: [],
        searchTerm: "",
        startDate: "",
        endDate: "",
    });

    const handleStatusToggle = (status) => {
        setFilters((prev) => {
            const newStatus = prev.status.includes(status)
                ? prev.status.filter((s) => s !== status)
                : [...prev.status, status];
            return { ...prev, status: newStatus };
        });
    };

    const handleApplyFilters = () => {
        onFilter(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            jobId: "",
            jobType: "",
            status: [],
            searchTerm: "",
            startDate: "",
            endDate: "",
        };
        setFilters(clearedFilters);
        onFilter(clearedFilters);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Applications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Search (Name/Email)
                    </label>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Job Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Filter by Job
                    </label>
                    <select
                        value={filters.jobId}
                        onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Jobs</option>
                        {jobs.map((job) => (
                            <option key={job._id} value={job._id}>
                                {job.title} - {job.company}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Job Type Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Filter by Job Type
                    </label>
                    <select
                        value={filters.jobType}
                        onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>

                {/* Date Range */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Status Checkboxes */}
            <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                    Status
                </label>
                <div className="flex flex-wrap gap-3">
                    {["Pending", "Shortlisted", "Rejected", "Hired"].map((status) => (
                        <label key={status} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.status.includes(status)}
                                onChange={() => handleStatusToggle(status)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{status}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>
                <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );
}
