import axios from "axios";

// Generate a random username to avoid conflicts
const randomSuffix = Math.floor(Math.random() * 10000);
const testUser = {
    name: "Test User",
    username: `testuser${randomSuffix}`,
    email: `test${randomSuffix}@example.com`,
    password: "password123",
    role: "user"
};

const testRegistration = async () => {
    try {
        console.log("Attempting to register:", testUser);
        const response = await axios.post("http://localhost:5000/api/auth/register", testUser);
        console.log("Registration Response:", response.status, response.data);
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error("Server is not running. Please start the server on port 5000.");
            return;
        }
        console.error("Registration Error:", err.response ? err.response.data : err.message);
    }
};

testRegistration();
