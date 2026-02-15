import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  FaRegBookmark,
  FaBookmark,
  FaSearch,
  FaBuilding,
  FaMapMarkerAlt,
  FaFilter
} from "react-icons/fa";
import dayjs from "dayjs";

export default function Jobs() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Full-time",
    "Internship",
    "Remote",
    "Design",
    "Marketing",
    "Development",
    "Sales",
    "Finance",
    "HR"
  ];

  const getPostedTime = (date) => {
    if (!date) return "";
    const diff = dayjs().diff(dayjs(date), "day");
    if (diff === 0) return "Posted today";
    if (diff === 1) return "Posted yesterday";
    return `Posted ${diff} days ago`;
  };

  // ✅ FETCH JOBS (PUBLIC) + SAVED JOBS (ONLY IF LOGGED IN)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // 🔓 PUBLIC JOBS (NO TOKEN REQUIRED)
        const jobsRes = await axios.get("http://localhost:5000/api/jobs");

        const activeJobs = jobsRes.data.filter(
          job => !job.deadline || new Date(job.deadline) >= new Date()
        );

        setJobs(activeJobs);
        setFilteredJobs(activeJobs);

        // 🔐 SAVED JOBS (ONLY IF LOGGED IN)
        if (token) {
          try {
            const savedRes = await axios.get(
              "http://localhost:5000/api/user/saved-jobs",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setSavedJobs(savedRes.data.map(job => job._id));
          } catch (err) {
            console.warn("Saved jobs fetch failed");
            setSavedJobs([]);
          }
        } else {
          setSavedJobs([]);
        }

      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, [token]);

  // APPLY FILTERS
  const applyFilters = () => {
    let result = [...jobs];

    if (category !== "All") {
      result = result.filter(
        job => job.category && job.category === category
      );
    }

    if (title) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (company) {
      result = result.filter(job =>
        job.company.toLowerCase().includes(company.toLowerCase())
      );
    }

    if (location) {
      result = result.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredJobs(result);
  };

  // SAVE / UNSAVE JOB
  const toggleSaveJob = async (jobId) => {
    if (!token) {
      alert("Please login to save jobs");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/user/save-job",
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedJobs(prev =>
        prev.includes(jobId)
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId]
      );
    } catch (err) {
      console.error("Save job error:", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')"
      }}
    >
      <div className="min-h-screen bg-black/60 px-4 py-12">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Job Search Portal
          </h1>

          {/* SEARCH */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-5 gap-3">

              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 p-2 rounded-lg border"
                />
              </div>

              <div className="relative">
                <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 p-2 rounded-lg border"
                />
              </div>

              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 p-2 rounded-lg border"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 rounded-lg border"
              >
                {categories.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white rounded-lg font-semibold"
              >
                <FaFilter className="inline mr-2" /> Filter
              </button>

            </div>
          </div>

          {/* JOBS */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredJobs.length === 0 ? (
              <p className="text-white text-xl col-span-full text-center">
                No jobs found.
              </p>
            ) : (
              filteredJobs.map(job => (
                <div
                  key={job._id}
                  className="relative bg-white rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition cursor-pointer"
                >
                  {/* SAVE */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveJob(job._id);
                    }}
                    className="absolute top-4 right-4 text-2xl text-blue-600"
                  >
                    {savedJobs.includes(job._id)
                      ? <FaBookmark />
                      : <FaRegBookmark />}
                  </div>

                  <div
                    className="flex gap-4"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <img
                      src={job.companyLogo?.startsWith('/uploads') ? `http://localhost:5000${job.companyLogo}` : (job.companyLogo || "https://via.placeholder.com/70")}
                      alt={job.company}
                      className="w-16 h-16 object-contain border rounded-md"
                    />

                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <p className="text-gray-600">{job.company}</p>

                      <div className="flex gap-3 mt-1 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full">
                          {job.jobType || "Onsite"}
                        </span>
                      </div>

                      <p className="mt-2 text-gray-700 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex justify-between mt-3 text-sm text-gray-500">
                        <span>{getPostedTime(job.createdAt)}</span>
                        {job.deadline && (
                          <span>
                            Deadline: {dayjs(job.deadline).format("DD MMM YYYY")}
                          </span>
                        )}
                        {job.salary && (
                          <span className="font-semibold text-green-700">
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
