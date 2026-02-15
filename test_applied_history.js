import axios from "axios";

const API_URL = "http://localhost:5002/api";

const registerAndLogin = async (name, email, role = "user") => {
    try {
        const username = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await axios.post(`${API_URL}/auth/register`, {
            name,
            username,
            email,
            password: "password123",
            role
        });
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: "password123"
        });
        return { token: loginRes.data.token, user: loginRes.data.user };
    } catch (err) {
        console.error(`Failed to register/login ${email}:`, err.response?.data || err.message);
        return null;
    }
};

const runTest = async () => {
    console.log(`🚀 Starting Applied Jobs History Verification (Using ${API_URL})...`);

    // 1. Create Admin
    const admin = await registerAndLogin("Test Admin", `admin_${Date.now()}@test.com`, "admin");
    if (!admin) return;

    // 2. Admin posts a job
    let job;
    try {
        const res = await axios.post(`${API_URL}/jobs/`, {
            title: "Frontend Developer",
            company: "Tech Corp",
            location: "San Francisco",
            description: "Build awesome UIs",
            category: "Development",
            deadline: new Date(Date.now() + 86400000)
        }, { headers: { Authorization: `Bearer ${admin.token}` } });
        job = res.data.job;
    } catch (err) {
        console.error("❌ Admin failed to post job:", err.response?.data || err.message);
        return;
    }

    // 3. Create User and Apply
    const user = await registerAndLogin("Test User", `user_${Date.now()}@test.com`, "user");
    if (!user) return;

    try {
        await axios.post(`${API_URL}/user/apply-job`, {
            jobId: job._id,
            fullName: "Test User",
            email: user.user.email,
            phone: "1234567890",
            resume: "resume.pdf"
        }, { headers: { Authorization: `Bearer ${user.token}` } });
    } catch (err) {
        console.error("❌ User failed to apply:", err.response?.data || err.message);
        return;
    }

    // 4. Verify User History
    try {
        const res = await axios.get(`${API_URL}/user/applied-jobs`, {
            headers: { Authorization: `Bearer ${user.token}` }
        });

        const application = res.data.find(app => (app.jobId?._id || app.jobId) === job._id);
        if (application) {
            console.log("✅ User history entry found. Status:", application.status);
        } else {
            console.error("❌ Application not found in history.");
            return;
        }

        // 5. Admin Updates Status
        await axios.put(`${API_URL}/admin/applications/${application._id}/status`, {
            status: "Under Review"
        }, { headers: { Authorization: `Bearer ${admin.token}` } });
        console.log("✅ Admin updated status to 'Under Review'");

        // 6. Verify Update
        const resUpdate = await axios.get(`${API_URL}/user/applied-jobs`, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        const updatedApp = resUpdate.data.find(app => app._id === application._id);
        if (updatedApp && updatedApp.status === "Under Review") {
            console.log("✅ User history shows 'Under Review' status (Correct)");
        } else {
            console.error("❌ User history not updated accurately:", updatedApp?.status);
        }
    } catch (err) {
        console.error("❌ Error during history verification:", err.response?.data || err.message);
    }

    console.log("🏁 Verification completed.");
};

runTest();
