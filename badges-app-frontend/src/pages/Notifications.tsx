// ✅ Refactored & optimized Notifications page based on guidelines
// - Extracted logic
// - Cleaned up filters
// - Split rendering sections
// - Optimized filtering using maps

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

const ITEMS_PER_PAGE = 10;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    user: "",
    company: "",
    status: "all" as "all" | "read" | "unread",
    from: "",
    to: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [newNotification, setNewNotification] = useState<Partial<NotificationDTO>>({
    message: "",
    userId: 0,
    read: false,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [notif, emp, comp] = await Promise.all([
      fetchNotifications(),
      fetchEmployees(),
      fetchCompanies(),
    ]);
    setNotifications(notif);
    setEmployees(emp);
    setCompanies(comp);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.message || !newNotification.userId) return;
    await createNotification(newNotification as NotificationDTO);
    setShowModal(false);
    setNewNotification({ message: "", userId: 0, read: false, createdAt: new Date().toISOString() });
    loadData();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm("Delete this notification?")) return;
    await deleteNotification(id);
    loadData();
  };

  const handleMarkAsRead = async (id?: number) => {
    if (!id) return;
    await markNotificationAsRead(id);
    loadData();
  };

  const filtered = useMemo(() => {
    return notifications
      .filter((n) => {
        if (filters.status === "read" && !n.read) return false;
        if (filters.status === "unread" && n.read) return false;

        const date = new Date(n.createdAt).toISOString().slice(0, 10);
        if (filters.from && date < filters.from) return false;
        if (filters.to && date > filters.to) return false;

        const user = employees.find((e) => e.id === n.userId);
        if (filters.user && user) {
          const target = `${user.firstName} ${user.lastName} ${user.matricule}`.toLowerCase();
          if (!target.includes(filters.user.toLowerCase())) return false;
        }

        if (filters.company && user) {
          const company = companies.find((c) => c.id === user.companyId);
          if (!company || !company.name.toLowerCase().includes(filters.company.toLowerCase()))
            return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, filters, employees, companies]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

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
            {[
              { label: "From", type: "date", value: filters.from, key: "from" },
              { label: "To", type: "date", value: filters.to, key: "to" },
              { label: "Employee", type: "text", value: filters.user, key: "user", placeholder: "Name or matricule" },
              { label: "Company", type: "text", value: filters.company, key: "company" },
            ].map(({ label, type, value, key, placeholder }) => (
              <Col md key={key}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => {
                    setFilters({ ...filters, [key]: e.target.value });
                    setCurrentPage(1);
                  }}
                />
              </Col>
            ))}
            <Col md>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value as "all" | "read" | "unread" });
                  setCurrentPage(1);
                }}
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

      {/* Modal */}
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
