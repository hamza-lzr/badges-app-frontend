// src/employeeComponents/EmployeeLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import EmployeeSideBar from "./EmployeeSideBar";
import { Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import { fetchMyNotifications } from "../api/apiNotification";
import type { NotificationDTO } from "../types";

const accentRed = "#b11e2f";

const EmployeeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await fetchMyNotifications();

        if (cancelled) return;

        // 1) sort newest → oldest by createdAt
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // 2) unread count from full list (not just preview)
        setUnreadCount(sorted.filter((n) => !n.read).length);

        // 3) only keep the most recent 8 for the dropdown
        setNotifications(sorted.slice(0, 8));
      } catch (e) {
        console.error("Fetch notifications failed:", e);
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 3_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const truncateWords = (text: string, count = 7): string => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    return words.length <= count ? text : words.slice(0, count).join(" ") + "…";
  };

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
        style={{ borderBottom: `3px solid #b11e2f`, background: "#333333" }}
      >
        <Container fluid>
          {/* Brand / logo */}
          <Navbar.Brand
            as={Link}
            to="/employee"
            className="d-flex align-items-center"
          ></Navbar.Brand>

          <Navbar.Toggle aria-controls="emp-navbar-nav" />

          <Navbar.Collapse id="emp-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {/* Notifications */}
              <Dropdown align="end" className="me-3">
                <Dropdown.Toggle
                  variant="dark"
                  id="notifications-dropdown"
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <span className="position-relative d-inline-block">
                    <i
                      className="bi bi-bell"
                      style={{ fontSize: "1.4rem", color: accentRed }}
                    />
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem", minWidth: 18 }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                        <span className="visually-hidden">
                          notifications non lues
                        </span>
                      </span>
                    )}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="p-2"
                  style={{ width: 460, maxHeight: 480, overflowY: "auto" }}
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
                      Voir tout
                    </span>
                  </div>
                  <Dropdown.Divider />
                  {notifications.length ? (
                    notifications.map((n) => {
                      const isUnread = !n.read;
                      return (
                        <Dropdown.Item
                          key={n.id}
                          onClick={handleNotificationClick}
                          className={`py-2 ${isUnread ? "bg-light" : ""}`}
                        >
                          <div className="d-flex">
                            {/* unread dot */}
                            {isUnread && (
                              <span
                                className="me-2 mt-1 rounded-circle"
                                style={{
                                  width: 8,
                                  height: 8,
                                  backgroundColor: accentRed,
                                  display: "inline-block",
                                  flex: "0 0 auto",
                                }}
                              />
                            )}
                            <div className="flex-grow-1">
                              <span
                                className={
                                  isUnread
                                    ? "fw-semibold text-dark"
                                    : "text-body"
                                }
                                title={n.message}
                              >
                                {truncateWords(n.message, 10)}
                              </span>
                              <div className="small text-muted">
                                {new Date(n.createdAt).toLocaleString("fr-FR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </div>
                            </div>
                          </div>
                        </Dropdown.Item>
                      );
                    })
                  ) : (
                    <Dropdown.Item className="text-center text-muted py-3">
                      Aucune nouvelle notification
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
                    <i className="bi bi-person me-2"></i>Mon Profil
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/employee/badges">
                    <i className="bi bi-credit-card-2-front me-2"></i>Mes Badges
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
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
