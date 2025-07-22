# Research Hub - Collaborative Research Platform

A modern SaaS-style web application for students and academics to collaborate on research projects, manage groups, share papers, and track milestones.

## 🚀 Features

### Authentication
- **Login & Register**: Clean, modern authentication forms with validation
- **Demo Mode**: Easy testing with any credentials (no backend required)

### Dashboard
- **Overview Stats**: Active groups, papers, milestones, and collaborations
- **Recent Activity**: Real-time feed of research activities
- **Quick Actions**: Fast access to common tasks
- **Upcoming Deadlines**: Important milestone tracking

### Research Groups
- **My Groups**: Manage groups you're part of with role indicators
- **Discover Groups**: Find and join public research groups
- **Create Groups**: Start new research collaborations
- **Group Management**: Admin, member, and collaborator roles

### Research Papers
- **Paper Management**: Upload, edit, and organize research documents
- **Collaboration**: Multi-author support with version control
- **Status Tracking**: Draft, In Review, Published states
- **Tagging System**: Organize papers by research topics
- **Search & Filter**: Find papers by title, author, or tags

### Milestone Tracker
- **Timeline View**: Visual project timeline with progress indicators
- **Grid View**: Card-based milestone overview
- **Progress Tracking**: Task completion and percentage progress
- **Priority Management**: High, medium, low priority levels
- **Team Assignment**: Assign milestones to team members

### Profile Management
- **User Profile**: Complete academic profile with institution details
- **Activity History**: Track your research contributions
- **Achievements**: Recognition and milestone badges
- **Settings**: Notification preferences and privacy controls

## 🎨 Design Features

### Modern SaaS UI
- **Clean Design**: Inspired by modern SaaS platforms
- **Blue/Indigo Color Scheme**: Professional and academic-friendly
- **Rounded Corners**: Soft, modern aesthetic
- **Subtle Shadows**: Depth and hierarchy
- **Responsive Layout**: Works on all device sizes

### User Experience
- **Intuitive Navigation**: Clear sidebar and breadcrumbs
- **Loading States**: Smooth transitions and feedback
- **Error Handling**: Graceful error boundaries
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠 Technology Stack

- **React 19**: Latest React with hooks and modern patterns
- **Vite**: Fast development and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Heroicons**: Beautiful SVG icons
- **Mock Data**: Comprehensive dummy data for demonstration

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layouts/             # Layout components
│   │   ├── AuthLayout.jsx   # Authentication pages layout
│   │   └── MainLayout.jsx   # Main app layout with sidebar
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Groups.jsx
│   │   ├── ResearchPapers.jsx
│   │   ├── Milestones.jsx
│   │   └── Profile.jsx
│   ├── utils/
│   │   └── mockData.js      # Mock data for demonstration
│   ├── App.jsx              # Main app component with routing
│   ├── App.css              # Global styles and utilities
│   └── main.jsx             # App entry point
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

4. **Login**
   - Use any email/password combination
   - Or use the demo credentials shown on the login page

## 🎯 Key Pages & Features

### Login/Register (`/login`, `/register`)
- Modern authentication forms
- Password visibility toggle
- Form validation UI
- Demo credentials for testing

### Dashboard (`/dashboard`)
- Statistics overview cards
- Recent activity feed
- Quick action buttons
- Upcoming deadlines widget

### Groups (`/groups`)
- My Groups vs Discover tabs
- Group creation modal
- Join/request access functionality
- Role-based permissions display

### Papers (`/papers`)
- Paper status filtering (All, My Papers, Drafts, Published)
- Document type categorization
- Collaboration indicators
- Version tracking

### Milestones (`/milestones`)
- Timeline and grid view options
- Progress visualization
- Task completion tracking
- Priority and deadline management

### Profile (`/profile`)
- Complete academic profile
- Activity history
- Achievement badges
- Account settings

## 🎨 Design System

### Colors
- **Primary**: Blue (600) to Indigo (600) gradients
- **Success**: Green (500)
- **Warning**: Yellow (500)
- **Error**: Red (500)
- **Neutral**: Gray scale (50-900)

### Typography
- **Headings**: Font weights 600-800
- **Body**: Font weight 400-500
- **Captions**: Font weight 400, smaller sizes

### Components
- **Cards**: White background, subtle borders, rounded corners
- **Buttons**: Gradient backgrounds, hover states
- **Forms**: Clean inputs with focus states
- **Navigation**: Active states with color indicators

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet**: Adapted layouts for medium screens
- **Desktop**: Full-featured experience with sidebars

## 🔧 Customization

The application is built with modularity in mind:

- **Mock Data**: Easily replaceable with real API calls
- **Styling**: Tailwind classes can be customized
- **Components**: Reusable and extensible
- **Routing**: Easy to add new pages

## 🚀 Future Enhancements

- Real-time collaboration features
- File upload and document management
- Citation management tools
- Advanced search and filtering
- Integration with academic databases
- Mobile app version

## 📄 License

This project is created for demonstration purposes. Feel free to use and modify as needed.

---

**Research Hub** - Making academic collaboration simple and effective! 🎓✨
