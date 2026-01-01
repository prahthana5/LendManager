import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoanList from './pages/LoanList';
import LoanForm from './pages/LoanForm';
import LoanDetails from './pages/LoanDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="loans" element={<LoanList />} />
            <Route path="loans/new" element={<LoanForm />} />
            <Route path="loans/:id" element={<LoanDetails />} />
            <Route path="loans/:id/edit" element={<LoanForm />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
