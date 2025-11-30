import React from "react";
import { Modal, Button } from "react-bootstrap";
import type { AirportDTO, CityDTO, CountryDTO } from "../../types";

interface AirportModalProps {
  show: boolean;
  onHide: () => void;
  isEditing: boolean;
  submitting: boolean;
  airportData: Partial<AirportDTO>;
  setAirportData: React.Dispatch<React.SetStateAction<Partial<AirportDTO>>>;
  handleSubmit: (e: React.FormEvent) => void;
  cities: CityDTO[];
  countries: CountryDTO[];
}

const AirportModal: React.FC<AirportModalProps> = ({
  show,
  onHide,
  isEditing,
  submitting,
  airportData,
  setAirportData,
  handleSubmit,
  cities,
  countries,
}) => {
  const title = isEditing ? "Modifier un Aéroport" : "Ajouter un Aéroport";
  const formId = isEditing ? "edit-airport-form" : "add-airport-form";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Code IATA</label>
            <input
              type="text"
              className="form-control"
              value={airportData.iata || ""}
              onChange={(e) =>
                setAirportData({ ...airportData, iata: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nom de l'Aéroport</label>
            <input
              type="text"
              className="form-control"
              value={airportData.name || ""}
              onChange={(e) =>
                setAirportData({ ...airportData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ville</label>
            <select
              className="form-select"
              value={airportData.cityId || ""}
              onChange={(e) =>
                setAirportData({
                  ...airportData,
                  cityId: Number(e.target.value),
                })
              }
              required
            >
              <option value="">Sélectionner une ville</option>
              {cities.map((city) => {
                const countryName =
                  countries.find((c) => c.id === city.countryId)?.name || "";
                return (
                  <option key={city.id} value={city.id}>
                    {city.name} ({countryName})
                  </option>
                );
              })}
            </select>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button
          variant="success"
          type="submit"
          form={formId}
          disabled={submitting}
        >
          {submitting ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update" : "Save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AirportModal;
