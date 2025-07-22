import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Layout Components
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterSuccessPage from "./pages/auth/RegisterSuccessPage";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import ResearchPapers from "./pages/ResearchPapers";
import Profile from "./pages/Profile";
import Files from "./pages/Files";
import SearchResults from "./pages/SearchResults";

// App Routes Component (needs to be inside AuthProvider)
function AppRoutes() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Login />
              </AuthLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Register />
              </AuthLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/register-success"
          element={
            <AuthLayout>
              <RegisterSuccessPage />
            </AuthLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/groups"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <Groups />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/groups/:id"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <GroupDetail />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/papers"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <ResearchPapers />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <Profile />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/files"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <Files />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/search"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={logout}>
                <SearchResults />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
