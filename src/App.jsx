import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TraineeDashboard from './pages/TraineeDashboard';
import TrainerDashboard from './pages/TrainerDashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Private Trainee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['trainee']} />}>
          <Route path="/dashboard" element={<TraineeDashboard />} />
        </Route>

        {/* Private Trainer/Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['trainer', 'admin']} />}>
          <Route path="/trainer" element={<TrainerDashboard />} />
        </Route>

        {/* Root Redirect */}
        <Route
          path="/"
          element={
            user ? (
              (user.role === 'trainee' || (!user.role && !user.isAdmin)) ? (
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
    </div>
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
