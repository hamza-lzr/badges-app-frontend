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
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { Typeahead } from "react-bootstrap-typeahead";

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

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationDTO | null>(null);

  type EmployeeOption = { id: number; label: string };

  const employeeOptions = useMemo<EmployeeOption[]>(
    () =>
      employees.map((emp) => {
        const company =
          companies.find((c) => c.id === emp.companyId)?.name ?? "";
        return {
          id: emp.id!,
          label: `${emp.firstName} ${emp.lastName} (${emp.matricule})${
            company ? " • " + company : ""
          }`,
        };
      }),
    [employees, companies]
  );

  const openView = (n: NotificationDTO) => {
    setSelected(n);
    setViewOpen(true);
  };
  const closeView = () => {
    setViewOpen(false);
    setSelected(null);
  };

  const [currentPage, setCurrentPage] = useState(1);

  const [newNotification, setNewNotification] = useState<
    Partial<NotificationDTO>
  >({
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
    setNewNotification({
      message: "",
      userId: 0,
      read: false,
      createdAt: new Date().toISOString(),
    });
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
          const target =
            `${user.firstName} ${user.lastName} ${user.matricule}`.toLowerCase();
          if (!target.includes(filters.user.toLowerCase())) return false;
        }

        if (filters.company && user) {
          const company = companies.find((c) => c.id === user.companyId);
          if (
            !company ||
            !company.name.toLowerCase().includes(filters.company.toLowerCase())
          )
            return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [notifications, filters, employees, companies]);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Notifications History</h2>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setShowModal(true)}>
            Envoyer une notification
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-2">
            {[
              { label: "From", type: "date", value: filters.from, key: "from" },
              { label: "To", type: "date", value: filters.to, key: "to" },
              {
                label: "Employee",
                type: "text",
                value: filters.user,
                key: "user",
                placeholder: "Name or matricule",
              },
              {
                label: "Company",
                type: "text",
                value: filters.company,
                key: "company",
              },
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
                  setFilters({
                    ...filters,
                    status: e.target.value as "all" | "read" | "unread",
                  });
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
          <Table
            hover
            responsive
            className="shadow-sm rounded custom-table"
            style={{ tableLayout: "fixed" }}
          >
            {/* Stable widths */}
            <colgroup>
              <col style={{ width: "20%" }} /> {/* Message (narrower) */}
              <col style={{ width: "20%" }} /> {/* User */}
              <col style={{ width: "12%" }} /> {/* Status */}
              <col style={{ width: "14%" }} /> {/* Created */}
              <col style={{ width: "20%" }} /> {/* Actions */}
            </colgroup>

            <thead className="table-dark">
              <tr>
                <th className="py-2">Message</th>
                <th className="py-2">User</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((n) => {
                const emp = employees.find((e) => e.id === n.userId);
                const userLabel = emp
                  ? `${emp.firstName} ${emp.lastName} (${emp.matricule})`
                  : "—";
                const createdDate = new Date(n.createdAt);

                return (
                  <tr key={n.id}>
                    {/* Message (truncated) */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`t-${n.id}`}>{n.message}</Tooltip>
                        }
                      >
                        <div className="msg-truncate" title={n.message}>
                          {n.message}
                        </div>
                      </OverlayTrigger>
                    </td>

                    {/* User */}
                    <td className="text-muted">{userLabel}</td>

                    {/* Status */}
                    <td>
                      <Badge
                        bg={n.read ? "success" : "warning"}
                        text={n.read ? undefined : "dark"}
                      >
                        {n.read ? "Read" : "Unread"}
                      </Badge>
                    </td>

                    {/* Created (clean, with relative time tooltip) */}
                    <td title={createdDate.toLocaleString()}>
                      {formatDistanceToNow(createdDate, { addSuffix: true })}
                    </td>

                    {/* Actions (fixed widths, symmetric) */}
                    <td className="text-end">
                      <div className="d-inline-grid actions-grid">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="action-btn"
                          onClick={() => openView(n)}
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-success"
                          className="action-btn"
                          onClick={() => handleMarkAsRead(n.id)}
                          disabled={!!n.read}
                        >
                          Mark as Read
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="action-btn"
                          onClick={() => handleDelete(n.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Envoyer une notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    message: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Collaborateur</Form.Label>

              <Typeahead
                id="employee-typeahead"
                labelKey="label"
                options={employeeOptions}
                placeholder="Rechercher par nom, matricule, société…"
                clearButton
                highlightOnlyResult
                onChange={(sel) => {
                  const picked =
                    (sel[0] as EmployeeOption | undefined)?.id ?? 0;
                  setNewNotification({ ...newNotification, userId: picked });
                }}
                selected={
                  newNotification.userId
                    ? employeeOptions.filter(
                        (o) => o.id === newNotification.userId
                      )
                    : []
                }
              />
              <Form.Text className="text-muted">
                Tapez pour filtrer, puis sélectionnez.
              </Form.Text>
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Envoyer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={viewOpen} onHide={closeView} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>Collaborateur:</strong>{" "}
                {employees.find((e) => e.id === selected.userId)
                  ? `${
                      employees.find((e) => e.id === selected.userId)!.firstName
                    } ${
                      employees.find((e) => e.id === selected.userId)!.lastName
                    }`
                  : "—"}
              </div>
              <div>
                <strong>StatuT:</strong> {selected.read ? "Read" : "Unread"}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selected.createdAt).toLocaleString()}
              </div>
              <hr />
              <div>
                <strong>Message:</strong>
              </div>
              <div className="p-2 bg-light rounded">{selected.message}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeView}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
  /* Single-line truncate for Message */
  .custom-table .msg-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Keep rows airy but compact */
  .custom-table tbody td, .custom-table thead th {
    padding-top: .7rem;
    padding-bottom: .7rem;
    vertical-align: middle;
  }

  /* Symmetric actions: 3 fixed buttons */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 80px); /* same width for all */
    gap: 8px;
    justify-content: end;
  }
  .action-btn { width: 100%; }

  /* Slightly smaller message column on small screens */
  @media (max-width: 992px) {
    .actions-grid { grid-template-columns: repeat(3, 96px); }
  }
`}
      </style>
    </div>
  );
};

export default Notifications;
