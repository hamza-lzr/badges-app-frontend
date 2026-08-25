import React from "react";
import { Button, Spinner } from "react-bootstrap";
import type { AirportDTO } from "../../types";

type SortKey = "iata" | "name" | "city" | "country";

interface AirportsTableProps {
  loading: boolean;
  airports: AirportDTO[];
  sortKey: SortKey;
  sortAsc: boolean;
  handleSort: (key: SortKey) => void;
  getCityName: (cityId: number) => string;
  getCountryName: (cityId: number) => string;
  handleEdit: (airport: AirportDTO) => void;
  handleDelete: (id: number) => void;
}

const AirportsTable: React.FC<AirportsTableProps> = ({
  loading,
  airports,
  sortKey,
  sortAsc,
  handleSort,
  getCityName,
  getCountryName,
  handleEdit,
  handleDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="secondary" />
        <p className="mt-3 text-muted">Chargement des aéroports...</p>
      </div>
    );
  }

  if (airports.length === 0) {
    return (
      <div className="alert alert-light border text-center">
        Aucun aéroport trouvé. Essayez un autre filtre.
      </div>
    );
  }

  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSort("iata")} style={{ cursor: "pointer" }}>
              IATA {sortKey === "iata" && (sortAsc ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
              Nom {sortKey === "name" && (sortAsc ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("city")} style={{ cursor: "pointer" }}>
              Ville {sortKey === "city" && (sortAsc ? "▲" : "▼")}
            </th>
            <th onClick={() => handleSort("country")} style={{ cursor: "pointer" }}>
              Pays {sortKey === "country" && (sortAsc ? "▲" : "▼")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {airports.map((airport) => (
            <tr key={airport.id}>
              <td className="fw-bold">{airport.iata}</td>
              <td>{airport.name}</td>
              <td>{getCityName(airport.cityId)}</td>
              <td>{getCountryName(airport.cityId)}</td>
              <td className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleEdit(airport)}
                >
                  <i className="bi bi-pencil"></i> Modifier
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(airport.id!)}
                >
                  <i className="bi bi-trash"></i> Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AirportsTable;
