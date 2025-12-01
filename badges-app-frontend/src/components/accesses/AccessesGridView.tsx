import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import type { AccessDTO } from "../../types";

type OwnerInfo = {
  fullName: string;
  firstName: string;
  lastName: string;
  matricule?: string;
};

interface AccessesGridViewProps {
  accesses: AccessDTO[];
  airportsMap: Record<number, string>;
  badgesMap: Record<number, string>;
  badgeOwnerMap: Record<number, OwnerInfo>;
  onEdit: (access: AccessDTO) => void;
  onDelete: (id: number) => void;
}

const AccessesGridView: React.FC<AccessesGridViewProps> = ({
  accesses,
  airportsMap,
  badgesMap,
  badgeOwnerMap,
  onEdit,
  onDelete,
}) => {
  return (
    <Row className="g-4">
      {accesses.map((a) => (
        <Col key={a.id} xs={12} md={6} lg={4}>
          <Card className="shadow-sm h-100 rounded-4 hover-shadow border-0">
            <Card.Body>
              <Card.Title className="fw-bold text-primary">
                Collaborateur {badgeOwnerMap[a.badgeId]?.fullName} (
                {badgesMap[a.badgeId]}) @ {airportsMap[a.airportId]}
              </Card.Title>
              <Card.Text>
                <strong>Début:</strong> {a.startDate}
                <br />
                <strong>Fin:</strong> {a.endDate}
              </Card.Text>
              <div className="d-flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="rounded-pill"
                  onClick={() => onEdit(a)}
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill"
                  onClick={() => a.id && onDelete(a.id)}
                >
                  Supprimer
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AccessesGridView;