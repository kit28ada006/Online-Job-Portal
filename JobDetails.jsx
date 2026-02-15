import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  FaRegBookmark,
  FaBookmark,
  FaEnvelope,
  FaPhone,
  FaLink
} from "react-icons/fa";
import dayjs from "dayjs";

export default function JobDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    const fetchJob = async () => {
      if (!token) return;
      try {
        // Fetch main job details
        const resJob = await axios.get(`http://localhost:5000/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(resJob.data);

        // Fetch saved jobs to know if bookmarked
        const resSaved = await axios.get(
          "http://localhost:5000/api/user/saved-jobs",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaved(resSaved.data.some(j => j._id === id));

        // Fetch all jobs to find similar ones
        const allJobs = await axios.get("http://localhost:5000/api/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Strictly filter similar jobs by exact title (case-insensitive)
        const similar = allJobs.data.filter(j => {
          if (j._id === id) return false; // exclude current job
          return j.title.toLowerCase() === resJob.data.title.toLowerCase();
        });

        setSimilarJobs(similar);

      } catch (err) {
        console.error(err);
      }
    };

    fetchJob();
  }, [id, token]);

  const toggleSaveJob = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/user/save-job",
        { jobId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(prev => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  if (!job) return <p className="text-center mt-20">Loading...</p>;

  const getStars = (rating) => {
    const stars = [];
    for (let i = 0; i < Math.floor(rating); i++) stars.push("★");
    return stars;
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded-xl shadow relative">
      {/* Bookmark */}
      {token && (
        <div
          onClick={toggleSaveJob}
          className="absolute top-6 right-6 text-3xl text-blue-600 cursor-pointer"
        >
          {saved ? <FaBookmark /> : <FaRegBookmark />}
        </div>
      )}

      {/* Job Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        {job.companyLogo && (
          <img
            src={job.companyLogo.startsWith('/uploads') ? `http://localhost:5000${job.companyLogo}` : job.companyLogo}
            alt={job.company}
            className="w-24 h-24 object-contain rounded"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-gray-600 mt-1">
            {job.company} • {job.location}
          </p>
          {job.deadline && (
            <p className="text-gray-500 mt-1">
              Deadline: {dayjs(job.deadline).format("DD MMM YYYY")}
            </p>
          )}
          {job.companyRating && (
            <p className="mt-1 text-yellow-500 font-semibold">
              {getStars(job.companyRating).map((star, idx) => (
                <span key={idx} className="mr-1">
                  {star}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      {/* Job Type & Category */}
      <div className="flex gap-4 mb-6">
        {job.jobType && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {job.jobType}
          </span>
        )}
        {job.category && (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {job.category}
          </span>
        )}
      </div>

      {/* Job Description */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Job Description</h2>
        <p className="text-gray-700">{job.description}</p>
      </section>

      {/* Qualifications & Age Requirement */}
      <section className="mb-6">
        {job.qualification && <p><strong>Qualification:</strong> {job.qualification}</p>}
        {job.jobAgeRequirement && <p><strong>Age Requirement:</strong> {job.jobAgeRequirement}</p>}
      </section>

      {/* Company Details */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">About {job.company}</h2>
        {job.companyAbout && <p className="text-gray-700 mb-2">{job.companyAbout}</p>}

        <div className="space-y-1 text-gray-700">
          {job.companyEmail && <p className="flex items-center gap-2"><FaEnvelope /> {job.companyEmail}</p>}
          {job.companyPhone && <p className="flex items-center gap-2"><FaPhone /> {job.companyPhone}</p>}
          {job.companyWebsite && (
            <p className="flex items-center gap-2">
              <FaLink />{" "}
              <a href={job.companyWebsite} target="_blank" rel="noreferrer">{job.companyWebsite}</a>
            </p>
          )}
          {job.companyLinkedIn && (
            <p className="flex items-center gap-2">
              <FaLink />{" "}
              <a href={job.companyLinkedIn} target="_blank" rel="noreferrer">{job.companyLinkedIn}</a>
            </p>
          )}
        </div>
      </section>

      {/* Apply Button */}
      <button
        onClick={() => navigate(`/jobs/${id}/apply`)}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Apply for this Job
      </button>

      {/* SIMILAR JOBS */}
      {similarJobs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Similar Jobs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {similarJobs.map(sim => (
              <div
                key={sim._id}
                className="bg-gray-50 p-4 rounded-xl shadow hover:scale-[1.02] transition cursor-pointer"
                onClick={() => navigate(`/jobs/${sim._id}`)}
              >
                <h3 className="font-semibold text-lg">{sim.title}</h3>
                <p className="text-gray-600">{sim.company}</p>
                <p className="text-gray-500 text-sm">{sim.location}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}