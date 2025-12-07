import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import type { CreateEmployeeDTO } from "../../types";

const INITIAL_STATE: CreateEmployeeDTO = {
  email: "",
  role: "ADMIN",
  status: "ACTIVE",
  userType: "ADMIN",
  matricule: "",
  firstName: "",
  lastName: "",
  phone: "",
  companyId: null as unknown as number,
};

interface CreateAdminModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (admin: CreateEmployeeDTO) => Promise<void>;
  isLoading?: boolean;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  show,
  onHide,
  onSave,
  isLoading = false,
}) => {
  const [newAdmin, setNewAdmin] = useState(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(newAdmin);
      setNewAdmin(INITIAL_STATE); // Reset form after saving
      onHide();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-gradient text-black" style={{ background: "linear-gradient(135deg, #343a40 0%, #495057 100%)" }}>
        <Modal.Title>Create Admin Account</Modal.Title>
      </Modal.Header>
      <form id="create-admin-form" onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                value={newAdmin.firstName}
                onChange={handleFormChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastName"
                value={newAdmin.lastName}
                onChange={handleFormChange}
                required
              />
            </Col>
            <Col md={12}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newAdmin.email}
                onChange={handleFormChange}
                required
                placeholder="admin@example.com"
              />
            </Col>
            <Col md={6}>
              <Form.Label>Phone (optional)</Form.Label>
              <Form.Control
                name="phone"
                value={newAdmin.phone}
                onChange={handleFormChange}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Matricule (optional)</Form.Label>
              <Form.Control
                name="matricule"
                value={newAdmin.matricule}
                onChange={handleFormChange}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onHide} disabled={isSaving || isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-admin-form"
            disabled={isSaving || isLoading}
          >
            {isSaving || isLoading ? "Creating..." : "Create Admin"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateAdminModal;
