import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Spinner,
  Alert,
  Card,
  Button,
  Row,
  Col,
  Table,
  Form,
  Modal
} from "react-bootstrap";
import {
  fetchAccesses,
  createAccess,
  updateAccess,
  deleteAccess
} from "../api/apiAccess";
import { fetchAirports } from "../api/apiAirport";
import { fetchBadges } from "../api/apiBadge";
import { fetchEmployees } from "../api/ApiEmployee";
import type { AccessDTO, AirportDTO, BadgeDTO } from "../types";

// View modes for display
type ViewMode = "table" | "grid";

const AdminAccessesPage: React.FC = () => {
  const [accessList, setAccessList] = useState<AccessDTO[]>([]);
  const [airportsMap, setAirportsMap] = useState<Record<number, string>>({});
  const [badgesMap, setBadgesMap] = useState<Record<number, string>>({});
  const [employeeMap, setEmployeeMap] = useState<Record<number, { fullName: string; matricule: string }>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessDTO | null>(null);
  const [formData, setFormData] = useState<AccessDTO>({
    startDate: "",
    endDate: "",
    airportId: 0,
    badgeId: 0
  });

  // Filters
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
        const [accesses, airports, badges, employees] = await Promise.all([
          fetchAccesses(),
          fetchAirports(),
          fetchBadges(),
          fetchEmployees()
        ]);
        setAccessList(accesses);
        setAirportsMap(
          Object.fromEntries(airports.map((a: AirportDTO) => [a.id, `${a.name} (${a.iata})`]))
        );
        setBadgesMap(
          Object.fromEntries(badges.map((b: BadgeDTO) => [b.id!, b.code]))
        );
        setEmployeeMap(
          Object.fromEntries(
            employees.map(e => [
              e.id,
              { fullName: `${e.firstName} ${e.lastName}`, matricule: e.matricule }
            ])
          )
        );

        // Pre-fill filters/modal from navigation state
        const state = (location.state || {}) as { matriculeFilter?: string; openAddModal?: boolean };
        if (state.matriculeFilter) setMatriculeFilter(state.matriculeFilter);
        if (state.openAddModal) openAddModal();
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

  // Filtered lists
  const filteredBadges = Object.entries(badgesMap)
    .filter(([, code]) => code.toLowerCase().includes(badgeSearchQuery.toLowerCase()))
    .reduce((acc, [id, code]) => ({ ...acc, [Number(id)]: code }), {} as Record<number, string>);

  const filteredAccesses = accessList.filter(a => {
    const q = searchQuery.toLowerCase();
    const airportName = (airportsMap[a.airportId] || "").toLowerCase();
    const badgeCode = (badgesMap[a.badgeId] || "").toLowerCase();
    const ownerBadgeId = a.badgeId;
    const empMat = ownerBadgeId
      ? employeeMap[Object.keys(employeeMap).find(key => Number(key) === ownerBadgeId) as unknown as number]?.matricule.toLowerCase() || ""
      : "";
    const matchesSearch = badgeCode.includes(q) || airportName.includes(q);
    const matchesAirport = airportFilter === "" || a.airportId === airportFilter;
    const matchesMatricule = matriculeFilter === "" || empMat.includes(matriculeFilter.toLowerCase());
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
        <h2 className="fw-bold mb-0" style={{ color: "#333" }}>Access Management</h2>
        <div className="d-flex gap-2">
          <Button variant={viewMode === "table" ? "primary" : "outline-secondary"}
                  size="sm" className="rounded-pill" onClick={() => setViewMode("table")}>
            <i className="bi bi-list" />
          </Button>
          <Button variant={viewMode === "grid" ? "primary" : "outline-secondary"}
                  size="sm" className="rounded-pill" onClick={() => setViewMode("grid")}>
            <i className="bi bi-grid" />
          </Button>
          <Button variant="success" size="sm" className="rounded-pill" onClick={openAddModal}>
            <i className="bi bi-plus-circle" /> Add Access
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <Form.Select style={{ maxWidth: 200 }} value={airportFilter}
                     onChange={e => setAirportFilter(e.target.value === "" ? "" : Number(e.target.value))}>
          <option value="">All Airports</option>
          {Object.entries(airportsMap).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </Form.Select>
        <Form.Control type="text" placeholder="Search badge or airport…"
                      style={{ maxWidth: 250 }} value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)} />
        <Form.Control type="text" placeholder="Filter by matricule…"
                      style={{ maxWidth: 250 }} value={matriculeFilter}
                      onChange={e => setMatriculeFilter(e.target.value)} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /><p>Loading…</p></div>
      ) : filteredAccesses.length === 0 ? (
        <Alert variant="info" className="text-center">No accesses found.</Alert>
      ) : viewMode === "table" ? (
        <Table bordered hover responsive className="shadow-sm rounded-4 align-middle">
          <thead className="table-dark"><tr>
            <th>Badge</th><th>Airport</th><th>Start</th><th>End</th><th style={{ width: 150 }}>Actions</th>
          </tr></thead>
          <tbody>
            {filteredAccesses.map(a => (
              <tr key={a.id}>
                <td><strong>{badgesMap[a.badgeId]}</strong></td>
                <td>{airportsMap[a.airportId]}</td>
                <td>{a.startDate}</td>
                <td>{a.endDate}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => openEditModal(a)}>
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(a.id)}>
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Row className="g-4">
          {filteredAccesses.map(a => (
            <Col key={a.id} xs={12} md={6} lg={4}>
              <Card className="shadow-sm h-100 rounded-4 hover-shadow border-0">
                <Card.Body>
                  <Card.Title className="fw-bold text-primary">
                    Badge {badgesMap[a.badgeId]} @ {airportsMap[a.airportId]}
                  </Card.Title>
                  <Card.Text>
                    <strong>Start:</strong> {a.startDate}<br />
                    <strong>End:</strong> {a.endDate}
                  </Card.Text>
                  <div className="d-flex gap-2 mt-3">
                    <Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => openEditModal(a)}>Edit</Button>
                    <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(a.id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{editingAccess ? "Edit Access" : "Add New Access"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Airport</Form.Label>
              <Form.Select
                required
                value={formData.airportId}
                onChange={e => setFormData({ ...formData, airportId: Number(e.target.value) })}
              >
                <option value={0}>Select an airport</option>
                {Object.entries(airportsMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Badge</Form.Label>
              <Form.Control
                placeholder="Search badge…"
                value={badgeSearchQuery}
                onChange={e => setBadgeSearchQuery(e.target.value)}
                className="mb-2"
              />
              <Form.Select
                required
                value={formData.badgeId}
                onChange={e => setFormData({ ...formData, badgeId: Number(e.target.value) })}
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
                type="date" required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date" required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="justify-content-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="success">{editingAccess ? "Update" : "Save"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAccessesPage;
