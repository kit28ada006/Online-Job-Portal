import axios from "axios";

// Generate unique identifiers
const suffix = Math.floor(Math.random() * 100000);
const adminUser = {
    name: "Admin Test",
    username: `admin${suffix}`,
    email: `admin${suffix}@example.com`,
    password: "password123",
    role: "admin"
};

const normalUser = {
    name: "User Test",
    username: `user${suffix}`,
    email: `user${suffix}@example.com`,
    password: "password123",
    role: "user"
};

const testFlow = async () => {
    try {
        console.log("----- TESTING ADMIN FLOW -----");
        // 1. Register Admin
        console.log("Registering Admin...");
        await axios.post("http://localhost:5000/api/auth/register", adminUser);
        console.log("Admin Registration: SUCCESS");

        // 2. Login Admin
        console.log("Logging in Admin...");
        const adminLogin = await axios.post("http://localhost:5000/api/auth/login", {
            email: adminUser.email,
            password: adminUser.password
        });

        console.log("Admin Login Role received:", adminLogin.data.user.role);
        if (adminLogin.data.user.role === 'admin') {
            console.log("✅ Admin Role Verified");
        } else {
            console.error("❌ Failed: Expected role 'admin', got", adminLogin.data.user.role);
        }

        console.log("\n----- TESTING USER FLOW -----");
        // 3. Register User
        console.log("Registering User...");
        await axios.post("http://localhost:5000/api/auth/register", normalUser);
        console.log("User Registration: SUCCESS");

        // 4. Login User
        console.log("Logging in User...");
        const userLogin = await axios.post("http://localhost:5000/api/auth/login", {
            email: normalUser.email,
            password: normalUser.password
        });

        console.log("User Login Role received:", userLogin.data.user.role);
        if (userLogin.data.user.role === 'user') {
            console.log("✅ User Role Verified");
        } else {
            console.error("❌ Failed: Expected role 'user', got", userLogin.data.user.role);
        }

    } catch (err) {
        console.error("❌ Test Failed:", err.response ? err.response.data : err.message);
    }
};

testFlow();
