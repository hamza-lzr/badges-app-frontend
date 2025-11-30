import React from "react";
import { Modal, Button } from "react-bootstrap";
import type { NotificationDTO, UserDTO } from "../../types";

interface ViewNotificationModalProps {
  show: boolean;
  onHide: () => void;
  selected: NotificationDTO | null;
  employees: UserDTO[];
}

const ViewNotificationModal: React.FC<ViewNotificationModalProps> = ({
  show,
  onHide,
  selected,
  employees,
}) => {
  const employee = selected ? employees.find((e) => e.id === selected.userId) : null;
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "—";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Notification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selected && (
          <div className="d-flex flex-column gap-2">
            <div>
              <strong>Collaborateur:</strong> {employeeName}
            </div>
            <div>
              <strong>Statut:</strong> {selected.read ? "Lu" : "Non lu"}
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
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewNotificationModal;
