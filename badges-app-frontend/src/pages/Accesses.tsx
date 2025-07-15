import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  fetchAccesses,
  createAccess,
  updateAccess,
  deleteAccess,
} from "../api/apiAccess";
import { fetchAirports } from "../api/apiAirport";
import { fetchBadges } from "../api/apiBadge";
import type { AccessDTO, AirportDTO, BadgeDTO } from "../types";

const AccessManagement: React.FC = () => {
  const [accessList, setAccessList] = useState<AccessDTO[]>([]);
  const [airports, setAirports] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessDTO | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<AccessDTO>({
    startDate: "",
    endDate: "",
    airportId: 0,
    badgeId: 0,
  });

  // Load data
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [accesses, airportsData, badgesData] = await Promise.all([
        fetchAccesses(),
        fetchAirports(),
        fetchBadges(),
      ]);

      setAccessList(accesses);

      // Map airportId -> airport name
      const airportMap = Object.fromEntries(
        airportsData.map((a: AirportDTO) => [a.id, `${a.name} (${a.iata})`])
      );
      setAirports(airportMap);

      // Map badgeId -> badge code
      const badgeMap = Object.fromEntries(
        badgesData.map((b: BadgeDTO) => [b.id, b.code])
      );
      setBadges(badgeMap);

    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAccess(null);
    setFormData({
      startDate: "",
      endDate: "",
      airportId: 0,
      badgeId: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (access: AccessDTO) => {
    setEditingAccess(access);
    setFormData({ ...access });
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this access?")) return;
    try {
      await deleteAccess(id);
      await loadAll();
    } catch (err) {
      console.error("Error deleting access:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccess?.id) {
        await updateAccess(editingAccess.id, formData);
      } else {
        await createAccess(formData);
      }
      setShowModal(false);
      await loadAll();
    } catch (err) {
      console.error("Error saving access:", err);
    }
  };

  const filteredAccesses = accessList.filter((a) => {
    const query = searchQuery.toLowerCase();
    const airportName = airports[a.airportId]?.toLowerCase() || "";
    const badgeCode = badges[a.badgeId]?.toLowerCase() || "";
    return (
      airportName.includes(query) ||
      badgeCode.includes(query)
    );
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Access Management</h2>
        <Button variant="primary" onClick={openAddModal}>
          Add Access
        </Button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by description, airport or badge..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading accesses...</p>
        </div>
      ) : filteredAccesses.length === 0 ? (
        <div className="alert alert-info text-center">No accesses found.</div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Airport</th>
                <th>Badge</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccesses.map((a, index) => (
                <tr key={a.id}>
                  <td>{index + 1}</td>
                  <td>{airports[a.airportId] || `Airport ${a.airportId}`}</td>
                  <td>{badges[a.badgeId] || `Badge ${a.badgeId}`}</td>
                  <td>{a.startDate}</td>
                  <td>{a.endDate}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => openEditModal(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingAccess ? "Edit Access" : "Add New Access"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            

            <div className="mb-3">
              <Form.Label>Airport</Form.Label>
              <Form.Select
                value={formData.airportId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, airportId: Number(e.target.value) })
                }
                required
              >
                <option value="">Select an airport</option>
                {Object.entries(airports).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="mb-3">
              <Form.Label>Badge</Form.Label>
              <Form.Select
                value={formData.badgeId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, badgeId: Number(e.target.value) })
                }
                required
              >
                <option value="">Select a badge</option>
                {Object.entries(badges).map(([id, code]) => (
                  <option key={id} value={id}>
                    {code}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              {editingAccess ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AccessManagement;
