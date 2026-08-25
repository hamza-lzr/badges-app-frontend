import React, { useState } from "react";
import { Button, Row, Col } from "react-bootstrap";

import type { NotificationDTO } from "../types";
import { useNotificationsData } from "../hooks/useNotificationsData";

import NotificationFilters from "../components/notification/NotificationFilters";
import NotificationsTable from "../components/notification/NotificationsTable";
import CreateNotificationModal from "../components/notification/CreateNotificationModal";
import ViewNotificationModal from "../components/notification/ViewNotificationModal";

import "./Notifications.css"; // Import the new CSS file

const Notifications: React.FC = () => {
  const {
    employees,
    companies, // Re-introduced companies
    loading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    paginated,
    totalPages,
    employeeOptions,
    handleDelete,
    handleMarkAsRead,
    handleCreate,
  } = useNotificationsData();

  // Component-specific modal states and handlers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDTO | null>(null);

  const [newNotification, setNewNotification] = useState<
    Partial<NotificationDTO>
  >({
    message: "",
    userId: 0,
    read: false,
    createdAt: new Date().toISOString(),
  });

  const handleSubmitNewNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreate(newNotification);
    setShowCreateModal(false);
    setNewNotification({
      message: "",
      userId: 0,
      read: false,
      createdAt: new Date().toISOString(),
    });
  };

  const openViewModal = (notification: NotificationDTO) => {
    setSelectedNotification(notification);
    setShowViewModal(true);
  };
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedNotification(null);
  };

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Notifications History</h2>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setShowCreateModal(true)}>
            Envoyer une notification
          </Button>
        </Col>
      </Row>

      <NotificationFilters
        filters={filters}
        setFilters={setFilters}
        setCurrentPage={setCurrentPage}
      />

      <NotificationsTable
        loading={loading}
        paginated={paginated}
        employees={employees}
        companies={companies} // Pass companies prop
        handleDelete={handleDelete}
        handleMarkAsRead={handleMarkAsRead}
        openView={openViewModal}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <CreateNotificationModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        newNotification={newNotification}
        setNewNotification={setNewNotification}
        handleCreate={handleSubmitNewNotification}
        employeeOptions={employeeOptions}
      />

      <ViewNotificationModal
        show={showViewModal}
        onHide={closeViewModal}
        selected={selectedNotification}
        employees={employees}
      />
    </div>
  );
};

export default Notifications;

