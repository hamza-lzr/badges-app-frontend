import React, { useEffect, useState } from "react";
import type { AirportDTO, CityDTO } from "../types";
import { fetchAirports, createAirport, deleteAirport, updateAirport } from "../api/apiAirport";
import { fetchCities } from "../api/apiCity";
import { Modal, Button, Spinner } from "react-bootstrap";

const Airports: React.FC = () => {
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState<keyof AirportDTO | "city">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Add Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAirport, setEditingAirport] = useState<AirportDTO | null>(null);

  const [newAirport, setNewAirport] = useState<Omit<AirportDTO, "id">>({
    iata: "",
    name: "",
    cityId: 0,
  });

  useEffect(() => {
    const loadAll = async () => {
      await loadCities();
      await loadAirports();
    };
    loadAll();
  }, []);

  const loadCities = async () => {
    try {
      const data = await fetchCities();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const loadAirports = async () => {
    try {
      setLoading(true);
      const data = await fetchAirports();
      setAirports(data);
    } catch (error) {
      console.error("Error fetching airports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCityName = (cityId: number) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : "Unknown";
  };

  /** Sorting */
  const sortedAirports = [...airports].sort((a, b) => {
    let valA: string = "";
    let valB: string = "";

    if (sortKey === "city") {
      valA = getCityName(a.cityId);
      valB = getCityName(b.cityId);
    } else {
      valA = (a[sortKey] as string) || "";
      valB = (b[sortKey] as string) || "";
    }

    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleSort = (key: keyof AirportDTO | "city") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  /** Create Airport */
  const handleCreateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAirport(newAirport);
      await loadAirports();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating airport:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /** Delete Airport */
  const handleDeleteAirport = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this airport?")) return;
    try {
      await deleteAirport(id);
      await loadAirports();
    } catch (error) {
      console.error("Error deleting airport:", error);
    }
  };

  /** Edit Airport */
  const handleEditAirport = (airport: AirportDTO) => {
    setEditingAirport(airport);
    setShowEditModal(true);
  };

  const handleUpdateAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAirport || !editingAirport.id) return;
    setSubmitting(true);
    try {
      await updateAirport(editingAirport.id, editingAirport);
      await loadAirports();
      setShowEditModal(false);
      setEditingAirport(null);
    } catch (error) {
      console.error("Error updating airport:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewAirport({
      iata: "",
      name: "",
      cityId: 0,
    });
  };

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-semibold">Airports</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Airport
        </Button>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="secondary" />
          <p className="mt-3 text-muted">Loading airports...</p>
        </div>
      ) : sortedAirports.length === 0 ? (
        <div className="alert alert-light border text-center">
          No airports available. Click <strong>Add Airport</strong> to create one.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("iata")}
                >
                  IATA{" "}
                  {sortKey === "iata" && (
                    <span className="text-muted">
                      {sortAsc ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("name")}
                >
                  Name{" "}
                  {sortKey === "name" && (
                    <span className="text-muted">
                      {sortAsc ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("city")}
                >
                  City{" "}
                  {sortKey === "city" && (
                    <span className="text-muted">
                      {sortAsc ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th style={{ width: "20%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAirports.map((airport, index) => (
                <tr key={airport.id}>
                  <td>
                    <span className="badge bg-secondary">{index + 1}</span>
                  </td>
                  <td className="fw-bold">{airport.iata}</td>
                  <td>{airport.name}</td>
                  <td>{getCityName(airport.cityId)}</td>
                  <td className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditAirport(airport)}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteAirport(airport.id!)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Adding Airport */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Airport</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="add-airport-form" onSubmit={handleCreateAirport}>
            <div className="mb-3">
              <label className="form-label">IATA Code</label>
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
              <label className="form-label">Airport Name</label>
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
              <label className="form-label">City</label>
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
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
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

      {/* Modal for Editing Airport */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Airport</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingAirport && (
            <form id="edit-airport-form" onSubmit={handleUpdateAirport}>
              <div className="mb-3">
                <label className="form-label">IATA Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingAirport.iata}
                  onChange={(e) =>
                    setEditingAirport({ ...editingAirport, iata: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Airport Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingAirport.name}
                  onChange={(e) =>
                    setEditingAirport({ ...editingAirport, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">City</label>
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
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
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
