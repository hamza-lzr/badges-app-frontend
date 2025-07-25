import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Form , Spinner} from "react-bootstrap";
import {
  fetchAccesses,
  createAccess,
  updateAccess,
  deleteAccess,
} from "../api/apiAccess";
import { fetchAirports } from "../api/apiAirport";
import { fetchBadges } from "../api/apiBadge";
import { fetchEmployees } from "../api/ApiEmployee";
import type { AccessDTO, AirportDTO, BadgeDTO } from "../types";

const AccessManagement: React.FC = () => {
  const [accessList, setAccessList] = useState<AccessDTO[]>([]);
  const [airports, setAirports] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<Record<number, BadgeDTO>>({});
  const [employeeMap, setEmployeeMap] = useState<
    Record<number, { fullName: string; matricule: string }>
  >({});
  const [loading, setLoading] = useState(true);

  // modal + form state
  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessDTO | null>(null);
  const [formData, setFormData] = useState<AccessDTO>({
    startDate: "",
    endDate: "",
    airportId: 0,
    badgeId: 0,
  });

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [airportFilter, setAirportFilter] = useState<number | "">("");
  const [matriculeFilter, setMatriculeFilter] = useState("");
  const [badgeSearchQuery, setBadgeSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [accesses, airportsData, badgesData, employeesData] =
          await Promise.all([
            fetchAccesses(),
            fetchAirports(),
            fetchBadges(),
            fetchEmployees(),
          ]);

        setAccessList(accesses);

        setAirports(
          Object.fromEntries(
            airportsData.map((a: AirportDTO) => [
              a.id,
              `${a.name} (${a.iata})`,
            ])
          )
        );

        setBadges(
          Object.fromEntries(
            badgesData.map((b) => [b.id!, b])
          ) as Record<number, BadgeDTO>
        );

        setEmployeeMap(
          Object.fromEntries(
            employeesData.map((e) => [
              e.id,
              { fullName: `${e.firstName} ${e.lastName}`, matricule: e.matricule },
            ])
          )
        );

        // apply any incoming state from Requests.tsx
        const state = (location.state || {}) as {
          matriculeFilter?: string;
          openAddModal?: boolean;
        };
        if (state.matriculeFilter) {
          setMatriculeFilter(state.matriculeFilter);
        }
        if (state.openAddModal) {
          openAddModal();
        }

        // clear it so it won't re-trigger
        navigate(location.pathname, { replace: true, state: {} });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBadges = Object.values(badges)
    .filter((b) =>
      b.code.toLowerCase().includes(badgeSearchQuery.toLowerCase())
    )
    .reduce((map, b) => {
      map[b.id!] = b.code;
      return map;
    }, {} as Record<number, string>);

  const filteredAccesses = accessList.filter((a) => {
    const q = searchQuery.toLowerCase();
    const airportName = (airports[a.airportId] || "").toLowerCase();
    const badgeCode = (badges[a.badgeId]?.code || "").toLowerCase();
    const ownerId = badges[a.badgeId]?.userId;
    const empMat = ownerId ? employeeMap[ownerId]?.matricule.toLowerCase() : "";

    const matchesSearch = badgeCode.includes(q) || airportName.includes(q);
    const matchesAirport =
      airportFilter === "" || a.airportId === airportFilter;
    const matchesMatricule =
      matriculeFilter === "" || empMat.includes(matriculeFilter.toLowerCase());

    return matchesSearch && matchesAirport && matchesMatricule;
  });

  function openAddModal() {
    setEditingAccess(null);
    setFormData({ startDate: "", endDate: "", airportId: 0, badgeId: 0 });
    setShowModal(true);
  }

  function openEditModal(access: AccessDTO) {
    setEditingAccess(access);
    setFormData({ ...access });
    setShowModal(true);
  }

  async function handleDelete(id?: number) {
    if (!id || !window.confirm("Delete this access?")) return;
    await deleteAccess(id);
    setAccessList(await fetchAccesses());
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingAccess?.id) await updateAccess(editingAccess.id, formData);
    else await createAccess(formData);
    setShowModal(false);
    setAccessList(await fetchAccesses());
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Access Management</h2>
        <Button onClick={openAddModal}>Add Access</Button>
      </div>

      {/* Filters */}
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
          <option value="">All Airports</option>
          {Object.entries(airports).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Form.Select>

        <Form.Control
          type="text"
          placeholder="Search badge code or airport…"
          style={{ maxWidth: 250 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Form.Control
          type="text"
          placeholder="Filter by employee matricule…"
          style={{ maxWidth: 250 }}
          value={matriculeFilter}
          onChange={(e) => setMatriculeFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Loading…</p>
        </div>
      ) : filteredAccesses.length === 0 ? (
        <div className="alert alert-info text-center">No accesses found.</div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Badge</th>
                <th>Airport</th>
                <th>Start</th>
                <th>End</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccesses.map((a) => (
                <tr key={a.id}>
                  <td><strong>{badges[a.badgeId]?.code}</strong></td>
                  <td>{airports[a.airportId]}</td>
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingAccess ? "Edit Access" : "Add New Access"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Airport</Form.Label>
              <Form.Select
                required
                value={formData.airportId}
                onChange={(e) =>
                  setFormData({ ...formData, airportId: +e.target.value })
                }
              >
                <option value={0}>Select an airport</option>
                {Object.entries(airports).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Badge</Form.Label>
              <Form.Control
                className="mb-2"
                placeholder="Search badge code…"
                value={badgeSearchQuery}
                onChange={(e) => setBadgeSearchQuery(e.target.value)}
              />
              <Form.Select
                required
                value={formData.badgeId}
                onChange={(e) =>
                  setFormData({ ...formData, badgeId: +e.target.value })
                }
              >
                <option value={0}>Select a badge</option>
                {Object.entries(filteredBadges).map(([id, code]) => (
                  <option key={id} value={id}>{code}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="justify-content-end">
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
