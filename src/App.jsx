import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import TraineeDashboard from './pages/TraineeDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Authenticated Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['trainee', 'trainer', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          {/* Private Trainee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['trainee']} />}>
            <Route path="/dashboard" element={<TraineeDashboard />} />
          </Route>

          {/* Private Trainer/Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['trainer', 'admin']} />}>
            <Route path="/trainer" element={<TrainerDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          user ? (
            user.isAdmin || user.role === 'admin' ? (
              <Navigate to="/admin" />
            ) : (user.role === 'trainee' || !user.role) ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/trainer" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
