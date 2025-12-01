import React from "react";
import { Form } from "react-bootstrap";

interface AccessesFiltersProps {
  airportFilter: number | "";
  onAirportFilterChange: (value: number | "") => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  airportsMap: Record<number, string>;
}

const AccessesFilters: React.FC<AccessesFiltersProps> = ({
  airportFilter,
  onAirportFilterChange,
  searchQuery,
  onSearchQueryChange,
  nameFilter,
  onNameFilterChange,
  airportsMap,
}) => {
  return (
    <div className="d-flex flex-wrap gap-3 mb-4">
      <Form.Select
        style={{ maxWidth: 200 }}
        value={airportFilter}
        onChange={(e) =>
          onAirportFilterChange(
            e.target.value === "" ? "" : Number(e.target.value)
          )
        }
      >
        <option value="">Tous les aéroports</option>
        {Object.entries(airportsMap).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Form.Select>
      <Form.Control
        type="text"
        placeholder="Rechercher un badge ou un aéroport…"
        style={{ maxWidth: 250 }}
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="Filtrer par nom ou prénom…"
        style={{ maxWidth: 250 }}
        value={nameFilter}
        onChange={(e) => onNameFilterChange(e.target.value)}
      />
    </div>
  );
};

export default AccessesFilters;