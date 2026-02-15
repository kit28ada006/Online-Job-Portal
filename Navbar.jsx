import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="bg-white text-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-blue-700 hover:text-blue-800"
      >
        JobPortal
      </Link>

      {/* Right Section */}
      {token ? (
        <div className="relative">
          {/* Profile Icon */}
          <div
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold cursor-pointer hover:ring-2 hover:ring-blue-300"
          >
            {firstLetter}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-lg shadow-lg border z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Admin Dashboard */}
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/admin/dashboard");
                  }}
                  className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border-b"
                >
                  Admin Dashboard ⚙️
                </button>
              )}

              {/* Account Management (Common for all but labels differ) */}
              <div className="py-1">
                <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase">Account</p>

                {/* View Profile / Admin Details */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/my-profile");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>👤</span> {user?.role === "admin" ? "View Admin Details" : "View Profile"}
                </button>

                {/* Edit Profile */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile/edit");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>📝</span> Edit Profile
                </button>

                {/* Change Password */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/change-password");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>🔐</span> Change Password
                </button>
              </div>

              {/* General Actions */}
              <div className="py-1 border-t">
                <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase">General</p>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/jobs");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>💼</span> View Jobs
                </button>

                {user?.role !== "admin" && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/saved-jobs");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>⭐</span> Saved Jobs
                  </button>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}