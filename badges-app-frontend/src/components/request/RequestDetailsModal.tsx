import React from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import type { Request, ReqStatus } from "../../types";

const translateStatus = (status: ReqStatus): string => {
    switch (status) {
      case "PENDING": return "En attente";
      case "APPROVED": return "Approuvé";
      case "REJECTED": return "Rejeté";
      default: return status;
    }
  };

const badgeVariant = (status: ReqStatus) =>
  status === "PENDING"
    ? "warning"
    : status === "APPROVED"
    ? "success"
    : "danger";

interface RequestDetailsModalProps {
  show: boolean;
  onHide: () => void;
  request: Request | null;
  getEmployeeName: (userId: number) => string;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  show,
  onHide,
  request,
  getEmployeeName,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-gradient text-white modal-header-custom">
        <Modal.Title className="fw-bold">Détails de la demande</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {request && (
          <Row className="g-4">
            <Col md={12}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h6 className="text-secondary mb-2">Description</h6>
                  <p className="mb-0">{request.description}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <div>
                <h6 className="text-secondary mb-2">Type de demande</h6>
                <Badge bg="info" className="px-3 py-2 text-capitalize">
                  {request.reqType.replace("_", " ").toLowerCase()}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <h6 className="text-secondary mb-2">Statut</h6>
                <Badge bg={badgeVariant(request.reqStatus)} className="px-3 py-2 fw-semibold">
                  {translateStatus(request.reqStatus)}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <h6 className="text-secondary mb-2">Employé</h6>
                <p className="mb-0 fw-semibold">
                  {getEmployeeName(request.userId)}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <h6 className="text-secondary mb-2">Créée le</h6>
                <p className="mb-0">
                  {new Date(request.createdAt).toLocaleString([], {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit", hour12: false,
                  })}
                </p>
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequestDetailsModal;
