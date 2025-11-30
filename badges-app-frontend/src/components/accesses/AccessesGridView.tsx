import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import type { AccessDTO, OwnerInfo } from "../../types";

interface AccessesGridViewProps {
  accesses: AccessDTO[];
  badgesMap: Map<number, string>;
  badgeOwnerMap: Map<number, OwnerInfo>;
  airportsMap: Map<number, string>;
  onEdit: (access: AccessDTO) => void;
  onDelete: (id: number) => void;
}

const AccessesGridView: React.FC<AccessesGridViewProps> = ({
  accesses,
  badgesMap,
  badgeOwnerMap,
  airportsMap,
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
                {badgeOwnerMap.get(a.badgeId)?.fullName || 'N/A'} ({badgesMap.get(a.badgeId) || 'N/A'}) @ {airportsMap.get(a.airportId) || 'N/A'}
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
                  onClick={() => onDelete(a.id!)}
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
