// Helper utility to create test data for demonstration
import groupService from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

export const createTestData = async () => {
  try {
    console.log('Creating test data for dashboard...');
    
    // Create sample groups
    const testGroups = [
      {
        name: "AI Research Lab",
        description: "Exploring cutting-edge artificial intelligence research and applications",
        fieldOfStudy: "Computer Science",
        isPublic: true
      },
      {
        name: "Data Science Hub",
        description: "Collaborative space for data analysis and machine learning projects",
        fieldOfStudy: "Data Science",
        isPublic: true
      },
      {
        name: "Quantum Computing Group",
        description: "Research group focused on quantum algorithms and quantum computing",
        fieldOfStudy: "Physics",
        isPublic: false
      }
    ];

    const createdGroups = [];
    
    for (const groupData of testGroups) {
      try {
        const result = await groupService.createGroup(groupData);
        if (result.success) {
          createdGroups.push(result.group);
          console.log(`✅ Created group: ${groupData.name}`);
        }
      } catch (error) {
        console.log(`⚠️ Group ${groupData.name} might already exist`);
      }
    }

    return {
      success: true,
      message: `Created ${createdGroups.length} test groups`,
      groups: createdGroups
    };
    
  } catch (error) {
    console.error('Error creating test data:', error);
    return {
      success: false,
      message: 'Failed to create test data'
    };
  }
};

// Quick setup function for demo purposes
export const setupDemoData = async () => {
  const result = await createTestData();
  if (result.success) {
    console.log('🎉 Demo data setup complete!');
    console.log('💡 Refresh the dashboard to see your data');
  }
  return result;
};
