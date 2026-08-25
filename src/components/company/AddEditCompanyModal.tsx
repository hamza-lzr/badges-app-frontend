import React from "react";
import { Modal, Button } from "react-bootstrap";
import type { CompanyDTO } from "../../types";

interface AddEditCompanyModalProps {
  show: boolean;
  onHide: () => void;
  isEditing: boolean;
  submitting: boolean;
  newCompany: Omit<CompanyDTO, "id">;
  setNewCompany: React.Dispatch<React.SetStateAction<Omit<CompanyDTO, "id">>>;
  handleSave: (e: React.FormEvent) => void;
}

const AddEditCompanyModal: React.FC<AddEditCompanyModalProps> = ({
  show,
  onHide,
  isEditing,
  submitting,
  newCompany,
  setNewCompany,
  handleSave,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? "Modifier l'entreprise" : "Ajouter une entreprise"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id="company-form" onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">Nom de l'entreprise</label>
            <input
              type="text"
              className="form-control"
              value={newCompany.name}
              onChange={(e) =>
                setNewCompany({ ...newCompany, name: e.target.value })
              }
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Adresse</label>
            <input
              type="text"
              className="form-control"
              value={newCompany.address}
              onChange={(e) =>
                setNewCompany({ ...newCompany, address: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Téléphone</label>
            <input
              type="text"
              className="form-control"
              value={newCompany.phone}
              onChange={(e) =>
                setNewCompany({ ...newCompany, phone: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descriptif</label>
            <textarea
              className="form-control"
              rows={2}
              value={newCompany.description}
              onChange={(e) =>
                setNewCompany({ ...newCompany, description: e.target.value })
              }
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button
          variant="success"
          type="submit"
          form="company-form"
          disabled={submitting}
        >
          {submitting
            ? "Enregistrement..."
            : isEditing
            ? "Modifier"
            : "Ajouter"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEditCompanyModal;
