import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// States and cities (major states only, no UTs)
const statesAndCities = {
  "Andhra Pradesh": ["Vishakhapatnam", "Vijayawada", "Guntur"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
  "Kerala": ["Kochi", "Trivandrum", "Kozhikode"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Erode",
    "Tirunelveli",
    "Thoothukudi",
    "Vellore",
    "Thanjavur"
  ],

  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"]
};

// Salary ranges
const salaries = ["< ₹2L", "₹2L-₹5L", "₹5L-₹10L", "₹10L-₹20L", "> ₹20L"];
const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Gujarati", "Bengali", "Marathi"];

export default function Profile() {
  const { token, user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    state: "",
    city: "",
    expectedSalary: "",
    experience: "",
    jobRole: "",
    education: "",
    about: "",
    skillsInput: "",
    skills: [],
    languages: [],
    linkedin: "",
    github: "",
    portfolio: "",
    certifications: [],
    // Admin specific fields
    companyName: "",
    designation: "",
    website: ""
  });

  const [cities, setCities] = useState([]);
  const [showLanguages, setShowLanguages] = useState(false);
  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        contact: user.contact || "",
        state: user.state || "",
        city: user.city || "",
        expectedSalary: user.expectedSalary || "",
        experience: user.experience || "",
        jobRole: user.jobRole || "",
        education: user.education || "",
        about: user.about || "",
        skillsInput: user.skills?.join(", ") || "",
        skills: user.skills || [],
        languages: user.languages || [],
        linkedin: user.linkedin || "",
        github: user.github || "",
        portfolio: user.portfolio || "",
        certifications: user.certifications || [],
        companyName: user.companyName || "",
        designation: user.designation || "",
        website: user.website || ""
      });
      if (user.state) setCities(statesAndCities[user.state] || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "state") {
      setCities(statesAndCities[value] || []);
      setFormData(prev => ({ ...prev, city: "" }));
    }
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedSkills = formData.skillsInput.split(",").map(s => s.trim()).filter(Boolean);
    const dataToSend = { ...formData, skills: updatedSkills };

    try {
      const res = await axios.put(
        "http://localhost:5000/api/user/update",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // DIAGNOSTIC ALERT
      alert(`Backend Received: \nContact: ${res.data.received?.contact || "N/A"}\nWebsite: ${res.data.received?.website || "N/A"}`);

      login(token, res.data.user);
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Info */}
        <div>
          <label className="font-semibold">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Enter your full name" required />
        </div>
        <div>
          <label className="font-semibold">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Enter your email" required />
        </div>
        <div>
          <label className="font-semibold">Contact Number</label>
          <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Enter your contact number" />
        </div>

        {/* Location Section (Common) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">State</label>
            <select name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border rounded mt-1" required>
              <option value="">Select State</option>
              {Object.keys(statesAndCities).map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <div>
            <label className="font-semibold">City</label>
            <select name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded mt-1" required disabled={!formData.state}>
              <option value="">{formData.state ? "Select City" : "Select State first"}</option>
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        {/* --- CONDITIONAL FIELDS BASED ON ROLE --- */}

        {user?.role === "admin" ? (
          <>
            {/* ADMIN SPECIFIC FIELDS */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <label className="font-semibold text-blue-700">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2 border rounded mt-1 border-blue-200" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="font-semibold text-blue-700">Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full p-2 border rounded mt-1 border-blue-200" placeholder="e.g. HR Manager" />
              </div>
            </div>
            <div>
              <label className="font-semibold text-blue-700">Company Website</label>
              <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full p-2 border rounded mt-1 border-blue-200" placeholder="https://company.com" />
            </div>
          </>
        ) : (
          <>
            {/* USER SPECIFIC FIELDS */}
            <div className="pt-4 border-t">
              <label className="font-semibold text-green-700">Expected Salary</label>
              <select name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} className="w-full p-2 border rounded mt-1 border-green-100">
                <option value="">Select Salary</option>
                {salaries.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Experience (years)</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Enter total years of experience" />
              </div>
              <div>
                <label className="font-semibold">Job Role</label>
                <input type="text" name="jobRole" value={formData.jobRole} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Enter desired job role" />
              </div>
            </div>
            <div>
              <label className="font-semibold">Highest Education</label>
              <input type="text" name="education" value={formData.education} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="e.g. Bachelor’s in CS" />
            </div>

            {/* Skills */}
            <div>
              <label className="font-semibold text-green-700">Skills</label>
              <input type="text" name="skillsInput" value={formData.skillsInput} onChange={handleChange} className="w-full p-2 border rounded mt-1 border-green-100" placeholder="Enter skills separated by commas" />
            </div>

            {/* Languages */}
            <div>
              <label className="font-semibold">Languages</label>
              <div className="w-full p-2 border rounded mt-1 cursor-pointer" onClick={() => setShowLanguages(prev => !prev)}>
                {formData.languages.length > 0 ? formData.languages.join(", ") : "Select languages"}
              </div>
              {showLanguages && (
                <div className="mt-2 grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                  {languageOptions.map(lang => (
                    <label key={lang} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.languages.includes(lang)} onChange={() => toggleLanguage(lang)} /> {lang}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* About */}
        <div>
          <label className="font-semibold">About</label>
          <textarea name="about" value={formData.about} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="Tell more about yourself, your career goals, and achievements." />
        </div>

        {/* Social Links */}
        <div>
          <label className="font-semibold">LinkedIn</label>
          <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="https://linkedin.com/in/username" />
        </div>

        {user?.role !== "admin" && (
          <>
            <div>
              <label className="font-semibold">GitHub</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="font-semibold">Portfolio</label>
              <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full p-2 border rounded mt-1" placeholder="https://yourportfolio.com" />
            </div>
          </>
        )}

        {/* Certifications / Achievements (Candidates Only) */}
        {user?.role !== "admin" && (
          <div>
            <label className="font-semibold">Certifications / Achievements</label>
            <div className="flex gap-2 mt-2">
              <input type="text" value={newCertification} onChange={(e) => setNewCertification(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Enter achievement" />
              <button type="button" onClick={addCertification} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-2">
                  {cert} <button type="button" onClick={() => removeCertification(idx)} className="text-red-500 font-bold">x</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">Update Profile</button>
      </form>
    </div>
  );
}