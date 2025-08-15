// src/adminComponents/AdminTopbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Navbar, Container, Nav, Dropdown, Badge, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdNotificationsNone, MdAccountCircle } from "react-icons/md";
import { fetchMyNotifications } from "../api/apiNotification"; // or fetchNotifications for admins
import type { NotificationDTO } from "../types";

type AdminTopbarProps = {
  title?: string;
  onLogout?: () => void;
  pollMs?: number; // how often to refresh notifications (default 60s)
};

const accentRed = "#b11e2f";

const AdminTopbar: React.FC<AdminTopbarProps> = ({ title="Badges App Admin", onLogout, pollMs = 60000 }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<NotificationDTO[]>([]);
  const [error, setError] = useState<string>("");

  const unreadCount = useMemo(
    () => notifs.filter((n) => !n.read).length,
    [notifs]
  );

  const loadNotifications = async () => {
    try {
      setError("");
      // If your admin endpoint is different, replace this call (e.g., fetchNotifications())
      const data = await fetchMyNotifications();
      // Sort newest first if not already sorted
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs]);

  const goToProfile = () => navigate("/admin/profile");
  const goToNotifications = () => navigate("/admin/notifications");

  // simple util
  const fmt = (d: string | Date) =>
    new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  // show only a few in the dropdown preview
  const preview = notifs.slice(0, 6);

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      className="shadow-sm"
      style={{ borderBottom: `3px solid ${accentRed}` }}
    >
      <Container fluid>
        <Navbar.Brand
          onClick={() => navigate("/admin/dashboard")}
          style={{ cursor: "pointer", fontWeight: 700, letterSpacing: 0.3 }}
        >
          {title}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-topbar" />

        <Navbar.Collapse id="admin-topbar">
          <Nav className="ms-auto align-items-center">

            {/* Notifications */}
            <Dropdown align="end" className="me-2">
              <Dropdown.Toggle
                id="admin-notifs"
                variant="link"
                className="text-light d-flex align-items-center position-relative"
                style={{ textDecoration: "none" }}
              >
                <MdNotificationsNone size={24} />
                {loading ? (
                  <Spinner animation="border" size="sm" className="ms-2" />
                ) : unreadCount > 0 ? (
                  <Badge bg="danger" pill className="position-absolute translate-middle"
                         style={{ top: 6, right: -2 }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                ) : null}
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow rounded-4 p-0 overflow-hidden" style={{ minWidth: 320 }}>
                <div className="px-3 pt-3 pb-2 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Notifications</span>
                  <Badge bg={unreadCount ? "danger" : "secondary"} pill>
                    {unreadCount}
                  </Badge>
                </div>

                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {error && (
                    <div className="px-3 py-3 text-danger small">{error}</div>
                  )}

                  {!error && preview.length === 0 && !loading && (
                    <div className="px-3 py-3 text-muted small">No notifications</div>
                  )}

                  {!error &&
                    preview.map((n) => (
                      <Dropdown.Item
                        key={n.id}
                        className="py-2"
                        onClick={goToNotifications}
                        style={{
                          whiteSpace: "normal",
                          backgroundColor: n.read ? undefined : "rgba(177, 30, 47, 0.08)",
                        }}
                      >
                        <div className="fw-semibold" style={{ color: "#333" }}>
                          {n.message ?? "Notification"}
                        </div>
                        <div className="small text-muted mt-1">{fmt(n.createdAt)}</div>
                      </Dropdown.Item>
                    ))}
                </div>

                <div className="px-3 py-2 bg-light border-top">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    className="w-100 rounded-pill"
                    onClick={goToNotifications}
                  >
                    View all notifications
                  </Button>
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {/* Profile */}
            <Dropdown align="end">
              <Dropdown.Toggle
                id="admin-profile"
                variant="link"
                className="text-light d-flex align-items-center"
                style={{ textDecoration: "none" }}
              >
                <MdAccountCircle size={26} />
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow rounded-4 overflow-hidden">
                <Dropdown.Item onClick={goToProfile}>My Profile</Dropdown.Item>
                {onLogout && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>
        {`
          #admin-notifs .dropdown-menu,
          #admin-profile .dropdown-menu {
            border-radius: 1rem !important;
          }
        `}
      </style>
    </Navbar>
  );
};

export default AdminTopbar;
