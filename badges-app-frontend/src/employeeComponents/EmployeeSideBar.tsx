import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ListGroup, Button } from "react-bootstrap";

const sidebarLinks = [
  { to: "/employee/profile", icon: "bi-person-circle", label: "My Profile" },
  { to: "/employee/badges", icon: "bi-credit-card-2-front", label: "My Badges" },
  { to: "/employee/accesses", icon: "bi-shield-check", label: "My Accesses" },
  { to: "/employee/notifications", icon: "bi-bell", label: "Notifications" },
  { to: "/employee/requests", icon: "bi-send", label: "Send a Request" },
];

const EmployeeSideBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`bg-white border-end shadow-sm d-flex flex-column`}
      style={{
        width: collapsed ? 60 : 210,
        minHeight: "100vh",
        transition: "width 0.2s",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
        {!collapsed && (
          <span className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
            Employee
          </span>
        )}
        <Button
          variant="light"
          size="sm"
          className="p-1"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`bi ${collapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}`}></i>
        </Button>
      </div>
      <ListGroup variant="flush" className="flex-grow-1">
        {sidebarLinks.map((link) => (
          <ListGroup.Item
            key={link.to}
            as={Link}
            to={link.to}
            className={`d-flex align-items-center gap-2 border-0 rounded-0 px-3 py-3 ${
              location.pathname === link.to ? "bg-primary text-white" : "bg-white text-dark"
            }`}
            style={{
              fontWeight: location.pathname === link.to ? 600 : 400,
              fontSize: "1rem",
              transition: "background 0.15s",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <i className={`bi ${link.icon}`} style={{ fontSize: "1.3rem" }}></i>
            {!collapsed && <span>{link.label}</span>}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default EmployeeSideBar;