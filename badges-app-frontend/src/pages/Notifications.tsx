import React, { useEffect, useState, useMemo } from "react";
import {
  fetchNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import { fetchCompanies } from "../api/apiCompany";

import type { CompanyDTO, NotificationDTO, UserDTO } from "../types";
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
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Filters state ---
  // Remove the plain select for user id and add query fields
  const [filterUserQuery, setFilterUserQuery] = useState<string>("");
  const [filterCompanyQuery, setFilterCompanyQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");
  const [filterFrom, setFilterFrom] = useState<string>(""); // yyyy-mm-dd
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
    loadCompanies();
  }, []);

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

  const loadCompanies = async () => {
  try {
    const data = await fetchCompanies();
    setCompanies(data);
  } catch (err) {
    console.error("Error loading companies:", err);
  }
};

  // --- Handlers for create, delete, mark as read ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.message || !newNotification.userId) return;
    await createNotification(newNotification as NotificationDTO);
    setShowModal(false);
    setNewNotification({
      message: "",
      userId: 0,
      read: false,
      createdAt: new Date().toISOString(),
    });
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

  // --- Apply filters and sort (newest to oldest) ---
  const filtered = useMemo(() => {
    const result = notifications.filter((n) => {
      // Filter by status
      if (filterStatus === "read" && !n.read) return false;
      if (filterStatus === "unread" && n.read) return false;

      // Filter by date range
      const created = new Date(n.createdAt).toISOString().slice(0, 10);
      if (filterFrom && created < filterFrom) return false;
      if (filterTo && created > filterTo) return false;

      // Filter by employee search (name or matricule)
      if (filterUserQuery) {
        const emp = employees.find((e) => e.id === n.userId);
        if (emp) {
          const searchTarget = `${emp.firstName} ${emp.lastName} ${emp.matricule}`.toLowerCase();
          if (!searchTarget.includes(filterUserQuery.toLowerCase())) return false;
        } else {
          return false;
        }
      }

      // Filter by company search
if (filterCompanyQuery) {
  const emp = employees.find((e) => e.id === n.userId);
  if (emp) {
    // Look up the company using the employee's companyId
    const company = companies.find((c) => c.id === emp.companyId);
    // Assuming the company object has a 'name' property
    if (!company || !company.name.toLowerCase().includes(filterCompanyQuery.toLowerCase()))
      return false;
  } else {
    return false;
  }
}

      return true;
    });

    // Sort by createdAt descending (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [notifications, filterStatus, filterFrom, filterTo, filterUserQuery, filterCompanyQuery, employees]);

  // --- Pagination logic ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-3">
        <Col><h2>Notifications History</h2></Col>
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
              <Form.Label>Employee Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name or matricule"
                value={filterUserQuery}
                onChange={(e) => { setFilterUserQuery(e.target.value); setCurrentPage(1); }}
              />
            </Col>
            <Col md>
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by company"
                value={filterCompanyQuery}
                onChange={(e) => { setFilterCompanyQuery(e.target.value); setCurrentPage(1); }}
              />
            </Col>
            <Col md>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as "all" | "read" | "unread"); setCurrentPage(1); }}
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
              {paginated.map((n) => {
                const emp = employees.find((e) => e.id === n.userId);
                return (
                  <tr key={n.id}>
                    <td>{n.message}</td>
                    <td>{emp ? `${emp.firstName} ${emp.lastName} (${emp.matricule})` : "—"}</td>
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
                );
              })}
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
                    {emp.firstName} {emp.lastName} ({emp.matricule})
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