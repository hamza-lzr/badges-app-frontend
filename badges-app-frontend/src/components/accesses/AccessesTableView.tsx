import React from "react";
import { Table, Button } from "react-bootstrap";
import type { AccessDTO } from "../../types";

type OwnerInfo = {
  fullName: string;
  firstName: string;
  lastName: string;
  matricule?: string;
};

interface AccessesTableViewProps {
  accesses: AccessDTO[];
  airportsMap: Record<number, string>;
  badgesMap: Record<number, string>;
  badgeOwnerMap: Record<number, OwnerInfo>;
  onEdit: (access: AccessDTO) => void;
  onDelete: (id: number) => void;
}

const AccessesTableView: React.FC<AccessesTableViewProps> = ({
  accesses,
  airportsMap,
  badgesMap,
  badgeOwnerMap,
  onEdit,
  onDelete,
}) => {
  return (
    <Table
      bordered
      hover
      responsive
      className="shadow-sm rounded-4 align-middle"
    >
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
                {badgesMap[a.badgeId]} (
                {badgeOwnerMap[a.badgeId]?.fullName})
              </strong>
            </td>
            <td>{airportsMap[a.airportId]}</td>
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
                  onClick={() => a.id && onDelete(a.id)}
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