import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/AdminSideBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
