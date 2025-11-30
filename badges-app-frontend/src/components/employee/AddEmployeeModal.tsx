import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import type { UserDTO, CompanyDTO } from "../../types";

const INITIAL_STATE: Omit<UserDTO, "id" | "badgesIds"> = {
    email: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
    userType: "EMPLOYEE",
    matricule: "",
    firstName: "",
    lastName: "",
    phone: "",
    companyId: 0,
};

interface AddEmployeeModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (employee: Omit<UserDTO, "id" | "badgesIds">) => Promise<void>;
  companies: CompanyDTO[];
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  show,
  onHide,
  onSave,
  companies,
}) => {
  const [newEmployee, setNewEmployee] = useState(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: name === 'companyId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(newEmployee);
    setIsSaving(false);
    setNewEmployee(INITIAL_STATE); // Reset form after saving
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-gradient text-black" style={{ background: "linear-gradient(135deg, #343a40 0%, #495057 100%)" }}>
        <Modal.Title>Ajouter un collaborateur</Modal.Title>
      </Modal.Header>
      <form id="add-employee-form" onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                name="firstName"
                value={newEmployee.firstName}
                onChange={handleFormChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Nom</Form.Label>
              <Form.Control
                name="lastName"
                value={newEmployee.lastName}
                onChange={handleFormChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleFormChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                name="phone"
                value={newEmployee.phone}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Matricule</Form.Label>
              <Form.Control
                name="matricule"
                value={newEmployee.matricule}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Entreprise</Form.Label>
              <Form.Select
                name="companyId"
                value={newEmployee.companyId || ""}
                onChange={handleFormChange}
                required
              >
                <option value="">Sélectionner une entreprise</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="add-employee-form"
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;
