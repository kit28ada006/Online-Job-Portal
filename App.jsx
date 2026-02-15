import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Navbar from "./components/Navbar.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Jobs from "./pages/Jobs.jsx";
import RecommendedJobs from "./pages/RecommendedJobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";      // Edit profile page
import MyProfile from "./pages/MyProfile.jsx";  // View profile page
import AppliedJobs from "./pages/AppliedJobs.jsx";
import SavedJobs from "./pages/SavedJobs.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Import AdminDashboard
import JobApplicationForm from "./pages/JobApplicationForm.jsx"; // Import JobApplicationForm
import ChangePassword from "./pages/ChangePassword.jsx";

import { AuthContext } from "./context/AuthContext.jsx";

export default function App() {
  const { token } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/jobs" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/jobs" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/jobs"
          element={token ? <Jobs /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/jobs/:id"
          element={token ? <JobDetails /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/jobs/:id/apply"
          element={token ? <JobApplicationForm /> : <Navigate to="/login" replace />}
        />

        {/* Profile Pages */}
        <Route
          path="/my-profile"
          element={token ? <MyProfile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile/edit"
          element={token ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/change-password"
          element={token ? <ChangePassword /> : <Navigate to="/login" replace />}
        />

        {/* Jobs-related pages */}
        <Route
          path="/recommended-jobs"
          element={token ? <RecommendedJobs /> : <Navigate to="/login" />}
        />
        <Route
          path="/applied-jobs"
          element={token ? <AppliedJobs /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/saved-jobs"
          element={token ? <SavedJobs /> : <Navigate to="/login" replace />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={token ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}  