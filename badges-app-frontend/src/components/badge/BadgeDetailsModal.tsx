import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import type { UserDTO, BadgeDTO } from '../../types';

interface BadgeDetailsModalProps {
  show: boolean;
  onHide: () => void;
  badgeDetails: BadgeDTO | null;
  employees: UserDTO[];
  companies: Record<number, string>;
}

const BadgeDetailsModal: React.FC<BadgeDetailsModalProps> = ({
  show,
  onHide,
  badgeDetails,
  employees,
  companies,
}) => {
  if (!badgeDetails) return null;

  const employee = employees.find((e) => e.id === badgeDetails.userId);
  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : `User #${badgeDetails.userId}`;
  const isExpired = new Date(badgeDetails.expiryDate) < new Date();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Détails du Badge</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3 border rounded bg-light">
          <h5 className="fw-bold">{badgeDetails.code}</h5>
          <p>
            <strong>Nom complet:</strong> {employeeName}
          </p>
          <p>
            <strong>Date d'Emission:</strong> {badgeDetails.issuedDate}
          </p>
          <p className={isExpired ? 'text-danger fw-bold' : ''}>
            <strong>Date d'Expiration:</strong> {badgeDetails.expiryDate}{' '}
            {isExpired && '(Expiré)'}
          </p>
          <p>
            <strong>Entreprise:</strong> {companies[badgeDetails.companyId]}
          </p>
          <p>
            <strong>Statut:</strong> {badgeDetails.status}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BadgeDetailsModal;
