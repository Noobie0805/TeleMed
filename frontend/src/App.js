import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import DoctorPending from "./features/auth/DoctorPending";
import SymptomChecker from "./features/symptoms/SymptomChecker";
import DoctorList from "./features/appointments/DoctorList";
import AppointmentForm from "./features/appointments/AppointmentForm";
import MyAppointments from "./features/appointments/MyAppointments";
import DoctorSchedule from "./features/appointments/DoctorSchedule";
import JitsiMeet from "./features/video/JitsiMeet";
import VitalsDashboard from "./features/vitals/VitalsDashboard";
import PendingDoctors from "./features/admin/PendingDoctors";
import AdminOverview from "./features/admin/AdminOverview";
import Layout from "./components/common/Layout";
import AuthLayout from "./components/common/AuthLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import NotFound from "./components/common/NotFound";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./features/marketing/LandingPage";

function App() {
  const { isAuthenticated, defaultRedirect } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public marketing landing page */}
        <Route path="/" element={<LandingPage />} />

        <Route path="/login"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Login />
              </AuthLayout>
            ) : (
              <Navigate to={defaultRedirect} replace />
            )
          }
        />

        <Route
          path="/register/patient"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Register type="patient" />
              </AuthLayout>
            ) : (
              <Navigate to={defaultRedirect} replace />
            )
          }
        />
        <Route
          path="/register/doctor"
          element={
            !isAuthenticated ? (
              <AuthLayout>
                <Register type="doctor" />
              </AuthLayout>
            ) : (
              <Navigate to={defaultRedirect} replace />
            )
          }
        />
        <Route
          path="/pending"
          element={
            <AuthLayout>
              <DoctorPending />
            </AuthLayout>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/symptoms" element={<RoleRoute allow={["patient"]}><SymptomChecker /></RoleRoute>} />

          {/* Stub routes (implemented in later steps) */}
          <Route path="/doctors" element={<RoleRoute allow={["patient"]}><DoctorList /></RoleRoute>} />
          <Route path="/appointments" element={<RoleRoute allow={["patient"]}><MyAppointments /></RoleRoute>} />
          <Route path="/appointments/book" element={<RoleRoute allow={["patient"]}><AppointmentForm /></RoleRoute>} />
          <Route path="/doctor/schedule" element={<RoleRoute allow={["doctor"]}><DoctorSchedule /></RoleRoute>} />
          <Route path="/vitals" element={<RoleRoute allow={["patient"]}><VitalsDashboard /></RoleRoute>} />

          <Route path="/video/:appointmentId" element={<RoleRoute allow={["patient","doctor"]}><JitsiMeet /></RoleRoute>} />

          <Route path="/admin/pending-doctors" element={<RoleRoute allow={["admin"]}><PendingDoctors /></RoleRoute>} />
          <Route path="/admin/overview" element={<RoleRoute allow={["admin"]}><AdminOverview /></RoleRoute>} />
        </Route>

        <Route
          path="*"
          element={
            <AuthLayout>
              <NotFound />
            </AuthLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;





