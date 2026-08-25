import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import type { BadgeDTO } from '../../types';

interface GenerateBadgeModalProps {
  show: boolean;
  onHide: () => void;
  badgeData: Partial<BadgeDTO>;
  setBadgeData: React.Dispatch<React.SetStateAction<Partial<BadgeDTO>>>;
  companies: Record<number, string>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const GenerateBadgeModal: React.FC<GenerateBadgeModalProps> = ({
  show,
  onHide,
  badgeData,
  setBadgeData,
  companies,
  onSubmit,
  submitting,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Générer un Nouveau Badge</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="generate-badge-form" onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Code du Badge</Form.Label>
            <Form.Control
              type="text"
              value={badgeData.code || ''}
              onChange={(e) => setBadgeData({ ...badgeData, code: e.target.value })}
              required
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Date d'Emission</Form.Label>
                <Form.Control type="text" readOnly value={badgeData.issuedDate || ''} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Date d'Expiration</Form.Label>
                <Form.Control
                  type="date"
                  value={badgeData.expiryDate || ''}
                  onChange={(e) => setBadgeData({ ...badgeData, expiryDate: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <Form.Label>Entreprise</Form.Label>
            <Form.Select
              value={badgeData.companyId || ''}
              onChange={(e) => setBadgeData({ ...badgeData, companyId: Number(e.target.value) })}
            >
              {Object.entries(companies).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={badgeData.status || 'ACTIVE'}
              onChange={(e) => setBadgeData({ ...badgeData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button type="submit" form="generate-badge-form" disabled={submitting}>
          {submitting ? 'Génération en cours...' : 'Générer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenerateBadgeModal;
