import axios from "axios";

// Helper to login as admin
const loginAdmin = async () => {
    try {
        // Assume the admin user from previous test exists or create a new one
        // For stability, let's create a fresh admin
        const suffix = Math.floor(Math.random() * 100000);
        const adminUser = {
            name: "Admin Stats Test",
            username: `adminstats${suffix}`,
            email: `adminstats${suffix}@example.com`,
            password: "password123",
            role: "admin"
        };

        await axios.post("http://localhost:5000/api/auth/register", adminUser);

        const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
            email: adminUser.email,
            password: adminUser.password
        });

        return loginRes.data.token;
    } catch (err) {
        console.error("Login/Register Admin Failed:", err.response?.data || err.message);
        return null;
    }
};

const testStats = async () => {
    console.log("--- Testing Admin Stats API ---");
    const token = await loginAdmin();
    if (!token) return;

    try {
        const res = await axios.get("http://localhost:5000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Stats Response:", res.data);

        if (typeof res.data.totalUsers === 'number' && typeof res.data.totalJobs === 'number') {
            console.log("✅ Stats API verification successful");
        } else {
            console.error("❌ Stats API returned unexpected format");
        }

    } catch (err) {
        console.error("❌ Failed to fetch stats:", err.response?.data || err.message);
    }
};

testStats();
