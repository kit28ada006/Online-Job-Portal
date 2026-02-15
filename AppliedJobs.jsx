import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { FiMapPin, FiBriefcase, FiCalendar, FiChevronRight } from "react-icons/fi";

export default function AppliedJobs() {
  const { token } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get("http://localhost:5000/api/user/applied-jobs", config);
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setError("Failed to load your application history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppliedJobs();
    }
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
          <p className="mt-2 text-gray-600">Track the status of your recent job applications</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
            Total Applications: {applications.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400 text-3xl">
            <FiBriefcase />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-6">Start your career journey by applying to relevant jobs.</p>
          <button
            onClick={() => navigate("/jobs")}
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              onClick={() => navigate(`/jobs/${app.jobId?._id}`)}
              className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              {/* Company Logo / Placeholder */}
              <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                {app.jobId?.logo ? (
                  <img
                    src={`http://localhost:5000${app.jobId.logo}`}
                    alt={app.jobId?.company}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <FiBriefcase className="text-2xl text-gray-400 group-hover:text-blue-500 transition-colors" />
                )}
              </div>

              {/* Job Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {app.jobId?.title || "Unknown Position"}
                  </h2>
                  <div className="sm:hidden">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{app.jobId?.company || "N/A"}</span>
                  <span className="flex items-center gap-1">
                    <FiMapPin className="text-gray-400" />
                    {app.jobId?.location || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="text-gray-400" />
                    Applied on {formatDate(app.appliedAt)}
                  </span>
                </div>
              </div>

              {/* Status & Action (Desktop) */}
              <div className="hidden sm:flex flex-col items-end gap-3">
                <StatusBadge status={app.status} />
                <span className="text-gray-400 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <FiChevronRight />
                </span>
              </div>

              {/* Mobile Status Row (Alternative) */}
              <div className="sm:hidden w-full flex justify-between items-center mt-2 border-t pt-3">
                <span className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                  View Details <FiChevronRight />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}