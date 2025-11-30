import React from "react";
import { Table, Button } from "react-bootstrap";
import type { AccessDTO } from "../../types";

// Temporarily define OwnerInfo here if not in global types yet
type OwnerInfo = { fullName: string; firstName: string; lastName: string; matricule?: string; };

interface AccessesTableViewProps {
  accesses: AccessDTO[];
  badgesMap: Map<number, string>;
  badgeOwnerMap: Map<number, OwnerInfo>;
  airportsMap: Map<number, string>;
  onEdit: (access: AccessDTO) => void;
  onDelete: (id: number) => void;
}

const AccessesTableView: React.FC<AccessesTableViewProps> = ({
  accesses,
  badgesMap,
  badgeOwnerMap,
  airportsMap,
  onEdit,
  onDelete,
}) => {
  return (
    <Table bordered hover responsive className="shadow-sm rounded-4 align-middle">
      <thead className="table-dark">
        <tr>
          <th>Badge (Collaborateur)</th>
          <th>Aéroport</th>
          <th>Début</th>
          <th>Fin</th>
          <th style={{ width: 150 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {accesses.map((a) => (
          <tr key={a.id}>
            <td>
              <strong>
                {badgesMap.get(a.badgeId) || 'N/A'} ({badgeOwnerMap.get(a.badgeId)?.fullName || 'N/A'})
              </strong>
            </td>
            <td>{airportsMap.get(a.airportId) || 'N/A'}</td>
            <td>{a.startDate}</td>
            <td>{a.endDate}</td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="rounded-pill"
                  onClick={() => onEdit(a)}
                >
                  <i className="bi bi-pencil" />
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="rounded-pill"
                  onClick={() => onDelete(a.id!)}
                >
                  <i className="bi bi-trash" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AccessesTableView;
