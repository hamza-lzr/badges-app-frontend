import React from "react";
import { Table, Badge, Button } from "react-bootstrap";
import { BiSearch, BiUser } from "react-icons/bi";
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

interface EmployeeTableProps {
  employees: UserDTO[];
  onStatusChange: (employee: UserDTO, newStatus: Status) => void;
  onEdit: (employee: UserDTO) => void;
  onSelect: (employee: UserDTO) => void;
  getCompanyName: (id: number) => string;
  sortKey: keyof UserDTO;
  sortAsc: boolean;
  onSort: (key: keyof UserDTO) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onStatusChange,
  onEdit,
  onSelect,
  getCompanyName,
  sortKey,
  sortAsc,
  onSort,
}) => {
  return (
    <div
      className="table-responsive"
      style={{ borderRadius: "15px", overflow: "hidden" }}
    >
      <Table hover className="mb-0 align-middle" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "10%" }} /> {/* Matricule */}
          <col style={{ width: "12%" }} /> {/* Employé */}
          <col style={{ width: "12%" }} /> {/* Email */}
          <col style={{ width: "12%" }} /> {/* Téléphone */}
          <col style={{ width: "10%" }} /> {/* Entreprise */}
          <col style={{ width: "8%" }} /> {/* Badges */}
          <col style={{ width: "8%" }} /> {/* Statut */}
          <col style={{ width: "16%" }} /> {/* Actions */}
        </colgroup>

        <thead className="table-dark">
          <tr>
            <th
              className="px-4 py-3 fw-semibold border-0 text-truncate"
              style={{ cursor: "pointer" }}
              onClick={() => onSort("matricule")}
              title="Trier par matricule"
            >
              Matricule {sortKey === "matricule" && (sortAsc ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-3 fw-semibold border-0 text-truncate"
              style={{ cursor: "pointer" }}
              onClick={() => onSort("firstName")}
              title="Trier par nom"
            >
              Nom Complet {sortKey === "firstName" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="px-4 py-3 fw-semibold border-0 text-truncate">Email</th>
            <th className="px-4 py-3 fw-semibold border-0 text-truncate">Téléphone</th>
            <th
              className="px-4 py-3 fw-semibold border-0 text-truncate"
              style={{ cursor: "pointer" }}
              onClick={() => onSort("companyId")}
              title="Trier par entreprise"
            >
              Entreprise {sortKey === "companyId" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">Badges</th>
            <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">Statut</th>
            <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-5">
                <div className="text-muted">
                  <BiSearch size={48} className="mb-3 opacity-50" />
                  <p className="fs-5 mb-0">Aucun collaborateur trouvé</p>
                  <small>Essayez d’ajuster vos filtres</small>
                </div>
              </td>
            </tr>
          ) : (
            employees.map((emp, idx) => (
              <tr
                key={emp.id}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-light"} border-0`}
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                onClick={() => onSelect(emp)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f8f9fa";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <td className="px-4 py-3 text-truncate" title={emp.matricule || "—"}>
                  {emp.matricule || "—"}
                </td>
                <td className="px-4 py-3 text-truncate">
                  <div className="d-flex align-items-center gap-2">
                    <BiUser className="text-secondary" />
                    <div className="fw-semibold text-dark text-truncate" title={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-truncate" title={emp.email}>
                  {emp.email}
                </td>
                <td className="px-4 py-3 text-truncate" title={emp.phone || "—"}>
                  {emp.phone || "—"}
                </td>
                <td className="px-4 py-3 text-truncate" title={getCompanyName(emp.companyId)}>
                  {getCompanyName(emp.companyId)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge bg="info" className="px-2 py-1">
                    {emp.badgesIds.length} Badge{emp.badgesIds.length !== 1 ? "s" : ""}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge bg={statusBadgeVariant(emp.status)} className="px-3 py-2 fw-semibold">
                    {translateEmpStatus(emp.status)}
                  </Badge>
                </td>
                <td className="px-2 py-2">
                  <div
                    className="gap-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "8px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="success"
                      className="w-100 fw-semibold"
                      style={{ minHeight: 34 }}
                      onClick={() => onStatusChange(emp, "ACTIVE")}
                      disabled={emp.status === "ACTIVE"}
                    >
                      Activer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="w-100 fw-semibold"
                      style={{ minHeight: 34 }}
                      onClick={() => onStatusChange(emp, "INACTIVE")}
                      disabled={emp.status === "INACTIVE"}
                    >
                      Désactiver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="w-100 fw-semibold"
                      style={{ minHeight: 34 }}
                      onClick={() => onStatusChange(emp, "BLOCKED")}
                      disabled={emp.status === "BLOCKED"}
                    >
                      Bloquer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="w-100 fw-semibold"
                      style={{ minHeight: 34 }}
                      onClick={() => onEdit(emp)}
                    >
                      Modifier
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
