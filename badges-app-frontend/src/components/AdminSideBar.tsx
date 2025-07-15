import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <i className="bi bi-shield-lock-fill me-2"></i>
        <span className="fs-4">Admin Panel</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-house-door-fill me-2"></i>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/requests"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-list-check me-2"></i>
            Manage Requests
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/employees"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-person-badge-fill me-2"></i>
            Employees
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/airports"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-airplane-engines me-2"></i>
            Airports
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/companies"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-building me-2"></i>
            Companies
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/badges"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-credit-card me-2"></i> Badges
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/locations"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-geo-alt-fill me-2"></i>
            Countries
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/accesses"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive ? "active bg-primary text-white" : "text-white"
              }`
            }
          >
            <i className="bi bi-shield-check me-2"></i> 
            Access Management
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
