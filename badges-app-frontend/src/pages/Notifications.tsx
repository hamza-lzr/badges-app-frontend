import React, { useEffect, useState, useMemo } from "react";
import {
  fetchNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import type { NotificationDTO, UserDTO } from "../types";
import {
  Modal,
  Button,
  Form,
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Pagination,
} from "react-bootstrap";

const Notifications: React.FC = () => {
  // --- Data ---
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // --- Filters state ---
  const [filterUserId, setFilterUserId] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [filterFrom, setFilterFrom] = useState<string>(""); // yyyy‑mm‑dd
  const [filterTo, setFilterTo] = useState<string>("");

  // --- Pagination state ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Modal state ---
  const [showModal, setShowModal] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<NotificationDTO>>({
    message: "",
    userId: 0,
    read: false,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadNotifications();
    loadEmployees();
  }, []);

  useEffect(() => {
    const map: Record<number, string> = {};
    employees.forEach((e) => {
      map[e.id] = `${e.firstName} ${e.lastName} (${e.matricule})`;
    });
    setUserMap(map);
  }, [employees]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    const data = await fetchEmployees();
    setEmployees(data);
  };

  // --- Handlers for create, delete, mark as read (unchanged) ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.message || !newNotification.userId) return;
    await createNotification(newNotification as NotificationDTO);
    setShowModal(false);
    setNewNotification({ message: "", userId: 0, read: false, createdAt: new Date().toISOString() });
    loadNotifications();
  };
  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete this notification?")) return;
    await deleteNotification(id);
    loadNotifications();
  };
  const handleMarkAsRead = async (id?: number) => {
    if (!id) return;
    await markNotificationAsRead(id);
    loadNotifications();
  };

  // --- Apply filters ---
  const filtered = useMemo(() => {
    return notifications
      .filter((n) => {
        // by user
        if (filterUserId && n.userId !== filterUserId) return false;
        // by status
        if (filterStatus === "read" && !n.read) return false;
        if (filterStatus === "unread" && n.read) return false;
        // by date range
        const created = new Date(n.createdAt).toISOString().slice(0, 10);
        if (filterFrom && created < filterFrom) return false;
        if (filterTo && created > filterTo) return false;
        return true;
      });
  }, [notifications, filterUserId, filterStatus, filterFrom, filterTo]);

  // --- Pagination logic ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-3">
        <Col><h2>Notifications</h2></Col>
        <Col className="text-end">
          <Button onClick={() => setShowModal(true)}>Add Notification</Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md>
              <Form.Label>From</Form.Label>
              <Form.Control
                type="date"
                value={filterFrom}
                onChange={(e) => { setFilterFrom(e.target.value); setCurrentPage(1); }}
              />
            </Col>
            <Col md>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="date"
                value={filterTo}
                onChange={(e) => { setFilterTo(e.target.value); setCurrentPage(1); }}
              />
            </Col>
            <Col md>
              <Form.Label>User</Form.Label>
              <Form.Select
                value={filterUserId}
                onChange={(e) => { setFilterUserId(Number(e.target.value) || ""); setCurrentPage(1); }}
              >
                <option value="">All users</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table hover responsive className="shadow-sm rounded">
            <thead className="table-light">
              <tr>
                <th>Message</th>
                <th>User</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((n) => (
                <tr key={n.id}>
                  <td>{n.message}</td>
                  <td>{userMap[n.userId] || "—"}</td>
                  <td>
                    <Badge bg={n.read ? "success" : "warning"} text={n.read ? undefined : "dark"}>
                      {n.read ? "Read" : "Unread"}
                    </Badge>
                  </td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="text-end">
                    {!n.read && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleMarkAsRead(n.id)}
                        className="me-2"
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(n.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No notifications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}

      {/* Add-Notification Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, message: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select
                value={newNotification.userId || ""}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, userId: Number(e.target.value) })
                }
                required
              >
                <option value="">Select user</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Notifications;
