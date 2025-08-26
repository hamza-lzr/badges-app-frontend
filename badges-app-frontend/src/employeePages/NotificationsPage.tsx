import React, { useEffect, useState } from "react";
import { fetchMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../api/apiNotification";
import type { NotificationDTO } from "../types";
import { Spinner, Pagination } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns"; // ✅ for "2 hours ago" style

const EmployeeNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of notifications per page

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchMyNotifications();

        // ✅ Sort newest first (most recent date → first)
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setNotifications(sorted);

        // ✅ Mark all as read after loading
        await markAllNotificationsAsRead();
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id?: number) => {
    if (!id) return;
    await markNotificationAsRead(id);
  };

  // Pagination logic
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        <p className="text-center text-muted">✅ You have no notifications.</p>
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
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <div className="d-flex align-items-start">
                    {/* ✅ Icon for notification */}
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
                      ></i>
                    </div>

                    {/* ✅ Message & time */}
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
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </small>
                    </div>

                    {/* ✅ Unread dot */}
                    {isUnread && (
                      <span
                        className="ms-2 rounded-circle bg-primary"
                        style={{
                          width: 10,
                          height: 10,
                          display: "inline-block",
                        }}
                      ></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <Pagination className="shadow-sm rounded-pill">
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                  className="rounded-pill"
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          h3 {
            font-weight: 700;
          }

          .hover-shadow:hover {
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
          }

          .rounded-pill {
            border-radius: 50px;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeNotificationsPage;

