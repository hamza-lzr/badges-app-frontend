// src/adminComponents/AdminTopbar.tsx
// src/adminComponents/AdminTopbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Dropdown,
  Badge as BsBadge,
  Spinner,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdNotificationsNone, MdAccountCircle, MdSend } from "react-icons/md";
import { fetchMyNotifications, createNotification } from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import type { NotificationDTO, UserDTO } from "../types";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

type AdminTopbarProps = {
  title?: string;
  onLogout?: () => void;
  pollMs?: number; // how often to refresh notifications (default 3s here)
};

const accentRed = "#b11e2f";

const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title = "Badges App Admin",
  onLogout,
  pollMs = 3000,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<NotificationDTO[]>([]);
  const [error, setError] = useState<string>("");

  // Compose modal state
  const [showCompose, setShowCompose] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  type EmployeeOption = { id: number; label: string };
  const employeeOptions: EmployeeOption[] = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        label: `${e.firstName ?? ""} ${e.lastName ?? ""}${
          e.matricule ? " — " + e.matricule : ""
        }`.trim(),
      })),
    [employees]
  );
  const [newNotification, setNewNotification] = useState<{
    userId: number;
    message: string;
  }>({ userId: 0, message: "" });

  const unreadCount = useMemo(
    () => notifs.filter((n) => !n.read).length,
    [notifs]
  );

  const loadNotifications = async () => {
    try {
      setError("");
      const data = await fetchMyNotifications();
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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

  useEffect(() => {
    // load employees for the compose modal
    (async () => {
      try {
        const list = await fetchEmployees();
        setEmployees(list);
      } catch {
        /* silent */
      }
    })();
  }, []);

  const goToProfile = () => navigate("/admin/profile");
  const goToNotifications = () => navigate("/admin/notifications");

  const fmt = (d: string | Date) =>
    new Date(d).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const preview = notifs.slice(0, 6);

  // Compose handlers
  const openCompose = () => setShowCompose(true);
  const closeCompose = () => {
    setShowCompose(false);
    setNewNotification({ userId: 0, message: "" });
  };
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.userId || !newNotification.message.trim()) return;
    try {
      setSubmitting(true);

      // QUICK FIX: on envoie un NotificationDTO complet
      const payload: NotificationDTO = {
        // id?: number (laisse au backend)
        userId: newNotification.userId,
        message: newNotification.message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await createNotification(payload);

      closeCompose();
      await loadNotifications();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar
        variant="dark"
        expand="lg"
        sticky="top"
        data-bs-theme="dark"
        className="shadow-sm"
        style={{
          backgroundColor: "#111827",
          borderBottom: `3px solid ${accentRed}`,
        }}
      >
        <Container fluid>
          <Navbar.Brand
            onClick={() => navigate("/admin/dashboard")}
            style={{ cursor: "pointer", fontWeight: 700, letterSpacing: 0.3 }}
            className="text-light"
          >
            {title}
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="admin-topbar"
            className="border-0 text-light"
          />

          <Navbar.Collapse id="admin-topbar">
            <Nav className="ms-auto align-items-center">
              {/* Compose Notification Button */}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tt-send">Envoyer une notification</Tooltip>}
              >
                <Button
                  variant="link"
                  className="text-light me-2 p-0 d-flex align-items-center"
                  onClick={openCompose}
                  aria-label="Envoyer une notification"
                >
                  <MdSend size={22} />
                </Button>
              </OverlayTrigger>

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
                    <BsBadge
                      bg="danger"
                      pill
                      className="position-absolute translate-middle"
                      style={{ top: 6, right: -2 }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </BsBadge>
                  ) : null}
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="shadow rounded-4 p-0 overflow-hidden dropdown-menu-dark"
                  style={
                    {
                      minWidth: 320,
                      "--bs-dropdown-bg": "#111827",
                      "--bs-dropdown-link-color": "#e5e7eb",
                      "--bs-dropdown-link-hover-bg": "#1f2937",
                      "--bs-dropdown-link-hover-color": "#ffffff",
                      "--bs-dropdown-border-color": "rgba(255,255,255,0.08)",
                    } as React.CSSProperties
                  }
                >
                  <div className="px-3 pt-3 pb-2 d-flex justify-content-between align-items-center text-light">
                    <span className="fw-semibold">Notifications</span>
                    <BsBadge bg={unreadCount ? "danger" : "secondary"} pill>
                      {unreadCount}
                    </BsBadge>
                  </div>

                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {error && (
                      <div className="px-3 py-3 text-danger small">{error}</div>
                    )}
                    {!error && preview.length === 0 && !loading && (
                      <div className="px-3 py-3 text-secondary small">
                        No notifications
                      </div>
                    )}
                    {!error &&
                      preview.map((n) => (
                        <Dropdown.Item
                          key={n.id}
                          className="py-2"
                          onClick={goToNotifications}
                          style={{
                            whiteSpace: "normal",
                            backgroundColor: n.read
                              ? undefined
                              : "rgba(177, 30, 47, 0.1)",
                          }}
                        >
                          <div className="fw-semibold text-light">
                            {n.message ?? "Notification"}
                          </div>
                          <div className="small text-secondary mt-1">
                            {fmt(n.createdAt)}
                          </div>
                        </Dropdown.Item>
                      ))}
                  </div>

                  <div
                    className="px-3 py-2 border-top"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <Button
                      variant="outline-light"
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

                <Dropdown.Menu
                  className="shadow rounded-4 overflow-hidden dropdown-menu-dark"
                  style={
                    {
                      "--bs-dropdown-bg": "#111827",
                      "--bs-dropdown-link-color": "#e5e7eb",
                      "--bs-dropdown-link-hover-bg": "#1f2937",
                      "--bs-dropdown-link-hover-color": "#ffffff",
                      "--bs-dropdown-border-color": "rgba(255,255,255,0.08)",
                    } as React.CSSProperties
                  }
                >
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
      </Navbar>

      {/* Modal: Envoyer une notification */}
      <Modal show={showCompose} onHide={closeCompose} centered>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Envoyer une notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Collaborateur</Form.Label>
              <Typeahead
                id="employee-typeahead"
                labelKey="label"
                options={employeeOptions}
                placeholder="Rechercher par nom, matricule…"
                clearButton
                highlightOnlyResult
                onChange={(sel) => {
                  const picked = (sel[0] as EmployeeOption | undefined)?.id ?? 0;
                  setNewNotification((n) => ({ ...n, userId: picked }));
                }}
                selected={
                  newNotification.userId
                    ? employeeOptions.filter((o) => o.id === newNotification.userId)
                    : []
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification((n) => ({ ...n, message: e.target.value }))
                }
                placeholder="Saisissez votre message…"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="justify-content-end">
            <Button variant="secondary" onClick={closeCompose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                submitting ||
                !newNotification.userId ||
                !newNotification.message.trim()
              }
            >
              {submitting ? <Spinner size="sm" animation="border" /> : "Envoyer"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AdminTopbar;
