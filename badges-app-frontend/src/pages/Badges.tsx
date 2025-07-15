import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { fetchEmployees } from "../api/ApiEmployee";
import { createBadge, fetchBadgeById, fetchBadges } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import type { UserDTO, BadgeDTO } from "../types";

const Badges: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Selected badge / employee
  const [selectedEmployee, setSelectedEmployee] = useState<UserDTO | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  // Badge data for creation
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      await loadCompanies();
      await loadBadges();
      await loadEmployees();
    };
    loadAll();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await fetchCompanies();
      const companyMap = Object.fromEntries(
        data.map((c) => [c.id!, c.name])
      );
      setCompanies(companyMap);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const loadBadges = async () => {
    try {
      const data = await fetchBadges();
      const badgeMap = Object.fromEntries(
        data.map((b) => [b.id!, b.code])
      );
      setBadges(badgeMap);
    } catch (err) {
      console.error("Error fetching badges:", err);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Open Generate Badge Modal */
  const openGenerateBadgeModal = (employee: UserDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    setSelectedEmployee(employee);
    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      userId: employee.id,
      companyId: employee.companyId,
    });
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setSelectedEmployee(null);
    setBadgeData({});
  };

  /** Handle Badge Creation */
  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeData.code || !badgeData.issuedDate || !badgeData.expiryDate || !badgeData.userId || !badgeData.companyId) {
      console.error("Incomplete badge data");
      return;
    }

    setSubmitting(true);
    try {
      await createBadge({
        code: badgeData.code,
        issuedDate: badgeData.issuedDate,
        expiryDate: badgeData.expiryDate,
        companyId: badgeData.companyId,
        userId: badgeData.userId,
        accessListIds: [],
      });

      await loadEmployees();
      setShowGenerateModal(false);
    } catch (err) {
      console.error("Error creating badge:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /** Badge Details Modal */
  const openBadgeDetails = async (badgeId: number) => {
    try {
      const badge = await fetchBadgeById(badgeId);
      setBadgeDetails(badge);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching badge details:", err);
    }
  };

  const closeBadgeDetailsModal = () => {
    setShowDetailsModal(false);
    setBadgeDetails(null);
    setSelectedBadgeId(null);
  };

  /** Filter Employees by Search */
  const filteredEmployees = employees.filter((emp) => {
    const companyName = companies[emp.companyId]?.toLowerCase() || "";
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matricule = emp.matricule?.toLowerCase() || "";
    const badgeCodes = emp.badgesIds.map((id) => badges[id]?.toLowerCase() || "").join(" ");
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      matricule.includes(query) ||
      companyName.includes(query) ||
      badgeCodes.includes(query)
    );
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold">Badges Management</h2>
        <Form.Control
          type="text"
          placeholder="Search employees, companies, badges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="alert alert-light text-center border">
          No employees found matching your search.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Matricule</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Company</th>
                <th>Badges</th>
                <th style={{ width: "22%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id}>
                  <td><span className="badge bg-secondary">{index + 1}</span></td>
                  <td>{emp.matricule}</td>
                  <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                  <td>{emp.email}</td>
                  <td>{companies[emp.companyId] || "Unknown"}</td>
                  <td>
                    {emp.badgesIds.length} badge{emp.badgesIds.length !== 1 ? "s" : ""}
                  </td>
                  <td className="d-flex gap-2">
                    {/* Show available badges */}
                    {emp.badgesIds.length > 0 && (
                      <Form.Select
                        size="sm"
                        value={selectedBadgeId || ""}
                        onChange={(e) => setSelectedBadgeId(Number(e.target.value))}
                        style={{ width: "150px" }}
                      >
                        <option value="">Select Badge</option>
                        {emp.badgesIds.map((id) => (
                          <option key={id} value={id}>
                            {badges[id] || `Badge ${id}`}
                          </option>
                        ))}
                      </Form.Select>
                    )}

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => openBadgeDetails(selectedBadgeId!)}
                      disabled={!selectedBadgeId}
                    >
                      View
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openGenerateBadgeModal(emp)}
                    >
                      Add Badge
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Badge Modal */}
      <Modal show={showGenerateModal} onHide={closeGenerateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate New Badge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="generate-badge-form" onSubmit={handleBadgeSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Badge Code</Form.Label>
              <Form.Control
                type="text"
                value={badgeData.code || ""}
                onChange={(e) => setBadgeData({ ...badgeData, code: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Issued Date</Form.Label>
                  <Form.Control type="text" readOnly value={badgeData.issuedDate || ""} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control type="text" readOnly value={badgeData.expiryDate || ""} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>User</Form.Label>
                  <Form.Control readOnly value={selectedEmployee?.id || ""} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Company</Form.Label>
                  <Form.Control readOnly value={selectedEmployee ? companies[selectedEmployee.companyId] : ""} />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeGenerateModal}>Cancel</Button>
          <Button type="submit" form="generate-badge-form" disabled={submitting}>
            {submitting ? "Generating..." : "Generate"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Badge Details Modal */}
      <Modal show={showDetailsModal} onHide={closeBadgeDetailsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Badge Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {badgeDetails ? (
            <div className="p-3 border rounded bg-light">
              <h5 className="fw-bold">{badgeDetails.code}</h5>
              <p className="mb-1"><strong>Issued:</strong> {badgeDetails.issuedDate}</p>
              <p className="mb-1"><strong>Expiry:</strong> {badgeDetails.expiryDate}</p>
              <p className="mb-1"><strong>Company:</strong> {badgeDetails.companyId}</p>
              <p><strong>User ID:</strong> {badgeDetails.userId}</p>
            </div>
          ) : (
            <p className="text-muted">No badge selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeBadgeDetailsModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Badges;
