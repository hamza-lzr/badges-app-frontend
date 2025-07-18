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



const App = () => {
  return (
    <Router>
      <Routes>
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
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="home" element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
