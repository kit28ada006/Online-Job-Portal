import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import dayjs from "dayjs";

export default function SavedJobs() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/user/saved-jobs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSavedJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSavedJobs();
  }, [token]);

  if (loading) return <p className="text-center mt-20">Loading saved jobs...</p>;

  if (savedJobs.length === 0)
    return (
      <div className="text-center mt-20 text-gray-500">
        No saved jobs yet.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FaBookmark className="text-green-600" /> Saved Jobs
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {savedJobs.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex gap-4">
              <img
                src={job.companyLogo || "https://via.placeholder.com/60"}
                alt={job.company}
                className="w-14 h-14 object-contain border rounded"
              />

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>

                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-gray-400">
                    {job.createdAt
                      ? `Posted ${dayjs(job.createdAt).fromNow()}`
                      : ""}
                  </span>
                  {job.salary && (
                    <span className="text-green-700 font-semibold">
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}