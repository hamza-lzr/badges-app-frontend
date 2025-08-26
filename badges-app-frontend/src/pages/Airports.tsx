import React, { useEffect, useState } from "react";
import type { AirportDTO, CityDTO, CountryDTO } from "../types";
import { useSearchParams } from "react-router-dom";
import {
  fetchAirports,
  createAirport,
  deleteAirport,
  updateAirport,
} from "../api/apiAirport";
import { fetchCities } from "../api/apiCity";
import { fetchCountries } from "../api/apiCountry";
import { Modal, Button, Spinner, Form } from "react-bootstrap";

const Airports: React.FC = () => {
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState<keyof AirportDTO | "city" | "country">(
    "name"
  );
  const [sortAsc, setSortAsc] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingAirport, setEditingAirport] = useState<AirportDTO | null>(null);
  const [newAirport, setNewAirport] = useState<Omit<AirportDTO, "id">>({
    iata: "",
    name: "",
    cityId: 0,
  });

  const [searchParams] = useSearchParams();
const cityIdFilter = searchParams.get("cityId"); // Note: this will be a string if exists

  useEffect(() => {
    const loadAll = async () => {
      await loadCountries();
      await loadCities();
      await loadAirports();
    };
    loadAll();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await fetchCountries();
      setCountries(data);
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  const loadCities = async () => {
    try {
      const data = await fetchCities();
      setCities(data);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const loadAirports = async () => {
    try {
      setLoading(true);
      const data = await fetchAirports();
      setAirports(data);
    } catch (err) {
      console.error("Error fetching airports:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Mappers */
  const getCity = (cityId: number) => cities.find((c) => c.id === cityId);
  const getCityName = (cityId: number) => getCity(cityId)?.name || "Unknown";

  const getCountryIdFromCity = (cityId: number) =>
    getCity(cityId)?.countryId || 0;

  const getCountryName = (cityId: number) => {
    const countryId = getCountryIdFromCity(cityId);
    return countries.find((c) => c.id === countryId)?.name || "Unknown";
  };

  /** Build unique country list for filter */
  const allCountries = Array.from(
    new Set(
      cities
        .map(
          (c) => countries.find((country) => country.id === c.countryId)?.name
        )
        .filter(Boolean)
    )
  );

  /** Sorting */
  const sortFn = (a: AirportDTO, b: AirportDTO) => {
    let valA = "";
    let valB = "";

    if (sortKey === "city") {
      valA = getCityName(a.cityId);
      valB = getCityName(b.cityId);
    } else if (sortKey === "country") {
      valA = getCountryName(a.cityId);
      valB = getCountryName(b.cityId);
    } else {
      valA = (a[sortKey] as string) || "";
      valB = (b[sortKey] as string) || "";
    }
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  };

  /** Filters: search & country */
// inside Airports.tsx, in your filteredAirports definition:
const filteredAirports = airports.filter((airport) => {
  const query = searchQuery.toLowerCase();
  const cityName = getCityName(airport.cityId).toLowerCase();
  const countryName = getCountryName(airport.cityId).toLowerCase();

  const matchesSearch =
    airport.name.toLowerCase().includes(query) ||
    airport.iata.toLowerCase().includes(query) ||
    cityName.includes(query) ||
    countryName.includes(query);

  const matchesCountryFilter =
    countryFilter === "" || countryName === countryFilter.toLowerCase();

  // Add filtering by city if cityIdFilter exists
  const matchesCity =
    cityIdFilter ? airport.cityId === Number(cityIdFilter) : true;

  return matchesSearch && matchesCountryFilter && matchesCity;
});

  const sortedAirports = [...filteredAirports].sort(sortFn);

  const handleSort = (key: keyof AirportDTO | "city" | "country") => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  /** CRUD Handlers */
  const handleCreateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAirport(newAirport);
      await loadAirports();
      setNewAirport({ iata: "", name: "", cityId: 0 });
      setShowModal(false);
    } catch (err) {
      console.error("Error creating airport:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAirport = async (id: number) => {
    if (!window.confirm("Delete this airport?")) return;
    try {
      await deleteAirport(id);
      await loadAirports();
    } catch (err) {
      console.error("Error deleting airport:", err);
    }
  };

  const handleEditAirport = (airport: AirportDTO) => {
    setEditingAirport(airport);
    setShowEditModal(true);
  };

  const handleUpdateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAirport?.id) return;
    setSubmitting(true);
    try {
      await updateAirport(editingAirport.id, editingAirport);
      await loadAirports();
      setShowEditModal(false);
      setEditingAirport(null);
    } catch (err) {
      console.error("Error updating airport:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Left side */}
        <h2 className="fw-semibold mb-0">Gestion des Aéroports</h2>

        {/* Right side */}
        <div className="d-flex align-items-center gap-3">
          {!loading && (
            <span className="text-muted">
              <strong>{filteredAirports.length}</strong> Aéroports affiché
              {filteredAirports.length !== 1 ? "s" : ""}
            </span>
          )}
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Ajouter un Aéroport
          </Button>
        </div>
      </div>

      {/* Filters: country + search */}
      <div className="d-flex gap-3 align-items-center mb-4">
        <Form.Select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tous les pays</option>
          {allCountries.map((country) => (
            <option key={country} value={country!}>
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

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="secondary" />
          <p className="mt-3 text-muted">Chargement des aéroports...</p>
        </div>
      ) : sortedAirports.length === 0 ? (
        <div className="alert alert-light border text-center">
          Aucun aéroport trouvé. Essayez un autre filtre.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th
                  onClick={() => handleSort("iata")}
                  style={{ cursor: "pointer" }}
                >
                  IATA {sortKey === "iata" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Nom {sortKey === "name" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("city")}
                  style={{ cursor: "pointer" }}
                >
                  Ville {sortKey === "city" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("country")}
                  style={{ cursor: "pointer" }}
                >
                  Pays {sortKey === "country" && (sortAsc ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAirports.map((airport) => (
                <tr key={airport.id}>

                  <td className="fw-bold">{airport.iata}</td>
                  <td>{airport.name}</td>
                  <td>{getCityName(airport.cityId)}</td>
                  <td>{getCountryName(airport.cityId)}</td>
                  <td className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditAirport(airport)}
                    >
                      <i className="bi bi-pencil"></i> Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteAirport(airport.id!)}
                    >
                      <i className="bi bi-trash"></i> Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Airport Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Aéroport</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="add-airport-form" onSubmit={handleCreateAirport}>
            <div className="mb-3">
              <label className="form-label">Code IATA</label>
              <input
                type="text"
                className="form-control"
                value={newAirport.iata}
                onChange={(e) =>
                  setNewAirport({ ...newAirport, iata: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nom de l'Aéroport</label>
              <input
                type="text"
                className="form-control"
                value={newAirport.name}
                onChange={(e) =>
                  setNewAirport({ ...newAirport, name: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ville</label>
              <select
                className="form-select"
                value={newAirport.cityId || ""}
                onChange={(e) =>
                  setNewAirport({
                    ...newAirport,
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button
            variant="success"
            type="submit"
            form="add-airport-form"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier un Aéroport</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingAirport && (
            <form id="edit-airport-form" onSubmit={handleUpdateAirport}>
              <div className="mb-3">
                <label className="form-label">Code IATA</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingAirport.iata}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      iata: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nom de l'Aéroport</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingAirport.name}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Ville</label>
                <select
                  className="form-select"
                  value={editingAirport.cityId || ""}
                  onChange={(e) =>
                    setEditingAirport({
                      ...editingAirport,
                      cityId: Number(e.target.value),
                    })
                  }
                  required
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map((city) => {
                    const countryName =
                      countries.find((c) => c.id === city.countryId)?.name ||
                      "";
                    return (
                      <option key={city.id} value={city.id}>
                        {city.name} ({countryName})
                      </option>
                    );
                  })}
                </select>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button
            variant="success"
            type="submit"
            form="edit-airport-form"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Airports;
