import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import 'react-bootstrap-typeahead/css/Typeahead.css';

const AdminLayout = lazy(() => import("./components/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Requests = lazy(() => import("./pages/Requests"));
const Employees = lazy(() => import("./pages/Employees"));
const Airports = lazy(() => import("./pages/Airports"));
const Companies = lazy(() => import("./pages/Companies"));
const Badges = lazy(() => import("./pages/Badges"));
const LocationManagement = lazy(() => import("./pages/LocationManagement"));
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const Accesses = lazy(() => import("./pages/Accesses"));
const Notifications = lazy(() => import("./pages/Notifications"));
const CongeManagement = lazy(() => import("./pages/Conges"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const MyAdminProfilePage = lazy(() => import("./pages/AdminProfile"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

const EmployeeLayout = lazy(() => import("./employeeComponents/EmployeeLayout"));
const EmployeeProtectedRoute = lazy(
  () => import("./employeeComponents/EmployeeProtectedRoute"),
);
const HomePage = lazy(() => import("./employeePages/HomePage"));
const EmployeeLoginPage = lazy(() => import("./employeePages/LoginPage"));
const EmployeeBadgesPage = lazy(() => import("./employeePages/BadgesPage"));
const EmployeeNotificationsPage = lazy(
  () => import("./employeePages/NotificationsPage"),
);
const ProfilePage = lazy(() => import("./employeePages/ProfilePage"));
const EmployeeAccessesPage = lazy(() => import("./employeePages/AccessesPage"));
const EmployeeRequestsPage = lazy(() => import("./employeePages/RequestsPage"));
const CongePage = lazy(() => import("./employeePages/CongesPage"));

const PageLoader = () => (
  <div className="d-flex min-vh-100 align-items-center justify-content-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading…</span>
    </div>
  </div>
);

const App = () => {
  return (
    <div style={{ fontFamily: "Roboto, sans-serif" }}>
      <Suspense fallback={<PageLoader />}>
       <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee/login" element={<EmployeeLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="employees" element={<Employees />} />
            <Route path="airports" element={<Airports />} />
            <Route path="companies" element={<Companies />} />
            <Route path="badges" element={<Badges />} />
            <Route path="locations" element={<LocationManagement />} />
            <Route path="cities/:countryId" element={<CitiesPage />} />
            <Route path="accesses" element={<Accesses />} />
            <Route path="notifhistory" element={<Notifications />} />
            <Route path="conges" element={<CongeManagement />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<MyAdminProfilePage />} />
          </Route>
        </Route>

        <Route element={<EmployeeProtectedRoute />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="badges" element={<EmployeeBadgesPage />} />
            <Route path="notifications" element={<EmployeeNotificationsPage />} />
            <Route path ="profile" element={<ProfilePage />} />
            <Route path="accesses" element={<EmployeeAccessesPage />} />
            <Route path="requests" element={<EmployeeRequestsPage />} />
            <Route path="conges" element={<CongePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
       </Routes>
      </Suspense>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default App;
