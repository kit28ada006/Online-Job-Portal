import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { FaEdit, FaMapMarkerAlt, FaGraduationCap, FaClock, FaBook, FaEnvelope, FaPhone, FaLink } from "react-icons/fa";

export default function MyProfile() {
  const { user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);

  // Fetch saved jobs dynamically
  const fetchSavedJobs = async () => {
    try {
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/user/saved-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err);
    }
  };

  // Fetch full user data to ensure fresh state
  const fetchUserData = async () => {
    try {
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data); // Update context with fresh DB data
      localStorage.setItem("user", JSON.stringify(res.data)); // Sync with LS
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchSavedJobs();
    }
  }, [token]);

  if (!user) return <p className="text-center mt-20">No user data available.</p>;

  // Profile completeness (Candidates only)
  const fields = ["name", "email", "contact", "state", "city", "expectedSalary", "experience", "jobRole", "education", "about", "skills", "languages"];
  const filledFields = fields.filter(f => {
    if (Array.isArray(user[f])) return user[f].length > 0;
    return user[f];
  });
  const profileCompleteness = Math.round((filledFields.length / fields.length) * 100);

  return (
    <div className="max-w-6xl mx-auto my-12 p-6 bg-gray-50 rounded-xl shadow-lg space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-blue-700 text-white rounded-full flex items-center justify-center text-5xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600 font-medium">
              {user.role === "admin"
                ? `${user.designation || "Administrator"} ${user.companyName ? `at ${user.companyName}` : ""}`
                : (user.jobRole || "Job Seeker")}
            </p>
            <p className="text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt /> {user.city || "City"}, {user.state || "State"}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => navigate("/profile/edit")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <FaEdit /> Edit Profile
          </button>

          {user.role === "admin" ? (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 shadow-sm transition-all"
            >
              ⚙️ Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/saved-jobs")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <FaBook /> Saved Jobs ({savedJobs.length})
            </button>
          )}
        </div>
      </div>

      {/* Conditionally reveal sections based on role */}
      {user.role !== "admin" ? (
        <>
          {/* USER VIEW (Original layout) */}
          {/* Profile Stats (Candidates) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg text-center">
              <p className="text-gray-500 text-sm italic">Profile Completeness</p>
              <p className="text-2xl font-bold text-blue-600">{profileCompleteness}%</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg text-center">
              <p className="text-gray-500 text-sm italic">Saved Jobs</p>
              <p className="text-2xl font-bold text-green-600">{savedJobs.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg text-center">
              <p className="text-gray-500 text-sm italic">Applied Jobs</p>
              <p className="text-2xl font-bold text-purple-600">{user.appliedJobs?.length || 0}</p>
            </div>
          </div>

          {/* About */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
            <h2 className="font-semibold text-gray-700 text-xl mb-3 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span> About Me
            </h2>
            <p className="text-gray-600 leading-relaxed">{user.about || "No professional summary provided."}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
              <h2 className="font-semibold text-gray-700 text-xl mb-3 flex items-center gap-2">
                <FaClock className="text-blue-500" /> Experience
              </h2>
              {user.experience ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="font-semibold text-blue-800">{user.jobRole || "Job Role"}</p>
                  <p className="text-blue-600">{user.experience} years of professional experience</p>
                </div>
              ) : <p className="text-gray-500 italic text-sm">No experience added yet</p>}
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
              <h2 className="font-semibold text-gray-700 text-xl mb-3 flex items-center gap-2">
                <FaGraduationCap className="text-blue-500" /> Education
              </h2>
              {user.education ? (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="font-semibold text-green-800">{user.education}</p>
                </div>
              ) : <p className="text-gray-500 italic text-sm">No education details added</p>}
            </div>
          </div>

          {/* Skills & Portfolio */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
            <h2 className="font-semibold text-gray-700 text-xl mb-3 flex items-center gap-2">
              <FaBook className="text-blue-500" /> Skills & Languages
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Technical Skills</p>
                <div className="flex flex-wrap gap-2">
                  {user.skills?.length > 0 ? user.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                  )) : <span className="text-gray-400 text-sm">None added</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Languages Known</p>
                <div className="flex flex-wrap gap-2">
                  {user.languages?.length > 0 ? user.languages.map((lang, idx) => (
                    <span key={idx} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{lang}</span>
                  )) : <span className="text-gray-400 text-sm">None added</span>}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* PROFESSIONAL ADMIN VIEW */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg ring-4 ring-blue-50">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                <p className="text-blue-600 font-medium text-sm mb-4">{user.designation || "Executive Administrator"}</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Manage Account
                  </button>
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold transition border border-gray-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>

              {/* Business Stats */}
              <div className="bg-slate-800 p-6 rounded-2xl text-white shadow-xl">
                <h4 className="text-sm font-bold opacity-60 uppercase mb-4 tracking-wider">Business Impact</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs opacity-70">Admin Access Verified</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.email.split("@")[0].length}+</p>
                    <p className="text-xs opacity-70">System Interactions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Business Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">💼</span> Organizational Credentials
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Organization Name</p>
                    <p className="text-lg font-bold text-slate-800">{user.companyName || "Corporate Partner"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Official Designation</p>
                    <p className="text-lg font-bold text-slate-800">{user.designation || "Lead Administrator"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Verification Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      Active Administrator
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Official Website</p>
                    {user.website ? (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold text-sm">
                        Visit Site <FaLink size={12} />
                      </a>
                    ) : <p className="text-gray-400 italic text-sm">No URL linked</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">📄</span> Professional Summary
                </h2>
                <p className="text-gray-600 leading-relaxed text-base italic border-l-4 border-indigo-200 pl-6 py-2">
                  {user.about || "No administrative profile summary has been provided yet. Use the edit profile section to add your business background."}
                </p>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600"><FaEnvelope /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Email Address</p>
                    <p className="text-sm font-bold text-gray-700">{user.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-green-600"><FaPhone /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black">Contact Line</p>
                    <p className="text-sm font-bold text-gray-700">{user.contact || "Pending Update"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {user.role === "user" && (
        <>
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition grid md:grid-cols-2 gap-6 border border-gray-100">
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <FaEnvelope className="text-blue-500" /> {user.email}
            </div>
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <FaPhone className="text-green-500" /> {user.contact || "Not provided"}
            </div>
          </div>

          {/* Recent Saved Jobs (Candidates only) */}
          {savedJobs.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
              <h2 className="font-semibold text-gray-700 text-xl mb-4 flex items-center gap-2">
                <FaBook className="text-blue-500" /> Recent Saved Jobs
              </h2>
              <ul className="space-y-3">
                {savedJobs.slice(-5).reverse().map((job, idx) => (
                  <li
                    key={idx}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="cursor-pointer bg-gray-50 hover:bg-blue-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center transition group"
                  >
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-700">{job.title}</p>
                      <p className="text-sm text-gray-500 font-medium">{job.company}</p>
                    </div>
                    <span className="text-blue-500 font-black">→</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements / Certificates Placeholder (Candidates Only) */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
            <h2 className="font-semibold text-gray-700 text-xl mb-3 flex items-center gap-2">
              <span className="text-blue-500">🏆</span> Achievements & Certificates
            </h2>
            <p className="text-gray-600">Add your professional achievements or certifications to make your profile stronger.</p>
          </div>
        </>
      )}
    </div>
  );
}