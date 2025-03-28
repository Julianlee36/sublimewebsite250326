import React, { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load the admin page
const AdminPage = lazy(() => import('./AdminPage'));

// Simple authentication check - in a real application, you would use proper authentication
const isAuthenticated = () => {
  return localStorage.getItem('admin_authenticated') === 'true';
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Login page component
const LoginPage: React.FC = () => {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would validate against a secure backend
    // This is just for demo purposes - NEVER use hardcoded passwords in production
    if (password === 'sublimeadmin') {
      localStorage.setItem('admin_authenticated', 'true');
      window.location.href = '/admin';
    } else {
      setError('Invalid password');
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

// Logout function
export const logout = () => {
  localStorage.removeItem('admin_authenticated');
  window.location.href = '/';
};

// Admin routes configuration
export const adminRoutes = [
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPage />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/login",
    element: <LoginPage />
  }
];