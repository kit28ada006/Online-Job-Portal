import axios from "axios";

const API_URL = "http://localhost:5000/api";

const registerAndLogin = async (name, email, role = "admin") => {
    try {
        const username = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const res = await axios.post(`${API_URL}/auth/register`, {
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
        console.error(`Failed to register/login ${email}:`, err.message);
        if (err.response) {
            console.error("Data:", err.response.data);
        }
        return null;
    }
};

const runTest = async () => {
    console.log(`🚀 Starting Multi-Admin Test (Using ${API_URL})...`);

    // 1. Create Admin A
    const adminA = await registerAndLogin("Admin A", `admin_a_${Date.now()}@test.com`);
    if (!adminA) return;
    console.log("✅ Admin A created");

    // 2. Create Admin B
    const adminB = await registerAndLogin("Admin B", `admin_b_${Date.now()}@test.com`);
    if (!adminB) return;
    console.log("✅ Admin B created");

    // 3. Admin A posts a job
    let jobA;
    try {
        const res = await axios.post(`${API_URL}/jobs/`, {
            title: "Job by Admin A",
            company: "Company A",
            location: "Remote",
            description: "Description A",
            category: "Development",
            deadline: new Date(Date.now() + 86400000)
        }, { headers: { Authorization: `Bearer ${adminA.token}` } });
        jobA = res.data.job;
        console.log("✅ Admin A posted a job");
    } catch (err) {
        console.error("❌ Admin A failed to post job:", err.message);
        return;
    }

    // 4. Create User U and apply for Job A
    const userU = await registerAndLogin("User U", `user_u_${Date.now()}@test.com`, "user");
    if (!userU) return;
    console.log("✅ User U created");

    let applicationA;
    try {
        const res = await axios.post(`${API_URL}/user/apply-job`, {
            jobId: jobA._id,
            fullName: "User U",
            email: userU.user.email,
            phone: "1234567890",
            resume: "resume.pdf",
            experience: "2 years",
            skills: "JS, Node"
        }, { headers: { Authorization: `Bearer ${userU.token}` } });
        applicationA = res.data.application;
        console.log("✅ User U applied for Admin A's job");
    } catch (err) {
        console.error("❌ User U failed to apply:", err.message);
        return;
    }

    // 5. Verify Admin A can see Application A
    try {
        const res = await axios.get(`${API_URL}/admin/applications`, {
            headers: { Authorization: `Bearer ${adminA.token}` }
        });
        const found = res.data.some(app => app._id === applicationA._id);
        if (found) {
            console.log("✅ Admin A can see the application (Correct)");
        } else {
            console.error("❌ Admin A cannot see the application (Error)");
        }
    } catch (err) {
        console.error("❌ Admin A failed to fetch applications:", err.message);
    }

    // 6. Verify Admin B CANNOT see Application A
    try {
        const res = await axios.get(`${API_URL}/admin/applications`, {
            headers: { Authorization: `Bearer ${adminB.token}` }
        });
        const found = res.data.some(app => app._id === applicationA._id);
        if (!found) {
            console.log("✅ Admin B cannot see Admin A's application (Correct)");
        } else {
            console.error("❌ Admin B can see Admin A's application (Violation!)");
        }
    } catch (err) {
        console.error("❌ Admin B failed to fetch applications:", err.message);
    }

    // 7. Verify Admin B CANNOT update status of Application A
    try {
        await axios.put(`${API_URL}/admin/applications/${applicationA._id}/status`, {
            status: "Shortlisted"
        }, { headers: { Authorization: `Bearer ${adminB.token}` } });
        console.error("❌ Admin B successfully updated Admin A's application (Violation!)");
    } catch (err) {
        if (err.response?.status === 403) {
            console.log("✅ Admin B blocked from updating Admin A's application (Correct - 403 Forbidden)");
        } else {
            console.error("❌ Unexpected error on Admin B update attempt:", err.response?.status, err.message);
        }
    }

    // 8. Verify Stats are Global
    try {
        const resA = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminA.token}` }
        });
        const resB = await axios.get(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminB.token}` }
        });

        console.log("Stats A:", resA.data);
        console.log("Stats B:", resB.data);

        if (resA.data.totalJobs === resB.data.totalJobs && resA.data.totalApplications === resB.data.totalApplications) {
            console.log("✅ Dashboard stats are global (Correct)");
        } else {
            console.error("❌ Dashboard stats differ between admins (Error)");
        }
    } catch (err) {
        console.error("❌ Failed to fetch stats:", err.message);
    }

    console.log("🏁 Test completed.");
};

runTest();
