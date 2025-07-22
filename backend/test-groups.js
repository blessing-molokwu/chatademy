// Simple test script for groups API
const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test user data
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `test.groups.${Date.now()}@university.edu`,
  password: "password123",
  confirmPassword: "password123",
  institution: "Test University",
  fieldOfStudy: "Computer Science",
  academicLevel: "graduate",
};

let authToken = "";

async function testGroupsAPI() {
  try {
    console.log("🧪 Testing Research Hub Groups API\n");

    // Step 1: Register test user and get auth token
    console.log("1️⃣ Registering test user...");
    console.log("Test email:", testUser.email);

    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      testUser
    );

    if (registerResponse.data.success) {
      authToken = registerResponse.data.token;
      console.log("✅ Registration successful!");
      console.log("User:", registerResponse.data.user.fullName);
    } else {
      throw new Error("Registration failed");
    }

    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Step 2: Create a test group
    console.log("\n2️⃣ Creating a test group...");
    const groupData = {
      name: "AI Research Group",
      description:
        "A group focused on artificial intelligence and machine learning research",
      fieldOfStudy: "Computer Science",
      isPublic: true,
    };

    const createResponse = await authAxios.post("/groups", groupData);
    console.log("✅ Group created successfully!");
    console.log("Group ID:", createResponse.data.group._id);
    console.log("Group Name:", createResponse.data.group.name);
    console.log("Members:", createResponse.data.group.memberCount);

    const groupId = createResponse.data.group._id;

    // Step 3: Get all public groups
    console.log("\n3️⃣ Getting all public groups...");
    const groupsResponse = await authAxios.get("/groups");
    console.log("✅ Groups retrieved successfully!");
    console.log("Total groups found:", groupsResponse.data.groups.length);
    console.log("Pagination:", groupsResponse.data.pagination);

    // Step 4: Get user's groups
    console.log("\n4️⃣ Getting user's groups...");
    const myGroupsResponse = await authAxios.get("/groups/my-groups");
    console.log("✅ User groups retrieved successfully!");
    console.log("User's groups count:", myGroupsResponse.data.groups.length);

    // Step 5: Get single group details
    console.log("\n5️⃣ Getting group details...");
    const groupResponse = await authAxios.get(`/groups/${groupId}`);
    console.log("✅ Group details retrieved successfully!");
    console.log("Group:", groupResponse.data.group.name);
    console.log(
      "Owner:",
      groupResponse.data.group.owner.firstName,
      groupResponse.data.group.owner.lastName
    );
    console.log("Members:", groupResponse.data.group.members.length);

    // Step 6: Update group
    console.log("\n6️⃣ Updating group...");
    const updateData = {
      name: "Advanced AI Research Group",
      description:
        "An advanced group focused on cutting-edge AI research and applications",
      fieldOfStudy: "Computer Science",
    };

    const updateResponse = await authAxios.put(
      `/groups/${groupId}`,
      updateData
    );
    console.log("✅ Group updated successfully!");
    console.log("New name:", updateResponse.data.group.name);

    // Step 7: Test search functionality
    console.log("\n7️⃣ Testing search functionality...");
    const searchResponse = await authAxios.get("/groups?search=AI&limit=5");
    console.log("✅ Search completed successfully!");
    console.log("Search results:", searchResponse.data.groups.length);

    // Step 8: Test validation errors
    console.log("\n8️⃣ Testing validation errors...");
    try {
      await authAxios.post("/groups", {
        name: "", // Empty name should fail
        description: "Test description",
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Validation errors caught correctly!");
        console.log("Errors:", error.response.data.errors);
      }
    }

    // Step 9: Clean up - delete the test group
    console.log("\n9️⃣ Cleaning up - deleting test group...");
    const deleteResponse = await authAxios.delete(`/groups/${groupId}`);
    console.log("✅ Group deleted successfully!");

    console.log("\n🎉 All Groups API tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log(
        "💡 Make sure to update the test credentials with your actual login details"
      );
    }
  }
}

// Run tests
testGroupsAPI();
