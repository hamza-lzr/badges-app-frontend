import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminSidebar.css";
import { FaSuitcase } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 70;

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`
    );
  }, [collapsed]);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

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
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      style={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
      }}
    >
      {/* Top Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <span className="fs-5 fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill"></i> Admin 
          </span>
        )}
        <button
          className="btn btn-sm toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 nav flex-column px-2">
        <NavItem
          to="/admin/dashboard"
          icon="bi-house-door-fill"
          label="Dashboard"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/requests"
          icon="bi-list-check"
          label="Demandes"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/employees"
          icon="bi-person-badge-fill"
          label="Collaborateurs"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/airports"
          icon="bi-airplane-engines"
          label="Aéroports"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/companies"
          icon="bi-building"
          label="Entreprises"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/badges"
          icon="bi-credit-card"
          label="Badges"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/locations"
          icon="bi-geo-alt-fill"
          label="Pays"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/accesses"
          icon="bi-shield-check"
          label="Accès"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/notifications"
          icon="bi-bell-fill"
          label="Mes notifications"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/conges"
          icon={<FaSuitcase />}
          label="Congés"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/notifhistory"
          icon={<FaHistory />}
          label="Historique des notifs"
          collapsed={collapsed}
        />
      </nav>

      {/* Logout */}
      <div className="sidebar-footer p-3">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

const NavItem: React.FC<{
  to: string;
  icon: string | React.ReactNode;
  label: string;
  collapsed: boolean;
}> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link sidebar-link d-flex align-items-center gap-3 ${
          isActive ? "active" : ""
        }`
      }
      style={{
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      title={collapsed ? label : ""}
    >
      {typeof icon === "string" ? (
        <i className={`bi ${icon} fs-6`}></i>
      ) : (
        <div className="fs-6">{icon}</div>
      )}{" "}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default AdminSidebar;
