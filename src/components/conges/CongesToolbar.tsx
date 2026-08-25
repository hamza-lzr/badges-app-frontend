import React from "react";
import { Form, Button, ButtonGroup, InputGroup } from "react-bootstrap";

// Define ViewMode locally as it's specific to this component's context for now.
export type ViewMode = "cards" | "table";

interface CongesToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onNewRequest: () => void;
}

const CongesToolbar: React.FC<CongesToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  onNewRequest,
}) => {
  return (
    <>
      <div className="text-center mb-3">
        <h1 className="fw-bold mb-1" style={{ color: "#333" }}>
          Mes Demandes de Congé
        </h1>
        <div className="text-muted">Suivez et gérez vos congés soumis</div>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2 gap-md-3 px-3 py-2 mb-4">
        <div className="d-flex align-items-center gap-2">
          <InputGroup className="flex-grow-1" style={{ minWidth: 390, maxWidth: 600 }}>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher par description ou dates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto ms-1 ms-md-2"
            style={{ minWidth: 140, maxWidth: 220 }}
          >
            <option value="all">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Rejeté</option>
          </Form.Select>
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2">
          <ButtonGroup aria-label="View mode">
            <Button
              variant={viewMode === "cards" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("cards")}
              title="Mode Fenêtre"
            >
              <i className="bi bi-grid-3x3-gap-fill" />
            </Button>
            <Button
              variant={viewMode === "table" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("table")}
              title="Mode Liste"
            >
              <i className="bi bi-list" />
            </Button>
          </ButtonGroup>
          <Button
            variant="outline-success"
            className="rounded-pill px-3"
            onClick={onNewRequest}
          >
            <i className="bi bi-plus-circle me-2"></i>Demander un Congé
          </Button>
        </div>
      </div>
    </>
  );
};

export default CongesToolbar;
