import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import type { UserDTO, CompanyDTO, Status } from "../../types";

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

interface EditEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (employee: UserDTO) => Promise<void>;
  employee: UserDTO | null;
  companies: CompanyDTO[];
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  show,
  onHide,
  onSave,
  employee,
  companies,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<UserDTO | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditingEmployee(employee);
  }, [employee]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!editingEmployee) return;
    const { name, value } = e.target;
    setEditingEmployee({
      ...editingEmployee,
      [name]: name === 'companyId' ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    if (!editingEmployee) return;
    setIsSaving(true);
    await onSave(editingEmployee);
    setIsSaving(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-gradient text-black" style={{ background: "linear-gradient(135deg, #343a40 0%, #495057 100%)" }}>
        <Modal.Title>Modifier le collaborateur</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {editingEmployee && (
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                name="firstName"
                value={editingEmployee.firstName}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                name="lastName"
                value={editingEmployee.lastName}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editingEmployee.email}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                name="phone"
                value={editingEmployee.phone || ""}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Entreprise</Form.Label>
              <Form.Select
                name="companyId"
                value={editingEmployee.companyId}
                onChange={handleFormChange}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={editingEmployee.status}
                onChange={handleFormChange}
              >
                {["ACTIVE", "INACTIVE", "BLOCKED"].map((s) => (
                  <option key={s} value={s}>
                    {translateEmpStatus(s as Status)}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEmployeeModal;
