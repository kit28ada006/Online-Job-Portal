import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [tab, setTab] = useState("saved");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchJobs = async () => {
      try {
        const savedRes = await axios.get("http://localhost:5000/api/user/saved-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedJobs(savedRes.data);

        const appliedRes = await axios.get("http://localhost:5000/api/user/applied-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppliedJobs(appliedRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard jobs:", err);
      }
    };

    fetchJobs();
  }, [token]);

  const jobsToDisplay = tab === "saved" ? savedJobs : appliedJobs;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("saved")}
          className={`px-4 py-2 font-semibold rounded ${
            tab === "saved" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Saved Jobs
        </button>
        <button
          onClick={() => setTab("applied")}
          className={`px-4 py-2 font-semibold rounded ${
            tab === "applied" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Applied Jobs
        </button>
      </div>

      {/* Jobs List */}
      {jobsToDisplay.length === 0 ? (
        <p className="text-gray-500 text-xl">
          {tab === "saved" ? "No saved jobs yet." : "No applied jobs yet."}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobsToDisplay.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-bold">{job.title}</h2>
              <p className="text-gray-600">{job.company} • {job.location}</p>
              {job.salary && <p className="text-green-700 mt-1">Salary: {job.salary}</p>}
              {job.deadline && (
                <p className="text-red-500 mt-1">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}