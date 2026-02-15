import axios from "axios";

async function testApply() {
    const token = "YOUR_TOKEN_HERE"; // Need a valid token
    const jobId = "696bad119def76fcc8977d63"; // From screenshot

    try {
        const res = await axios.post("http://localhost:5000/api/user/apply-job", {
            jobId,
            fullName: "Test User",
            email: "test@example.com",
            phone: "1234567890",
            experience: "Test experience",
            skills: "React",
            coverLetter: "Test cover letter",
            resume: ""
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}

// I can't really run this without a token.
// Let me instead check the backend code for potential runtime errors.
