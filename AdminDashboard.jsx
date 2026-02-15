import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import EditJobModal from "../components/EditJobModal";
import ApplicationFilters from "../components/ApplicationFilters";
import ApplicationsTable from "../components/ApplicationsTable";
import ApplicantDetailsModal from "../components/ApplicantDetailsModal";
import ActivityLogContent from "../components/ActivityLogContent";

export default function AdminDashboard() {
    const { user, token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("overview");

    // Data States
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
    });
    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [advancedStats, setAdvancedStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Job State
    const [editingJob, setEditingJob] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // View Applicant Details State
    const [viewingApplicant, setViewingApplicant] = useState(null);
    const [showApplicantModal, setShowApplicantModal] = useState(false);

    // Fetch Data based on active tab
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (activeTab === "overview") {
                const res = await axios.get("http://localhost:5000/api/admin/stats", config);
                setStats(res.data);
                // Also fetch advanced stats for the dashboard overview
                const advancedRes = await axios.get("http://localhost:5000/api/admin/analytics", config);
                setAdvancedStats(advancedRes.data);
            } else if (activeTab === "jobs") {
                const res = await axios.get("http://localhost:5000/api/admin/jobs", config);
                setJobs(res.data);
            } else if (activeTab === "users") {
                const res = await axios.get("http://localhost:5000/api/admin/users", config);
                setUsers(res.data);
            } else if (activeTab === "admins") {
                const res = await axios.get("http://localhost:5000/api/admin/admins", config);
                setAdmins(res.data);
            } else if (activeTab === "applications") {
                const res = await axios.get("http://localhost:5000/api/admin/applications", config);
                setApplications(res.data);
                setFilteredApplications(res.data);
            } else if (activeTab === "analytics") {
                const res = await axios.get("http://localhost:5000/api/admin/analytics", config);
                setAdvancedStats(res.data);
            }
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleDeleteJob = async (id) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (err) {
            alert("Failed to delete job");
        }
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setShowEditModal(true);
    };

    const handleJobUpdate = (updatedJob) => {
        // If the job already exists, update it, otherwise add it to the list
        setJobs(prevJobs => {
            const exists = prevJobs.some(j => j._id === updatedJob._id);
            if (exists) {
                return prevJobs.map(j => j._id === updatedJob._id ? updatedJob : j);
            } else {
                return [updatedJob, ...prevJobs];
            }
        });
    };

    const handleCreateJob = () => {
        setEditingJob({}); // Empty object triggers creation mode in modal
        setShowEditModal(true);
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleToggleFeatured = async (jobId, currentFeatured) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/jobs/${jobId}/featured`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert("Failed to toggle featured status");
        }
    };

    const handleCloneJob = async (jobId) => {
        if (!window.confirm("Clone this job?")) return;
        try {
            await axios.post(
                `http://localhost:5000/api/admin/jobs/${jobId}/clone`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Job cloned successfully!");
            fetchData();
        } catch (err) {
            alert("Failed to clone job");
        }
    };

    const handleFilterApplications = async (filters) => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/admin/applications/filter",
                filters,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFilteredApplications(res.data);
        } catch (err) {
            console.error("Filter error:", err);
        }
    };

    const handleDeleteApplication = async (appId) => {
        if (!window.confirm("Delete this application?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/applications/${appId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (err) {
            alert("Failed to delete application");
        }
    };

    const handleApplicationStatusUpdate = (updatedApp) => {
        setApplications(applications.map(app => app._id === updatedApp._id ? updatedApp : app));
        setFilteredApplications(filteredApplications.map(app => app._id === updatedApp._id ? updatedApp : app));
    };

    const handleViewApplicantDetails = (application) => {
        setViewingApplicant(application);
        setShowApplicantModal(true);
    };

    const handleExport = async (type) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/export/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `export_${type}_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export error:", err);
            alert("Failed to export data");
        }
    };

    // Chart Data Preparation
    const data = [
        { name: "Users", count: stats.totalUsers },
        { name: "Jobs", count: stats.totalJobs },
        { name: "Applications", count: stats.totalApplications },
    ];

    const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
                </div>
                <nav className="mt-6">
                    <NavItem label="Overview" tab="overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Applications" tab="applications" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Jobs Management" tab="jobs" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Users Management" tab="users" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Admins Management" tab="admins" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Admin Insights & Analysis" tab="analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <NavItem label="Admin Activity & Logs" tab="activity" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <StatCard title="Total Users" value={stats.totalUsers} color="bg-gradient-to-r from-blue-500 to-blue-600" />
                                    <StatCard title="Total Jobs" value={stats.totalJobs} color="bg-gradient-to-r from-green-500 to-green-600" />
                                    <StatCard title="Active Jobs" value={stats.activeJobs} color="bg-gradient-to-r from-teal-500 to-teal-600" />
                                    <StatCard title="Applications" value={stats.totalApplications} color="bg-gradient-to-r from-purple-500 to-purple-600" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    {/* Application Trends */}
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">Platform Growth</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    itemStyle={{ color: '#374151', fontWeight: 600 }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Application Status Distribution */}
                                    {advancedStats && (
                                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                            <h3 className="text-xl font-semibold mb-6 text-gray-700">Application Status</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Pending', value: advancedStats.applicationStatus.pending },
                                                            { name: 'Shortlisted', value: advancedStats.applicationStatus.shortlisted },
                                                            { name: 'Rejected', value: advancedStats.applicationStatus.rejected },
                                                            { name: 'Hired', value: advancedStats.applicationStatus.hired }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={(entry) => `${entry.name}`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {COLORS.map((color, index) => (
                                                            <Cell key={`cell-${index}`} fill={color} />
                                                        ))}
                                                    </Pie>
                                                    <Legend />
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-8 mt-8">
                                    {/* Top Jobs */}
                                    {advancedStats && advancedStats.topJobs && (
                                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                            <h3 className="text-xl font-semibold mb-6 text-gray-700">Top Performing Jobs (by Applications)</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={advancedStats.topJobs} layout="vertical" margin={{ left: 100, right: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#3B82F6" name="Applications" radius={[0, 4, 4, 0]} barSize={30} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* APPLICATIONS TAB */}
                        {activeTab === "applications" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800">Application Management</h2>
                                    <button
                                        onClick={() => handleExport("applications")}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        <span>📥</span> Export CSV
                                    </button>
                                </div>

                                <ApplicationFilters jobs={jobs.length > 0 ? jobs : []} onFilter={handleFilterApplications} />

                                <ApplicationsTable
                                    applications={filteredApplications}
                                    onStatusUpdate={handleApplicationStatusUpdate}
                                    onDelete={handleDeleteApplication}
                                    onViewDetails={handleViewApplicantDetails}
                                    token={token}
                                />
                            </div>
                        )}

                        {/* JOBS TAB */}
                        {activeTab === "jobs" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800">Jobs Management</h2>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCreateJob}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <span>➕</span> Add New Job
                                        </button>
                                        <button
                                            onClick={() => handleExport("jobs")}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            <span>📥</span> Export CSV
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Logo</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Title</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Company</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Location</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Deadline</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Featured</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {jobs.map((job) => (
                                                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                                                            {job.companyLogo ? (
                                                                <img
                                                                    src={`http://localhost:5000${job.companyLogo}`}
                                                                    alt="Logo"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400">No Logo</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                                    <td className="px-6 py-4 text-gray-600">{job.company}</td>
                                                    <td className="px-6 py-4 text-gray-600">{job.location}</td>
                                                    <td className="px-6 py-4 text-gray-600">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleToggleFeatured(job._id, job.featured)}
                                                            className={`px-2 py-1 text-xs rounded ${job.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {job.featured ? '⭐ Featured' : 'Not Featured'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleEditJob(job)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleCloneJob(job._id)}
                                                            className="text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                                                        >
                                                            Clone
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {jobs.length === 0 && <p className="p-8 text-center text-gray-500">No jobs found.</p>}
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === "users" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800">Users Management</h2>
                                    <button
                                        onClick={() => handleExport("users")}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        <span>📥</span> Export CSV
                                    </button>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Name</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Email</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Role</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Joined</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map((u) => (
                                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                            User
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {users.length === 0 && <p className="p-8 text-center text-gray-500">No regular users found.</p>}
                                </div>
                            </div>
                        )}

                        {/* ADMINS TAB */}
                        {activeTab === "admins" && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Admins Management</h2>
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Name</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Email</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Role</th>
                                                <th className="px-6 py-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {admins.map((u) => (
                                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                            Admin
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {admins.length === 0 && <p className="p-8 text-center text-gray-500">No admins found.</p>}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === "analytics" && advancedStats && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-800">Admin Insights & Analysis</h2>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <StatCard title="Total Users" value={advancedStats.basic.totalUsers} color="bg-gradient-to-r from-blue-500 to-blue-600" />
                                    <StatCard title="Total Jobs" value={advancedStats.basic.totalJobs} color="bg-gradient-to-r from-green-500 to-green-600" />
                                    <StatCard title="Active Jobs" value={advancedStats.basic.activeJobs} color="bg-gradient-to-r from-teal-500 to-teal-600" />
                                    <StatCard title="Total Applications" value={advancedStats.basic.totalApplications} color="bg-gradient-to-r from-purple-500 to-purple-600" />
                                </div>

                                {/* Application Status Breakdown */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">Application Status Distribution</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Pending', value: advancedStats.applicationStatus.pending },
                                                        { name: 'Shortlisted', value: advancedStats.applicationStatus.shortlisted },
                                                        { name: 'Rejected', value: advancedStats.applicationStatus.rejected },
                                                        { name: 'Hired', value: advancedStats.applicationStatus.hired }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {COLORS.map((color, index) => (
                                                        <Cell key={`cell-${index}`} fill={color} />
                                                    ))}
                                                </Pie>
                                                <Legend />
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">Recent Activity (Last 7 Days)</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">New Users</span>
                                                <span className="text-2xl font-bold text-blue-600">{advancedStats.recent.newUsers}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">New Jobs</span>
                                                <span className="text-2xl font-bold text-green-600">{advancedStats.recent.newJobs}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">New Applications</span>
                                                <span className="text-2xl font-bold text-purple-600">{advancedStats.recent.newApplications}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trends Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Application Trends */}
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">Application Trends (Last 30 Days)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={advancedStats.trends}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Applications" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* User Registration Trends */}
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">User Registration Trends (Last 30 Days)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={advancedStats.userTrends}>
                                                <defs>
                                                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="_id" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorUser)" name="New Users" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Top Jobs by Applications */}
                                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
                                        <h3 className="text-xl font-semibold mb-6 text-gray-700">Top Performing Jobs</h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={advancedStats.topJobs} layout="vertical" margin={{ left: 40, right: 40 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" />
                                                <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" fill="#3B82F6" name="Applications" radius={[0, 4, 4, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACTIVITY LOGS TAB */}
                        {activeTab === "activity" && (
                            <ActivityLogContent token={token} />
                        )}
                    </>
                )}
            </main>

            {/* Edit Job Modal */}
            {showEditModal && (
                <EditJobModal
                    job={editingJob}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleJobUpdate}
                    token={token}
                />
            )}

            {/* Applicant Details Modal */}
            {showApplicantModal && viewingApplicant && (
                <ApplicantDetailsModal
                    application={viewingApplicant}
                    onClose={() => setShowApplicantModal(false)}
                    onStatusUpdate={handleApplicationStatusUpdate}
                    token={token}
                />
            )}
        </div>
    );
}

const NavItem = ({ label, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`w-full text-left px-6 py-3 transition-colors ${activeTab === tab
            ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
    >
        {label}
    </button>
);

const StatCard = ({ title, value, color }) => (
    <div className={`${color} text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105 duration-300`}>
        <h3 className="text-lg font-semibold opacity-90">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
);
