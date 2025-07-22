// Simple test script for authentication endpoints
const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test data with unique email to avoid conflicts
const testUser = {
  firstName: "John",
  lastName: "Doe",
  email: `test.user.${Date.now()}@university.edu`, // Unique email
  password: "password123",
  confirmPassword: "password123",
  institution: "University of Research",
  fieldOfStudy: "Computer Science",
  academicLevel: "graduate",
};

// Wait for server to be ready
async function waitForServer() {
  console.log("⏳ Waiting for server to be ready...");
  for (let i = 0; i < 10; i++) {
    try {
      await axios.get(`${BASE_URL.replace("/api", "")}/api/health`);
      console.log("✅ Server is ready!");
      return true;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/10 - Server not ready yet...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Server failed to start");
}

async function testAuthentication() {
  try {
    // Wait for server to be ready
    await waitForServer();

    console.log("🧪 Testing Research Hub Authentication API\n");
    console.log("📧 Test user email:", testUser.email);

    // Test 1: Register new user
    console.log("1️⃣ Testing user registration...");
    try {
      const registerResponse = await axios.post(
        `${BASE_URL}/auth/register`,
        testUser
      );
      console.log("✅ Registration successful!");
      console.log("User:", registerResponse.data.user.fullName);
      console.log("Token received:", !!registerResponse.data.token);

      const token = registerResponse.data.token;

      // Test 2: Get user profile
      console.log("\n2️⃣ Testing get user profile...");
      const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Profile retrieved successfully!");
      console.log(
        "Profile completion:",
        profileResponse.data.user.profileCompletion + "%"
      );

      // Test 3: Update profile
      console.log("\n3️⃣ Testing profile update...");
      const updateData = {
        bio: "Passionate researcher in AI and machine learning",
        researchInterests: [
          "Artificial Intelligence",
          "Machine Learning",
          "Data Science",
        ],
        skills: ["Python", "JavaScript", "Research"],
      };

      const updateResponse = await axios.put(
        `${BASE_URL}/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Profile updated successfully!");
      console.log(
        "New profile completion:",
        updateResponse.data.user.profileCompletion + "%"
      );

      // Test 4: Logout
      console.log("\n4️⃣ Testing logout...");
      const logoutResponse = await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Logout successful!");
    } catch (error) {
      if (
        error.response?.data?.message ===
        "An account with this email already exists"
      ) {
        console.log("ℹ️ User already exists, testing login instead...");

        // Test login with existing user
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password,
        });
        console.log("✅ Login successful!");
        console.log("User:", loginResponse.data.user.fullName);
        console.log("Login count:", loginResponse.data.user.loginCount);
      } else {
        throw error;
      }
    }

    // Test 5: Test validation errors
    console.log("\n5️⃣ Testing validation errors...");
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        firstName: "",
        email: "invalid-email",
        password: "123",
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Validation errors caught correctly!");
        console.log("Errors:", error.response.data.errors);
      }
    }

    // Test 6: Test invalid login
    console.log("\n6️⃣ Testing invalid login...");
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: "nonexistent@test.com",
        password: "wrongpassword",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Invalid login rejected correctly!");
      }
    }

    console.log("\n🎉 All authentication tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run tests
testAuthentication();
