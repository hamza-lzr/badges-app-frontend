import React from "react";
import { Modal, Button, Badge as BsBadge } from "react-bootstrap";
import type { CongeDTO } from "../../types";

interface CongeDetailsModalProps {
  show: boolean;
  onHide: () => void;
  conge: CongeDTO | null;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const renderStatusBadge = (status?: string) => {
    switch (status) {
        case "APPROVED":
        return <BsBadge bg="success">Approuvé</BsBadge>;
        case "REJECTED":
        return <BsBadge bg="danger">Rejeté</BsBadge>;
        default:
        return <BsBadge bg="warning" text="dark">En attente</BsBadge>;
    }
};

const CongeDetailsModal: React.FC<CongeDetailsModalProps> = ({ show, onHide, conge }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Détails du Congé</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {conge && (
          <>
            <p className="mb-2">
              <strong>Durée:</strong> du {formatDate(conge.startDate)} au {formatDate(conge.endDate)}
            </p>
            <p className="mb-2">
              <strong>Statut:</strong> {renderStatusBadge(conge.status)}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {conge.description || "N/A"}
            </p>
            <p className="mb-0">
              <strong>Soumise le:</strong> {formatDate(conge.createdAt)}
            </p>
          </>
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

export default CongeDetailsModal;
