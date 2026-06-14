import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Navbar from "./components/Navbar.jsx";
import SidebarLayout from "./components/SidebarLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Landing from "./pages/Landing.jsx";
import UnlockLink from "./pages/UnlockLink.jsx";
import Profile from "./pages/Profile.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin Route Guard
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-muted">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { user, isAdmin } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-bg-app text-text-main flex flex-col font-sans antialiased transition-colors duration-350 relative">
        {/* Render standard guest Navbar if user is not logged in */}
        {!user && <Navbar />}
        
        <div className="flex-1 flex w-full">
          {user ? (
            <SidebarLayout>
              <Routes>
                {/* User logged in routes inside sidebar layout */}
                <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Dashboard />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                {/* Utility routes also accessible when logged in */}
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/unlock/:shortCode" element={<UnlockLink />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SidebarLayout>
          ) : (
            <main className="flex-1 w-full">
              <Routes>
                {/* Guest routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/unlock/:shortCode" element={<UnlockLink />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          )}
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
