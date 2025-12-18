import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { TrainingPage } from './pages/TrainingPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserProfilePage } from './pages/UserProfilePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/auth" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/training"
          element={
            <PrivateRoute>
              <TrainingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          }
        />
      </Routes>
      {currentUser && <Navbar />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <WorkoutProvider>
            <AppRoutes />
          </WorkoutProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
