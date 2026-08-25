import React from 'react';
import { Form } from 'react-bootstrap';

interface BadgeFiltersProps {
  companyFilter: number | '';
  setCompanyFilter: (value: number | '') => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showExpiredOnly: boolean;
  setShowExpiredOnly: (value: boolean) => void;
  companies: Record<number, string>;
}

const BadgeFilters: React.FC<BadgeFiltersProps> = ({
  companyFilter,
  setCompanyFilter,
  searchQuery,
  setSearchQuery,
  showExpiredOnly,
  setShowExpiredOnly,
  companies,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-semibold mb-0">Gestion des Badges</h2>

      <div className="d-flex gap-3 align-items-center">
        <Form.Select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Toutes les entreprises</option>
          {Object.entries(companies).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '250px' }}
        />

        <Form.Check
          type="switch"
          id="expired-toggle"
          label={<small className="ms-2 text-muted" style={{ whiteSpace: 'nowrap' }}>Badges expirés</small>}
          checked={showExpiredOnly}
          onChange={(e) => setShowExpiredOnly(e.target.checked)}
        />
      </div>
    </div>
  );
};

export default BadgeFilters;
