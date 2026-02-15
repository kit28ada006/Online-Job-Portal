import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    companyWebsite: "",
    adminPosition: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register/admin",
        formData
      );

      setSuccess(res.data.message || "Admin registered successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Admin registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Admin Registration</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <input name="name" placeholder="Full Name" onChange={handleChange} required style={styles.input} />
        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
        <input name="companyName" placeholder="Company Name" onChange={handleChange} required style={styles.input} />
        <input name="companyWebsite" placeholder="Company Website" onChange={handleChange} required style={styles.input} />
        <input name="adminPosition" placeholder="Admin Position" onChange={handleChange} required style={styles.input} />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Registering Admin..." : "Register Admin"}
        </button>

        <p style={styles.text}>
          Already an Admin? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
  },
  title: { textAlign: "center", fontSize: "24px", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
  },
  error: { color: "#dc2626", textAlign: "center" },
  success: { color: "#16a34a", textAlign: "center" },
  text: { textAlign: "center", marginTop: "12px" },
};
