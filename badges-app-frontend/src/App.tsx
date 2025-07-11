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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
