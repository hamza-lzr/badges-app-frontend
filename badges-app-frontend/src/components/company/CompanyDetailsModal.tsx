import React from "react";
import { Modal, Button } from "react-bootstrap";
import type { CompanyDTO } from "../../types";

interface CompanyDetailsModalProps {
  show: boolean;
  onHide: () => void;
  company: CompanyDTO | null;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  show,
  onHide,
  company,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Détails de l'entreprise</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {company ? (
          <div className="vstack gap-2">
            <div>
              <small className="text-muted d-block">Nom</small>
              <div className="fw-semibold">{company.name}</div>
            </div>
            <div>
              <small className="text-muted d-block">Adresse</small>
              <div>{company.address || "—"}</div>
            </div>
            <div>
              <small className="text-muted d-block">Téléphone</small>
              <div>{company.phone || "—"}</div>
            </div>
            <div>
              <small className="text-muted d-block">Descriptif</small>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {company.description || "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted">Aucune entreprise sélectionnée.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyDetailsModal;
