import React from "react";
import { Table, Badge as BsBadge, Button } from "react-bootstrap";
import type { CongeDTO } from "../../types";

interface CongesTableViewProps {
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

const CongesTableView: React.FC<CongesTableViewProps> = ({ conges, onCongeClick }) => {
  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead className="table-dark">
            <tr>
              <th>Durée</th>
              <th>Statut</th>
              <th>Description</th>
              <th>Soumise le</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {conges.map((c) => (
              <tr key={c.id}>
                <td className="fw-semibold">
                  du {formatDate(c.startDate)} au {formatDate(c.endDate)}
                </td>
                <td>{renderStatusBadge(c.status)}</td>
                <td className="text-secondary">
                  {c.description || <span className="text-muted">Aucune description</span>}
                </td>
                <td className="text-muted">{formatDate(c.createdAt)}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onCongeClick(c)}
                  >
                    Voir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CongesTableView;
