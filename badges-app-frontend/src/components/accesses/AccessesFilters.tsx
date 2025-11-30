import React from "react";
import { Form } from "react-bootstrap";

interface AccessesFiltersProps {
  airportFilter: number | "";
  setAirportFilter: (value: number | "") => void;
  airportsMap: Map<number, string>;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  nameFilter: string;
  setNameFilter: (value: string) => void;
}

const AccessesFilters: React.FC<AccessesFiltersProps> = ({
  airportFilter,
  setAirportFilter,
  airportsMap,
  searchQuery,
  setSearchQuery,
  nameFilter,
  setNameFilter,
}) => {
  return (
    <div className="d-flex flex-wrap gap-3 mb-4">
      <Form.Select
        style={{ maxWidth: 200 }}
        value={airportFilter}
        onChange={(e) =>
          setAirportFilter(
            e.target.value === "" ? "" : Number(e.target.value)
          )
        }
      >
        <option value="">Tous les aéroports</option>
        {Array.from(airportsMap.entries()).map(([id, name]) => (
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
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Form.Control
        type="text"
        placeholder="Filtrer par nom ou prénom…"
        style={{ maxWidth: 250 }}
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />
    </div>
  );
};

export default AccessesFilters;
