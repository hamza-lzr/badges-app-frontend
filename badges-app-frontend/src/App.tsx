import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Employees from "./pages/Employees";
import Airports from "./pages/Airports";
import Companies from "./pages/Companies";
import Badges from "./pages/Badges";
import LocationManagement from "./pages/LocationManagement";
import CitiesPage from "./pages/CitiesPage";
import Accesses from "./pages/Accesses";
import Notifications from "./pages/Notifications";
import EmployeeLayout from "./employeeComponents/EmployeeLayout";
import HomePage from "./employeePages/HomePage";
import EmployeeLoginPage from "./employeePages/LoginPage";
import LoginPage from "./pages/LoginPage"; //  new login page
import ProtectedRoute from "./components/ProtectedRoute"; //  wrapper
import EmployeeProtectedRoute from "./employeeComponents/EmployeeProtectedRoute"; //  employee wrapper
import EmployeeBadgesPage from "./employeePages/BadgesPage";
import EmployeeNotificationsPage from "./employeePages/NotificationsPage";
import ProfilePage from "./employeePages/ProfilePage";
import EmployeeAccessesPage from "./employeePages/AccessesPage";
import EmployeeRequestsPage from "./employeePages/RequestsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ✅ Public route for login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee/login" element={<EmployeeLoginPage />} />

        {/* ✅ Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="employees" element={<Employees />} />
            <Route path="airports" element={<Airports />} />
            <Route path="companies" element={<Companies />} />
            <Route path="badges" element={<Badges />} />
            <Route path="locations" element={<LocationManagement />} />
            <Route path="cities/:countryId" element={<CitiesPage />} />
            <Route path="accesses" element={<Accesses />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* ✅ Protected Employee route */}
  <Route element={<EmployeeProtectedRoute />}>
    <Route path="/employee" element={<EmployeeLayout />}>
      <Route path="home" element={<HomePage />} />
      <Route path="badges" element={<EmployeeBadgesPage />} />
      <Route path="notifications" element={<EmployeeNotificationsPage />} />
      <Route path ="profile" element={<ProfilePage />} />
      <Route path="accesses" element={<EmployeeAccessesPage />} />
      <Route path="requests" element={<EmployeeRequestsPage />} />
    </Route>
  </Route>
      </Routes>
    </Router>
  );
};

export default App;
