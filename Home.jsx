import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Home() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')",
      }}
    >
      <div className="min-h-screen bg-black/60 flex flex-col justify-center items-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center mb-6">
          Find Your <span className="text-blue-400">Dream Job</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mb-10">
          Discover opportunities from top companies and build your career.
        </p>

        {!token ? (
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-white rounded-full text-lg"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-white/20 border border-white px-8 py-3 text-white rounded-full text-lg"
            >
              Create Account
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 hover:bg-blue-700 px-10 py-4 text-white rounded-full text-lg"
          >
            Browse Jobs
          </button>
        )}
      </div>
    </div>
  );
}