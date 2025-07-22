// Simple test script for dashboard functionality
const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test user credentials (you can modify these)
const testUser = {
  email: "test@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User",
  confirmPassword: "password123",
  institution: "Test University",
  fieldOfStudy: "Computer Science",
  academicLevel: "graduate",
};

async function testDashboard() {
  try {
    console.log("🧪 Testing Dashboard Functionality\n");

    let token;

    // Try to login first
    console.log("1️⃣ Attempting login...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });
      token = loginResponse.data.token;
      console.log("✅ Login successful!");
      console.log("User:", loginResponse.data.user.fullName);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("ℹ️ User doesn't exist, creating new user...");
        
        // Register new user
        const registerResponse = await axios.post(
          `${BASE_URL}/auth/register`,
          testUser
        );
        token = registerResponse.data.token;
        console.log("✅ Registration successful!");
        console.log("User:", registerResponse.data.user.fullName);
      } else {
        throw error;
      }
    }

    // Test dashboard endpoints
    console.log("\n2️⃣ Testing dashboard stats...");
    try {
      const statsResponse = await axios.get(`${BASE_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ My groups endpoint working!");
      console.log("Groups found:", statsResponse.data.groups?.length || 0);
    } catch (error) {
      console.log("❌ Dashboard stats failed:", error.response?.data?.message || error.message);
    }

    // Test creating a group for dashboard data
    console.log("\n3️⃣ Creating test group...");
    try {
      const groupData = {
        name: "Test Research Group",
        description: "A test group for dashboard functionality",
        fieldOfStudy: "Computer Science",
        isPublic: true,
      };

      const groupResponse = await axios.post(`${BASE_URL}/groups`, groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Test group created!");
      console.log("Group ID:", groupResponse.data.group._id);

      const groupId = groupResponse.data.group._id;

      // Test getting group details
      console.log("\n4️⃣ Testing group details...");
      const groupDetailResponse = await axios.get(`${BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Group details retrieved!");
      console.log("Group name:", groupDetailResponse.data.group.name);

      // Test dashboard stats again
      console.log("\n5️⃣ Testing dashboard stats with data...");
      const finalStatsResponse = await axios.get(`${BASE_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Dashboard stats with group data!");
      console.log("Groups found:", finalStatsResponse.data.groups?.length || 0);

    } catch (error) {
      console.log("❌ Group creation failed:", error.response?.data?.message || error.message);
    }

    console.log("\n🎉 Dashboard test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run test
testDashboard();
