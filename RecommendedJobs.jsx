import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RecommendedJobs() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/jobs/recommended",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              skills: user.skills?.join(","),
              jobRole: user.jobRole,
              experience: user.experience,
            },
          }
        );
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, token]);

  if (loading) return <p className="text-center mt-10">Loading jobs...</p>;

  return (
    <div className="max-w-5xl mx-auto my-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Recommended Jobs for You</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs matched your profile.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              className="p-4 border rounded cursor-pointer hover:bg-gray-50 flex justify-between"
            >
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
              <span className="text-blue-600 font-medium">View</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}