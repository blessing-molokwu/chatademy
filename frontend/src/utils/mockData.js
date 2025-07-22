// Mock data for the Research Hub application

export const mockUser = {
  id: 1,
  name: 'Dr. John Doe',
  email: 'john.doe@university.edu',
  title: 'Senior Research Scientist',
  institution: 'University of Research Excellence',
  department: 'Computer Science Department',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  joinDate: '2022-03-15',
  bio: 'Passionate researcher specializing in artificial intelligence and machine learning applications in healthcare. Currently leading multiple interdisciplinary projects focused on ethical AI development.',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  fields: ['Artificial Intelligence', 'Machine Learning', 'Healthcare Technology', 'Ethics in AI'],
  socialLinks: {
    orcid: '0000-0000-0000-0000',
    googleScholar: 'scholar.google.com/citations?user=example',
    researchGate: 'researchgate.net/profile/john-doe'
  }
}

export const mockGroups = [
  {
    id: 1,
    name: 'AI Ethics Research',
    description: 'Exploring ethical implications of artificial intelligence in modern society.',
    members: 12,
    papers: 8,
    lastActivity: '2 hours ago',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80',
    color: 'bg-blue-500',
    isPublic: true,
    createdAt: '2023-06-15',
    tags: ['AI', 'Ethics', 'Philosophy']
  },
  {
    id: 2,
    name: 'Quantum Computing Lab',
    description: 'Advanced research in quantum algorithms and quantum machine learning.',
    members: 8,
    papers: 15,
    lastActivity: '1 day ago',
    role: 'Member',
    avatar: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80',
    color: 'bg-purple-500',
    isPublic: false,
    createdAt: '2023-04-20',
    tags: ['Quantum Computing', 'Physics', 'Algorithms']
  },
  {
    id: 3,
    name: 'Climate Data Analysis',
    description: 'Analyzing climate patterns using machine learning and statistical methods.',
    members: 15,
    papers: 6,
    lastActivity: '3 days ago',
    role: 'Collaborator',
    avatar: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80',
    color: 'bg-green-500',
    isPublic: true,
    createdAt: '2023-08-10',
    tags: ['Climate Science', 'Data Analysis', 'Machine Learning']
  }
]

export const mockPapers = [
  {
    id: 1,
    title: 'Machine Learning Applications in Healthcare: A Comprehensive Review',
    authors: ['Dr. Sarah Chen', 'Prof. Michael Johnson', 'You'],
    group: 'AI Ethics Research',
    status: 'Published',
    lastModified: '2024-01-10',
    tags: ['Machine Learning', 'Healthcare', 'Review'],
    collaborators: 3,
    version: '2.1',
    abstract: 'This paper provides a comprehensive review of machine learning applications in healthcare, covering recent advances and future directions.',
    type: 'Research Paper',
    citations: 45,
    downloads: 1250
  },
  {
    id: 2,
    title: 'Quantum Algorithms for Optimization Problems',
    authors: ['You', 'Dr. Alice Wang'],
    group: 'Quantum Computing Lab',
    status: 'In Review',
    lastModified: '2024-01-08',
    tags: ['Quantum Computing', 'Optimization', 'Algorithms'],
    collaborators: 2,
    version: '1.3',
    abstract: 'We present novel quantum algorithms for solving complex optimization problems with improved efficiency.',
    type: 'Research Paper',
    citations: 12,
    downloads: 340
  },
  {
    id: 3,
    title: 'Climate Change Impact Analysis Using Statistical Models',
    authors: ['Prof. David Brown', 'You', 'Dr. Emma Wilson'],
    group: 'Climate Data Analysis',
    status: 'Draft',
    lastModified: '2024-01-05',
    tags: ['Climate Change', 'Statistics', 'Data Analysis'],
    collaborators: 3,
    version: '0.8',
    abstract: 'Statistical analysis of climate data to understand long-term environmental changes and their implications.',
    type: 'Research Paper',
    citations: 0,
    downloads: 0
  }
]

export const mockMilestones = [
  {
    id: 1,
    title: 'Literature Review Completion',
    description: 'Complete comprehensive review of existing research in AI ethics',
    group: 'AI Ethics Research',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14',
    assignees: ['Dr. Sarah Chen', 'You'],
    progress: 100,
    tasks: [
      { id: 1, title: 'Identify key papers', completed: true },
      { id: 2, title: 'Analyze methodologies', completed: true },
      { id: 3, title: 'Write summary', completed: true }
    ]
  },
  {
    id: 2,
    title: 'Data Collection Phase',
    description: 'Gather experimental data for quantum algorithm testing',
    group: 'Quantum Computing Lab',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-01-25',
    assignees: ['You', 'Dr. Alice Wang'],
    progress: 65,
    tasks: [
      { id: 1, title: 'Set up quantum simulator', completed: true },
      { id: 2, title: 'Run initial tests', completed: true },
      { id: 3, title: 'Collect performance metrics', completed: false },
      { id: 4, title: 'Validate results', completed: false }
    ]
  }
]

export const mockActivity = [
  {
    id: 1,
    type: 'paper',
    title: 'New paper "AI in Healthcare" was shared',
    user: 'Dr. Sarah Chen',
    time: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 2,
    type: 'milestone',
    title: 'Milestone "Data Collection" completed',
    user: 'Research Team Alpha',
    time: '4 hours ago',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 3,
    type: 'group',
    title: 'You joined "Machine Learning Research"',
    user: 'You',
    time: '1 day ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
]

export const mockStats = {
  totalGroups: 12,
  totalPapers: 28,
  activeMilestones: 15,
  totalCollaborations: 47,
  totalCitations: 342,
  monthlyGrowth: {
    groups: 2.1,
    papers: 5.4,
    milestones: 12.5,
    collaborations: 3.2
  }
}

export const mockNotifications = [
  {
    id: 1,
    title: 'New collaboration request',
    message: 'Dr. Sarah Chen invited you to collaborate on "AI Ethics Framework"',
    type: 'collaboration',
    read: false,
    timestamp: '2024-01-10T10:30:00Z'
  },
  {
    id: 2,
    title: 'Milestone deadline approaching',
    message: 'Data Collection Phase is due in 3 days',
    type: 'deadline',
    read: false,
    timestamp: '2024-01-10T09:15:00Z'
  },
  {
    id: 3,
    title: 'Paper published',
    message: 'Your paper "Machine Learning in Healthcare" has been published',
    type: 'success',
    read: true,
    timestamp: '2024-01-09T14:20:00Z'
  }
]
