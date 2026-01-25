import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import DoctorPending from "./features/auth/DoctorPending";
import SymptomChecker from "./features/symptoms/SymptomChecker";
import Chat from "./features/ai/Chat";
import DoctorList from "./features/appointments/DoctorList";
import AppointmentForm from "./features/appointments/AppointmentForm";
import MyAppointments from "./features/appointments/MyAppointments";
import DoctorSchedule from "./features/appointments/DoctorSchedule";
import JitsiMeet from "./features/video/JitsiMeet";
import VitalsDashboard from "./features/vitals/VitalsDashboard";
import PendingDoctors from "./features/admin/PendingDoctors";
import AdminOverview from "./features/admin/AdminOverview";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";
import NotFound from "./components/common/NotFound";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { isAuthenticated, defaultRedirect } = useAuth();
  return <Navigate to={isAuthenticated ? defaultRedirect : "/login"} replace />;
}

function App() {
  const { isAuthenticated, defaultRedirect } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to={defaultRedirect} replace />}
        />

        <Route
          path="/register/patient"
          element={!isAuthenticated ? <Register type="patient" /> : <Navigate to={defaultRedirect} replace />}
        />
        <Route
          path="/register/doctor"
          element={!isAuthenticated ? <Register type="doctor" /> : <Navigate to={defaultRedirect} replace />}
        />
        <Route path="/pending" element={<DoctorPending />} />

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
          <Route path="/chat" element={<Chat />} />
          <Route path="/vitals" element={<RoleRoute allow={["patient"]}><VitalsDashboard /></RoleRoute>} />

          <Route path="/video/:appointmentId" element={<RoleRoute allow={["patient","doctor"]}><JitsiMeet /></RoleRoute>} />

          <Route path="/admin/pending-doctors" element={<RoleRoute allow={["admin"]}><PendingDoctors /></RoleRoute>} />
          <Route path="/admin/overview" element={<RoleRoute allow={["admin"]}><AdminOverview /></RoleRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;





