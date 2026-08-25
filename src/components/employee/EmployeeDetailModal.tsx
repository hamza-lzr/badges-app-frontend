import React from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import type { UserDTO, Status } from "../../types";

const translateEmpStatus = (s: Status) => {
  switch (s) {
    case "ACTIVE":
      return "Actif";
    case "INACTIVE":
      return "Inactif";
    case "BLOCKED":
      return "Bloqué";
    default:
      return s;
  }
};

const statusBadgeVariant = (s: Status) =>
  s === "ACTIVE" ? "success" : s === "INACTIVE" ? "secondary" : "danger";

interface EmployeeDetailModalProps {
  show: boolean;
  onHide: () => void;
  employee: UserDTO | null;
  getCompanyName: (id: number) => string;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  show,
  onHide,
  employee,
  getCompanyName,
}) => {
  if (!employee) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-gradient text-black" style={{ background: "linear-gradient(135deg, #343a40 0%, #495057 100%)" }}>
        <Modal.Title className="fw-bold">Détails du collaborateur</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row className="g-4">
          <Col md={6}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="text-secondary mb-2">Identité</h6>
                <p className="mb-1 fw-semibold">
                  {employee.firstName} {employee.lastName}
                </p>
                <small className="text-muted">
                  Matricule : {employee.matricule || "—"}
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="text-secondary mb-2">Entreprise</h6>
                <p className="mb-0">
                  {getCompanyName(employee.companyId)}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <div>
              <h6 className="text-secondary mb-2">Contact</h6>
              <p className="mb-1">{employee.email}</p>
              <small className="text-muted">
                Tél : {employee.phone || "—"}
              </small>
            </div>
          </Col>
          <Col md={6}>
            <div>
              <h6 className="text-secondary mb-2">Statut</h6>
              <Badge
                bg={statusBadgeVariant(employee.status)}
                className="px-3 py-2 fw-semibold"
              >
                {translateEmpStatus(employee.status)}
              </Badge>
            </div>
          </Col>
          <Col md={6}>
            <div>
              <h6 className="text-secondary mb-2">Badges</h6>
              <Badge bg="info" className="px-3 py-2">
                {employee.badgesIds.length} Badge
                {employee.badgesIds.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeDetailModal;
