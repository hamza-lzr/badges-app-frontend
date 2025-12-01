import React from "react";
import { Button } from "react-bootstrap";

type ViewMode = "table" | "grid";

interface AccessesHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAdd: () => void;
}

const AccessesHeader: React.FC<AccessesHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onAdd,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold mb-0" style={{ color: "#333" }}>
        Gestion des Autorisations d'accès
      </h2>
      <div className="d-flex gap-2">
        <Button
          variant={viewMode === "table" ? "primary" : "outline-secondary"}
          size="sm"
          className="rounded-pill"
          onClick={() => onViewModeChange("table")}
        >
          <i className="bi bi-list" />
        </Button>
        <Button
          variant={viewMode === "grid" ? "primary" : "outline-secondary"}
          size="sm"
          className="rounded-pill"
          onClick={() => onViewModeChange("grid")}
        >
          <i className="bi bi-grid" />
        </Button>
        <Button
          variant="success"
          size="sm"
          className="rounded-pill"
          onClick={onAdd}
        >
          <i className="bi bi-plus-circle" /> Attribuer un accès
        </Button>
      </div>
    </div>
  );
};

export default AccessesHeader;