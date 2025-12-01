import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { AccessDTO } from "../../types";

interface AccessFormModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (formData: AccessDTO) => void;
  editingAccess: AccessDTO | null;
  airportsMap: Record<number, string>;
  badgesMap: Record<number, string>;
}

const AccessFormModal: React.FC<AccessFormModalProps> = ({
  show,
  onHide,
  onSave,
  editingAccess,
  airportsMap,
  badgesMap,
}) => {
  const [formData, setFormData] = useState<AccessDTO>({
    startDate: "",
    endDate: "",
    airportId: 0,
    badgeId: 0,
  });
  const [badgeSearchQuery, setBadgeSearchQuery] = useState("");

  useEffect(() => {
    if (editingAccess) {
      setFormData(editingAccess);
    } else {
      setFormData({
        startDate: "",
        endDate: "",
        airportId: 0,
        badgeId: 0,
      });
    }
  }, [editingAccess, show]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredBadges = Object.entries(badgesMap)
    .filter(([, code]) =>
      code.toLowerCase().includes(badgeSearchQuery.toLowerCase())
    )
    .reduce(
      (acc, [id, code]) => ({ ...acc, [Number(id)]: code }),
      {} as Record<number, string>
    );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSave}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAccess ? "Modifier l'accès" : "Ajouter un nouvel accès"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Aéroport</Form.Label>
            <Form.Select
              required
              value={formData.airportId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  airportId: Number(e.target.value),
                })
              }
            >
              <option value={0}>Sélectionner un aéroport</option>
              {Object.entries(airportsMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Badge</Form.Label>
            <Form.Control
              placeholder="Rechercher un badge…"
              value={badgeSearchQuery}
              onChange={(e) => setBadgeSearchQuery(e.target.value)}
              className="mb-2"
            />
            <Form.Select
              required
              value={formData.badgeId}
              onChange={(e) =>
                setFormData({ ...formData, badgeId: Number(e.target.value) })
              }
            >
              <option value={0}>Sélectionner un badge</option>
              {Object.entries(filteredBadges).map(([id, code]) => (
                <option key={id} value={id}>
                  {code}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date de début</Form.Label>
            <Form.Control
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date de fin</Form.Label>
            <Form.Control
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="justify-content-end">
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button type="submit" variant="success">
            {editingAccess ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AccessFormModal;