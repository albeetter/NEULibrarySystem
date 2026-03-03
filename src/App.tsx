import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import CheckIn from './pages/CheckIn';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement'; // <-- Add this import

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} /> {/* <-- Add this route */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;