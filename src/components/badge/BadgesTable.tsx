import React from 'react';
import { Form, Button } from 'react-bootstrap';
import type { UserDTO, BadgeDTO } from '../../types';

type BadgeMap = Record<number, BadgeDTO>;

interface BadgesTableProps {
  employees: UserDTO[];
  badges: BadgeMap;
  companies: Record<number, string>;
  selectedBadgeByUser: Record<number, number | ''>;
  setSelectedBadgeByUser: React.Dispatch<React.SetStateAction<Record<number, number | ''>>>;
  onViewDetails: (badgeId: number) => void;
  onGenerate: (employee: UserDTO) => void;
  employeeAllBadgesExpired: (employee: UserDTO) => boolean;
}

const BadgesTable: React.FC<BadgesTableProps> = ({
  employees,
  badges,
  companies,
  selectedBadgeByUser,
  setSelectedBadgeByUser,
  onViewDetails,
  onGenerate,
  employeeAllBadgesExpired,
}) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 custom-table">
            <thead>
              <tr className="table-dark">
                <th style={{ width: '12%' }}>Collaborateur</th>
                <th style={{ width: '10%' }}>Matricule</th>
                <th style={{ width: '18%' }}>Email</th>
                <th style={{ width: '15%' }}>Entreprise</th>
                <th style={{ width: '8%' }}>Badges</th>
                <th style={{ width: '29%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const empId = emp.id!;
                const badgeIds = emp.badgesIds ?? [];
                const hasBadges = badgeIds.length > 0;
                const selected = selectedBadgeByUser[empId] ?? '';

                return (
                  <tr key={emp.id}>
                    <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                    <td><span className="text-muted">{emp.matricule}</span></td>
                    <td><span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>{emp.email}</span></td>
                    <td><span className="text-truncate d-inline-block" style={{ maxWidth: '120px' }}>{companies[emp.companyId] || 'Unknown'}</span></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-secondary me-1">{badgeIds.length}</span>
                        {hasBadges && employeeAllBadgesExpired(emp) && <span className="badge bg-danger">Expiré</span>}
                      </div>
                    </td>
                    <td>
                      <div className="actions-container">
                        <Form.Select
                          size="sm"
                          value={selected}
                          onChange={(e) => setSelectedBadgeByUser(prev => ({ ...prev, [empId]: e.target.value === '' ? '' : Number(e.target.value) }))}
                          disabled={!hasBadges}
                          className="action-select"
                        >
                          {hasBadges ? (
                            <>
                              <option value="">Badge(s)</option>
                              {badgeIds.map(id => (
                                <option key={id} value={id}>{badges[id]?.code || `Badge ${id}`}</option>
                              ))}
                            </>
                          ) : (
                            <option value="">Aucun badge</option>
                          )}
                        </Form.Select>

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => { if (selected !== '') onViewDetails(Number(selected)); }}
                          disabled={!hasBadges || selected === ''}
                          className="action-btn action-btn-view"
                        >
                          Afficher
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onGenerate(emp)}
                          className="action-btn action-btn-add"
                        >
                          Ajouter
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BadgesTable;
