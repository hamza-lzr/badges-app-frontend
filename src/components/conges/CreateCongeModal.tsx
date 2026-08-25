import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { CongeDTO } from "../../types";

interface CreateCongeModalProps {
  show: boolean;
  onHide: () => void;
  submitting: boolean;
  onSubmit: (data: Omit<CongeDTO, 'id' | 'status' | 'userId' | 'createdAt'>) => void;
}

const CreateCongeModal: React.FC<CreateCongeModalProps> = ({
  show,
  onHide,
  submitting,
  onSubmit,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const rangeInvalid = !!startDate && !!endDate && startDate > endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rangeInvalid || !startDate || !endDate) return;
    onSubmit({ startDate, endDate, description });
  };
  
  const handleHide = () => {
    // Reset form on hide
    setStartDate("");
    setEndDate("");
    setDescription("");
    onHide();
  }

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Demander un Congé</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} id="create-conge-form">
          <Form.Group className="mb-3">
            <Form.Label>Date de début</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              max={endDate || undefined}
              isInvalid={rangeInvalid}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              La date de début ne peut pas être après la date de fin.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date de fin</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              min={startDate || undefined}
              isInvalid={rangeInvalid}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              La date de fin doit être le ou après la date de début.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label>Description (optionnelle)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre congé"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={handleHide}>
          Annuler
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="create-conge-form"
          disabled={submitting || !startDate || !endDate || rangeInvalid}
        >
          {submitting ? "Soumission..." : "Soumettre"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateCongeModal;
