const mongoose = require("mongoose");
const Group = require("../models/Group");
const User = require("../models/User");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const fixGroupOwnership = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all groups where owner is not in members array
    const groups = await Group.find({}).populate(
      "owner",
      "firstName lastName email"
    );

    let fixedCount = 0;

    for (const group of groups) {
      const isOwnerMember = group.isMember(group.owner._id);

      if (!isOwnerMember) {
        console.log(
          `🔧 Fixing group: ${group.name} (Owner: ${group.owner.email})`
        );

        // Add owner as first member
        group.members.unshift({
          user: group.owner._id,
          joinedAt: group.createdAt || new Date(),
        });

        await group.save();
        fixedCount++;
      } else {
        console.log(`✅ Group OK: ${group.name} (Owner: ${group.owner.email})`);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} groups`);
    console.log(`✅ Total groups checked: ${groups.length}`);
  } catch (error) {
    console.error("❌ Error fixing groups:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
};

// Run the fix
fixGroupOwnership();
