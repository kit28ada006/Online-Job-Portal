import axios from "axios";

// Generate unique identifiers
const suffix = Math.floor(Math.random() * 100000);
const adminUser = {
    name: "Admin Verify",
    username: `admin_v_${suffix}`,
    email: `admin_v_${suffix}@example.com`,
    password: "password123",
    role: "admin"
};

const normalUser = {
    name: "User Verify",
    username: `user_v_${suffix}`,
    email: `user_v_${suffix}@example.com`,
    password: "password123",
    role: "user"
};

const verify = async () => {
    try {
        console.log("----- VERIFYING ADMIN FIX -----");

        // 1. Register Admin
        console.log("Registering Admin...");
        const adminReg = await axios.post("http://localhost:5002/api/auth/register", adminUser);
        console.log("Admin Registration:", adminReg.status === 201 ? "SUCCESS" : "FAILED");

        // 2. Register User
        console.log("Registering User...");
        const userReg = await axios.post("http://localhost:5002/api/auth/register", normalUser);
        console.log("User Registration:", userReg.status === 201 ? "SUCCESS" : "FAILED");

        // 3. Login Admin
        console.log("Logging in Admin...");
        const adminLogin = await axios.post("http://localhost:5002/api/auth/login", {
            email: adminUser.email,
            password: adminUser.password
        });
        const token = adminLogin.data.token;
        console.log("Admin Login: SUCCESS");

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 4. Check Stats
        console.log("Fetching Stats...");
        const stats = await axios.get("http://localhost:5002/api/admin/stats", config);
        console.log("Stats:", stats.data);

        // We can't know exact total users easily without clearing DB, but we can check logic
        // But we can check if it returns.

        // 5. Check Admins Endpoint
        console.log("Fetching Admins...");
        const admins = await axios.get("http://localhost:5002/api/admin/admins", config);
        console.log(`Admins Found: ${admins.data.length}`);

        const myAdmin = admins.data.find(u => u.email === adminUser.email);
        if (myAdmin) {
            console.log("✅ Current Admin found in /admins");
        } else {
            console.error("❌ Current Admin NOT found in /admins");
        }

        // 6. Check Users Endpoint
        console.log("Fetching Users...");
        const users = await axios.get("http://localhost:5002/api/admin/users", config);
        console.log(`Users Found: ${users.data.length}`);

        const myUser = users.data.find(u => u.email === normalUser.email);
        if (myUser) {
            console.log("✅ Current User found in /users");
        } else {
            console.error("❌ Current User NOT found in /users");
        }

        const adminInUsers = users.data.find(u => u.email === adminUser.email);
        if (!adminInUsers) {
            console.log("✅ Admin NOT found in /users (Correct behavior)");
        } else {
            console.error("❌ Admin FOUND in /users (Incorrect behavior)");
        }

    } catch (err) {
        console.error("❌ Verification Failed:", err.response ? err.response.data : err.message);
        if (err.code === "ECONNREFUSED") {
            console.log("⚠️ Make sure the server is running on port 5000!");
        }
    }
};

verify();
