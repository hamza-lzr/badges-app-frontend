import React from "react";
import { Row, Col, Card, Badge as BsBadge } from "react-bootstrap";
import type { CongeDTO } from "../../types";

interface CongesCardViewProps {
  conges: CongeDTO[];
  onCongeClick: (conge: CongeDTO) => void;
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

const CongesCardView: React.FC<CongesCardViewProps> = ({ conges, onCongeClick }) => {
  return (
    <Row className="g-4">
      {conges.map((conge) => (
        <Col key={conge.id} xs={12} sm={6} md={4}>
          <Card
            className="shadow-sm h-100 border-0 rounded-4"
            style={{ cursor: "pointer" }}
            onClick={() => onCongeClick(conge)}
          >
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title className="fw-bold text-primary mb-0">
                  {formatDate(conge.startDate)} → {formatDate(conge.endDate)}
                </Card.Title>
                {renderStatusBadge(conge.status)}
              </div>
              <div className="small text-muted mb-2">
                Soumise le: {formatDate(conge.createdAt)}
              </div>
              <Card.Text className="text-secondary" style={{ minHeight: 48 }}>
                {conge.description || <span className="text-muted">Aucune description</span>}
              </Card.Text>
              <div className="mt-auto d-flex justify-content-end">
                <i className="bi bi-chevron-right text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CongesCardView;
