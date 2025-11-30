import React from "react";
import { Card, Row, Col, Form, InputGroup } from "react-bootstrap";
import { BiSearch, BiFilter, BiCalendar } from "react-icons/bi";
import type { ReqStatus } from "../../types";

const STATUS_OPTIONS: Array<ReqStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const translateStatus = (status: ReqStatus | "ALL"): string => {
  switch (status) {
    case "PENDING": return "En attente";
    case "APPROVED": return "Approuvé";
    case "REJECTED": return "Rejeté";
    case "ALL": return "Tous les statuts";
    default: return status;
  }
};

interface RequestsFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: ReqStatus | "ALL";
  setStatusFilter: (s: ReqStatus | "ALL") => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  setCurrentPage: (p: number) => void;
}

const RequestsFilters: React.FC<RequestsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  setCurrentPage,
}) => {
  return (
    <Card className="mb-4 shadow-lg border-0 request-filters-card">
      <Card.Header className="bg-gradient text-white py-3 request-filters-header">
        <h5 className="mb-0 d-flex align-items-center">
          <BiFilter size={24} className="me-2" />
          Filtres et recherche
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-4 align-items-end">
          <Col xl={4} lg={6} md={12}>
            <Form.Label className="text-secondary fw-semibold mb-2">
              Rechercher des demandes
            </Form.Label>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0 px-3 input-group-text-start">
                <BiSearch size={20} className="text-secondary" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Rechercher par description ou nom d'employé..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-start-0 px-3"
              />
            </InputGroup>
          </Col>
          <Col xl={3} lg={6} md={6}>
            <Form.Label className="text-secondary fw-semibold mb-2">
              Filtre de statut
            </Form.Label>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0 px-3 input-group-text-start">
                <BiFilter size={20} className="text-secondary" />
              </InputGroup.Text>
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ReqStatus | "ALL");
                  setCurrentPage(1);
                }}
                className="border-start-0 px-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {translateStatus(s)}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
          <Col xl={5} lg={12} md={6}>
            <Form.Label className="text-secondary fw-semibold mb-2">
              Plage de dates
            </Form.Label>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0 px-3 input-group-text-start-date">
                <BiCalendar size={20} className="text-secondary" />
              </InputGroup.Text>
              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-start-0 border-end-0 px-3"
              />
              <InputGroup.Text className="bg-light border-start-0 border-end-0 px-3 text-secondary fw-semibold">
                à
              </InputGroup.Text>
              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-start-0 px-3"
              />
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestsFilters;
