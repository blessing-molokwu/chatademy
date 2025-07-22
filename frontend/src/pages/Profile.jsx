import { useState } from "react";
import {
  PencilIcon,
  CameraIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const user = {
    name: "Dr. John Doe",
    title: "Senior Research Scientist",
    institution: "University of Research Excellence",
    department: "Computer Science Department",
    email: "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "2022-03-15",
    bio: "Passionate researcher specializing in artificial intelligence and machine learning applications in healthcare. Currently leading multiple interdisciplinary projects focused on ethical AI development.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    fields: [
      "Artificial Intelligence",
      "Machine Learning",
      "Healthcare Technology",
      "Ethics in AI",
    ],
    socialLinks: {
      orcid: "0000-0000-0000-0000",
      googleScholar: "scholar.google.com/citations?user=example",
      researchGate: "researchgate.net/profile/john-doe",
    },
  };

  const stats = [
    {
      name: "Research Papers",
      value: "28",
      icon: DocumentTextIcon,
      color: "bg-blue-500",
    },
    {
      name: "Active Groups",
      value: "12",
      icon: UserGroupIcon,
      color: "bg-green-500",
    },
    {
      name: "Collaborations",
      value: "47",
      icon: UserIcon,
      color: "bg-purple-500",
    },
    {
      name: "Citations",
      value: "342",
      icon: TrophyIcon,
      color: "bg-orange-500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "paper",
      title: 'Published "AI in Healthcare: A Comprehensive Review"',
      date: "2024-01-10",
      group: "AI Ethics Research",
    },
    {
      id: 2,
      type: "milestone",
      title: "Completed Literature Review milestone",
      date: "2024-01-08",
      group: "Quantum Computing Lab",
    },
    {
      id: 3,
      type: "group",
      title: 'Joined "Biomedical Engineering" group',
      date: "2024-01-05",
      group: "Biomedical Engineering",
    },
    {
      id: 4,
      type: "collaboration",
      title: "Started collaboration with Dr. Sarah Chen",
      date: "2024-01-03",
      group: "AI Ethics Research",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Research Excellence Award",
      description: "Outstanding contribution to AI research",
      date: "2023-12-15",
      icon: TrophyIcon,
    },
    {
      id: 2,
      title: "Top Collaborator",
      description: "Most active collaborator in Q4 2023",
      date: "2023-12-01",
      icon: UserGroupIcon,
    },
    {
      id: 3,
      title: "Publication Milestone",
      description: "Published 25th research paper",
      date: "2023-11-20",
      icon: DocumentTextIcon,
    },
  ];

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "activity", name: "Activity" },
    { id: "achievements", name: "Achievements" },
    { id: "settings", name: "Settings" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <ModernCard className="mb-8">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                src={user.avatar}
                alt={user.name}
              />
              <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <CameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-6 px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {user.title}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  <span>{user.institution}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
            <ModernButton
              variant="primary"
              size="lg"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white px-6 py-3"
            >
              <div className="flex items-center">
                <PencilIcon className="h-5 w-5 mr-2" />
                <span>Edit Profile</span>
              </div>
            </ModernButton>
          </div>
        </div>
      </ModernCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <ModernCard key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {user.bio}
              </p>
            </ModernCard>

            {/* Research Fields */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Research Fields
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.fields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </ModernCard>
          </div>

          <div className="space-y-8">
            {/* Contact Information */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.phone}
                  </span>
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.department}
                  </span>
                </div>
              </div>
            </ModernCard>

            {/* Academic Links */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Academic Profiles
              </h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <span className="font-medium">ORCID:</span>
                  <span className="ml-2">{user.socialLinks.orcid}</span>
                </a>
                <a
                  href="#"
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <span className="font-medium">Google Scholar</span>
                </a>
                <a
                  href="#"
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <span className="font-medium">ResearchGate</span>
                </a>
              </div>
            </ModernCard>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.group} • {activity.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <ModernCard key={achievement.id} className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <achievement.icon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {achievement.date}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.description}
              </p>
            </ModernCard>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Account Settings
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Notification Preferences
              </h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Email notifications for new collaborations
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Milestone deadline reminders
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Weekly activity digest
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Privacy Settings
              </h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Make profile visible to other researchers
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Allow others to invite me to groups
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ModernButton>Save Changes</ModernButton>
            </div>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default Profile;
