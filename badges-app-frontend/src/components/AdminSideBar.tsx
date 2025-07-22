import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 80;

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Update a CSS variable so main content adjusts
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`
    );
  }, [collapsed]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await axios.post(
          "http://localhost:8081/realms/ram/protocol/openid-connect/logout",
          new URLSearchParams({
            client_id: "ram-badges",
            refresh_token: refreshToken,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
      }
    } catch (err) {
      console.warn("Keycloak logout failed, clearing tokens anyway.", err);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div
      className="d-flex flex-column text-white bg-dark"
      style={{
        width: collapsed ? `${COLLAPSED_WIDTH}px` : `${EXPANDED_WIDTH}px`,
        minHeight: "100vh",
        transition: "width 0.3s ease",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Header with Toggle */}
      <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
        {!collapsed && (
          <span className="fs-5 fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill"></i> Admin
          </span>
        )}
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Menu Links */}
      <div className="flex-grow-1 p-2 d-flex flex-column">
        <nav className="nav nav-pills flex-column gap-1">
          <NavItem to="/admin/dashboard" icon="bi-house-door-fill" label="Dashboard" collapsed={collapsed} />
          <NavItem to="/admin/requests" icon="bi-list-check" label="Requests" collapsed={collapsed} />
          <NavItem to="/admin/employees" icon="bi-person-badge-fill" label="Employees" collapsed={collapsed} />
          <NavItem to="/admin/airports" icon="bi-airplane-engines" label="Airports" collapsed={collapsed} />
          <NavItem to="/admin/companies" icon="bi-building" label="Companies" collapsed={collapsed} />
          <NavItem to="/admin/badges" icon="bi-credit-card" label="Badges" collapsed={collapsed} />
          <NavItem to="/admin/locations" icon="bi-geo-alt-fill" label="Countries" collapsed={collapsed} />
          <NavItem to="/admin/accesses" icon="bi-shield-check" label="Access" collapsed={collapsed} />
          <NavItem to="/admin/notifications" icon="bi-bell-fill" label="Notifications" collapsed={collapsed} />
        </nav>
      </div>

      {/* Logout Button pinned at bottom */}
      <div className="p-3 border-top border-secondary mt-auto">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

const NavItem: React.FC<{
  to: string;
  icon: string;
  label: string;
  collapsed: boolean;
}> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
          isActive ? "active bg-primary text-white fw-bold" : "text-white"
        }`
      }
      style={{
        transition: "background 0.2s ease",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      title={collapsed ? label : ""}
    >
      <i className={`bi ${icon} fs-5`}></i>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default AdminSidebar;
