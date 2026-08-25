import React from "react";
import { Button, Form } from "react-bootstrap";

interface AirportsHeaderProps {
  filteredCount: number;
  loading: boolean;
  openAddModal: () => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  allCountries: string[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const AirportsHeader: React.FC<AirportsHeaderProps> = ({
  filteredCount,
  loading,
  openAddModal,
  countryFilter,
  setCountryFilter,
  allCountries,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Gestion des Aéroports</h2>
        <div className="d-flex align-items-center gap-3">
          {!loading && (
            <span className="text-muted">
              <strong>{filteredCount}</strong> Aéroports affiché
              {filteredCount !== 1 ? "s" : ""}
            </span>
          )}
          <Button variant="primary" onClick={openAddModal}>
            Ajouter un Aéroport
          </Button>
        </div>
      </div>
      <div className="d-flex gap-3 align-items-center mb-4">
        <Form.Select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tous les pays</option>
          {allCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          type="text"
          placeholder="Rechercher un aéroport, une ville, un pays..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>
    </>
  );
};

export default AirportsHeader;
