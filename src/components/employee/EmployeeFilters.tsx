import React from "react";
import { Row, Col, Form, InputGroup } from "react-bootstrap";
import { BiSearch, BiFilter, BiBuilding } from "react-icons/bi";
import type { Status, CompanyDTO } from "../../types";

const EMP_STATUS: Array<Status | "ALL"> = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
];

const translateEmpStatus = (s: Status | "ALL") => {
  switch (s) {
    case "ACTIVE":
      return "Actif";
    case "INACTIVE":
      return "Inactif";
    case "BLOCKED":
      return "Bloqué";
    case "ALL":
      return "Tous les statuts";
    default:
      return s;
  }
};

interface EmployeeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: Status | "ALL";
  setStatusFilter: (status: Status | "ALL") => void;
  companyFilter: number | "ALL";
  setCompanyFilter: (companyId: number | "ALL") => void;
  companies: CompanyDTO[];
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  companyFilter,
  setCompanyFilter,
  companies,
}) => {
  return (
    <Row className="g-4 align-items-end">
      {/* Recherche */}
      <Col xl={4} lg={6} md={12}>
        <Form.Label className="text-secondary fw-semibold mb-2">
          Rechercher des collaborateurs
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text
            className="bg-white border-end-0 px-3"
            style={{ borderRadius: "10px 0 0 10px" }}
          >
            <BiSearch size={20} className="text-secondary" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Nom, matricule, email ou entreprise…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-start-0 px-3"
            style={{ borderRadius: "0 10px 10px 0" }}
          />
        </InputGroup>
      </Col>

      {/* Statut */}
      <Col xl={3} lg={6} md={6}>
        <Form.Label className="text-secondary fw-semibold mb-2">
          Filtre par statut
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text
            className="bg-white border-end-0 px-3"
            style={{ borderRadius: "10px 0 0 10px" }}
          >
            <BiFilter size={20} className="text-secondary" />
          </InputGroup.Text>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="border-start-0 px-3"
            style={{ borderRadius: "0 10px 10px 0" }}
          >
            {EMP_STATUS.map((s) => (
              <option key={s} value={s}>
                {translateEmpStatus(s)}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>

      {/* Entreprise */}
      <Col xl={3} lg={6} md={6}>
        <Form.Label className="text-secondary fw-semibold mb-2">
          Filtre par entreprise
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text
            className="bg-white border-end-0 px-3"
            style={{ borderRadius: "10px 0 0 10px" }}
          >
            <BiBuilding size={20} className="text-secondary" />
          </InputGroup.Text>
          <Form.Select
            value={companyFilter}
            onChange={(e) => {
              const v =
                e.target.value === "ALL" ? "ALL" : Number(e.target.value);
              setCompanyFilter(v);
            }}
            className="border-start-0 px-3"
            style={{ borderRadius: "0 10px 10px 0" }}
          >
            <option value="ALL">Toutes les entreprises</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </Col>
    </Row>
  );
};

export default EmployeeFilters;
