import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Machines from './pages/Machines.jsx';
import MachineDetail from './pages/MachineDetail.jsx';
import Alerts from './pages/Alerts.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/machines"
        element={
          <ProtectedRoute>
            <Layout>
              <Machines />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/machines/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <MachineDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
