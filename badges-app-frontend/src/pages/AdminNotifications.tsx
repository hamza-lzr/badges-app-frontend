import React, { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import type { NotificationDTO } from "../types";
import { Spinner, Pagination, Modal, Button } from "react-bootstrap";
import { formatDistanceToNow, format } from "date-fns";

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Employees → to map userId to full name


  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationDTO | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const [notifs] = await Promise.all([
          fetchMyNotifications(),
          fetchEmployees(),
        ]);

        const sorted = [...notifs].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);

        // Optional: mark all as read on load. Remove if you want unread dots to persist.
        await markAllNotificationsAsRead();
      } catch (err) {
        console.error("Failed to load notifications or employees", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleOpenNotification = async (notif: NotificationDTO) => {
    setSelectedNotif(notif);
    setShowModal(true);

    if (!notif.read && notif.id) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotif(null);
  };

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold" style={{ color: "#333333" }}>Mes Notifications</h3>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-muted">✅ Vous n'avez pas de notifications.</p>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {paginatedNotifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  className="p-3 rounded shadow-sm hover-shadow"
                  style={{
                    background: isUnread ? "#f8f9fa" : "#fff",
                    border: "1px solid #e9ecef",
                    transition: "0.2s ease-in-out",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenNotification(notif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleOpenNotification(notif);
                  }}
                >
                  <div className="d-flex align-items-start">
                    <div
                      className="me-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 40,
                        height: 40,
                        background: isUnread ? "#0d6efd22" : "#e9ecef",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className="bi bi-bell-fill"
                        style={{
                          fontSize: "1.2rem",
                          color: isUnread ? "#0d6efd" : "#6c757d",
                        }}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <p
                        className="mb-1"
                        style={{
                          fontWeight: isUnread ? 600 : 400,
                          color: "#212529",
                        }}
                      >
                        {notif.message}
                      </p>
                      <small className="text-muted">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </small>
                    </div>

                    {isUnread && (
                      <span
                        className="ms-2 rounded-circle bg-primary"
                        style={{ width: 10, height: 10, display: "inline-block" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Pagination className="shadow-sm rounded-pill">
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                  className="rounded-pill"
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}

      {/* Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotif && (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>Message:</strong>
                <div className="mt-1">{selectedNotif.message}</div>
              </div>


              {/* Keep ID if useful for debugging; hide if not needed */}
              {/* <div><strong>ID:</strong> {selectedNotif.id ?? "—"}</div> */}

              <div>
                <strong>Statut:</strong> {selectedNotif.read ? "Lu" : "Non lu"}
              </div>
              <div>
                <strong>Créé:</strong>{" "}
                {format(new Date(selectedNotif.createdAt), "PPpp")} (
                {formatDistanceToNow(new Date(selectedNotif.createdAt), { addSuffix: true })})
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          body { font-family: 'Roboto', sans-serif; }
          h3 { font-weight: 700; }
          .hover-shadow:hover { box-shadow: 0px 4px 12px rgba(0,0,0,0.1); }
          .rounded-pill { border-radius: 50px; }
        `}
      </style>
    </div>
  );
};

export default AdminNotificationsPage;
