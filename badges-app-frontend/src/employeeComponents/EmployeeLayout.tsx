// src/employeeComponents/EmployeeLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import EmployeeSideBar from "./EmployeeSideBar";
import {
  Navbar,
  Nav,
  Dropdown,
  Container,
} from "react-bootstrap";
import { fetchMyNotifications } from "../api/apiNotification";
import type { NotificationDTO } from "../types";

const accentRed = "#b11e2f";

const EmployeeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyNotifications()
      .then((data) => setNotifications(data.slice(0, 8)))
      .catch((err) => console.error("Fetch notifications failed:", err));
  }, []);

  const handleNotificationClick = () => navigate("/employee/notifications");
  const handleLogout = () => {
    // your logout logic…
    navigate("/employee/login");
        localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <div className="d-flex flex-column">
      {/* Dark Top Navbar */}
      <Navbar
        bg="dark"
        variant="dark"
        expand="md"
        sticky="top"
        className="shadow-sm"
        style={{ borderBottom: `3px solid ${accentRed}` }}
      >
        <Container fluid>
          {/* Brand / logo */}
          <Navbar.Brand
            as={Link}
            to="/employee"
            className="d-flex align-items-center"
          >
            
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="emp-navbar-nav" />

          <Navbar.Collapse id="emp-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {/* Notifications */}
              <Dropdown align="end" className="me-3">
                <Dropdown.Toggle
                  variant="dark"
                  id="notifications-dropdown"
                  className="position-relative"
                >
                  <i
                    className="bi bi-bell"
                    style={{ fontSize: "1.4rem", color: accentRed }}
                  />

                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="p-2"
                  style={{ width: 320, maxHeight: 360, overflowY: "auto" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold" style={{ color: accentRed }}>
                      Notifications
                    </span>
                    <span
                      className="text-decoration-underline"
                      style={{ cursor: "pointer" }}
                      onClick={handleNotificationClick}
                    >
                      View all
                    </span>
                  </div>
                  <Dropdown.Divider />
                  {notifications.length ? (
                    notifications.map((n) => (
                      <Dropdown.Item
                        key={n.id}
                        className="d-flex flex-column py-2"
                        onClick={handleNotificationClick}
                      >
                        <span>{n.message}</span>
                        <small className="text-muted">
                          {new Date(n.createdAt).toLocaleString()}
                        </small>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item className="text-center text-muted py-3">
                      No new notifications
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {/* Quick links */}
              <Nav.Link
                as={Link}
                to="/employee/profile"
                className="me-3 text-white"
              >
                <i
                  className="bi bi-person-circle"
                  style={{ fontSize: "1.3rem", color: "#fff" }}
                />
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/employee/requests"
                className="me-3 text-white"
              >
                <i
                  className="bi bi-send"
                  style={{ fontSize: "1.3rem", color: "#fff" }}
                />
              </Nav.Link>

              {/* User menu */}
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="user-menu">
                  <i
                    className="bi bi-three-dots-vertical"
                    style={{ color: "#fff" }}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item as={Link} to="/employee/profile">
                    <i className="bi bi-person me-2"></i>My Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/employee/badges">
                    <i className="bi bi-credit-card-2-front me-2"></i>My Badges
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar + Content */}
      <div className="d-flex">
        {/* Sidebar */}
        <EmployeeSideBar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content */}
        <div
          style={{
            marginLeft: collapsed ? 70 : 220,
            transition: "margin-left 0.25s ease",
            width: "100%",
            background: "#f8f9fa",
            minHeight: "100vh",
            padding: 20,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
