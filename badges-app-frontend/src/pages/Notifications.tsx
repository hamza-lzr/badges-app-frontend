import React, { useEffect, useState } from "react";
import { fetchNotifications, createNotification, deleteNotification, markNotificationAsRead } from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import type { NotificationDTO, UserDTO } from "../types";
import { Modal, Button, Form } from "react-bootstrap";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // For user lookup
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [userMap, setUserMap] = useState<Record<number, { fullName: string; matricule: string }>>({});

  // Modal state for creating a notification
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
    // Build user map after employees are loaded
    const map: Record<number, { fullName: string; matricule: string }> = {};
    employees.forEach(emp => {
      map[emp.id] = { fullName: `${emp.firstName} ${emp.lastName}`, matricule: emp.matricule };
    });
    setUserMap(map);
  }, [employees]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.message || !newNotification.userId) return;
    try {
      await createNotification(newNotification as NotificationDTO);
      setShowModal(false);
      setNewNotification({ message: "", userId: 0, read: false, createdAt: new Date().toISOString() });
      loadNotifications();
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleMarkAsRead = async (id?: number) => {
    if (!id) return;
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Notification
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-info text-center">No notifications found.</div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Message</th>
                <th>User</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ width: "20%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td>{n.message}</td>
                  <td>
                    {userMap[n.userId]
                      ? (
                        <>
                          <span>{userMap[n.userId].fullName}</span>
                          <br />
                          <small className="text-muted">Matricule: {userMap[n.userId].matricule}</small>
                        </>
                      )
                      : <span className="text-danger">Unknown User</span>
                    }
                  </td>
                  <td>
                    {n.read ? (
                      <span className="badge bg-success">Read</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Unread</span>
                    )}
                  </td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {!n.read && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleMarkAsRead(n.id)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add Notification */}
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
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} (Matricule: {emp.matricule})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Notifications;