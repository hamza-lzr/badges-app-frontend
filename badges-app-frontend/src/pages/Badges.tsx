import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Row, Col, Pagination } from "react-bootstrap";
import { fetchEmployees } from "../api/ApiEmployee";
import { createBadge, fetchBadgeById, fetchBadges } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import type { UserDTO, BadgeDTO } from "../types";
import { useLocation, useNavigate } from "react-router-dom";


type BadgeMap = Record<number, BadgeDTO>;

const Badges: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<BadgeMap>({}); // ✅ only ONE badges state with full BadgeDTO
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<number | "">("");
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<UserDTO | null>(
    null
  );
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  // Badge creation data
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fetch all data initially
  useEffect(() => {
    const loadAll = async () => {
      await loadCompanies();
      await loadBadges();
      await loadEmployees();
    };
    loadAll();
  }, []);

  useEffect(() => {
    const state = (location.state || {}) as {
      openGenerateModalForUser?: number;
    };

    // if the router told us to open for a specific user…
    if (state.openGenerateModalForUser != null && employees.length) {
      const user = employees.find(
        (e) => e.id === state.openGenerateModalForUser
      );
      if (user) {
        openGenerateBadgeModal(user);
        // clear the router‐state so it doesn’t re‑fire
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [
    location.state, // watch for incoming router‐state
    employees, // only fire once we actually have employees
    navigate,
    location.pathname,
  ]);

  const loadCompanies = async () => {
    try {
      const data = await fetchCompanies();
      const companyMap = Object.fromEntries(data.map((c) => [c.id!, c.name]));
      setCompanies(companyMap);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const loadBadges = async () => {
    try {
      const data = await fetchBadges(); // returns full BadgeDTO[]
      const badgeMap: BadgeMap = {};
      data.forEach((b) => {
        if (b.id) badgeMap[b.id] = b;
      });
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

  /** ✅ Helper: Does this employee have at least one expired badge? */
  const employeeHasExpiredBadge = (emp: UserDTO) => {
    return emp.badgesIds.some((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });
  };

  // Returns true only if every badge for the employee is expired
  const employeeAllBadgesExpired = (emp: UserDTO): boolean =>
    emp.badgesIds.every((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });

  /** ✅ Filtering logic */
  const filteredEmployees = employees.filter((emp) => {
    const companyName = companies[emp.companyId]?.toLowerCase() || "";
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matricule = emp.matricule?.toLowerCase() || "";
    const badgeCodes = emp.badgesIds
      .map((id) => badges[id]?.code?.toLowerCase() || "")
      .join(" ");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      matricule.includes(query) ||
      companyName.includes(query) ||
      badgeCodes.includes(query);

    const matchesCompany =
      companyFilter === "" || emp.companyId === companyFilter;

    const matchesExpired = !showExpiredOnly || employeeHasExpiredBadge(emp); // ✅ only keep expired if checked

    return matchesSearch && matchesCompany && matchesExpired;
  });
//Pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** ✅ Open Generate Badge Modal */
  const openGenerateBadgeModal = (employee: UserDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    setSelectedEmployee(employee);
    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      companyId: employee.companyId,
    });
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setSelectedEmployee(null);
    setBadgeData({});
  };

  /** ✅ Handle Badge Creation */
  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !badgeData.code ||
      !badgeData.issuedDate ||
      !badgeData.expiryDate ||
      !selectedEmployee?.id ||
      !badgeData.companyId
    ) {
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
        userId: selectedEmployee.id, // still required
        accessListIds: [],
      });

      await loadEmployees();
      closeGenerateModal();
    } catch (err) {
      console.error("Error creating badge:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /** ✅ Badge Details Modal */
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

    const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <Pagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}
        <Pagination.Next
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <div className="container py-4">
      {/* ✅ Header & Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Badges Management</h2>

        <div className="d-flex gap-3 align-items-center">
          {/* Company filter */}
          <Form.Select
            value={companyFilter}
            onChange={(e) =>
              setCompanyFilter(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            style={{ maxWidth: "200px" }}
          >
            <option value="">All Companies</option>
            {Object.entries(companies).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Form.Select>

          {/* Search */}
          <Form.Control
            type="text"
            placeholder="Search employees, badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "250px" }}
          />

          {/* ✅ Expired Badge Filter Toggle */}
          <div className="d-flex align-items-center">
            <Form.Check
              type="switch"
              id="expired-toggle"
              checked={showExpiredOnly}
              onChange={(e) => setShowExpiredOnly(e.target.checked)}
            />
            <small className="ms-2 text-muted" style={{ whiteSpace: "nowrap" }}>
              Only expired badges
            </small>
          </div>
        </div>
      </div>

      {/* ✅ Table Section */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="alert alert-light text-center border">
          No employees found matching your search/filter.
        </div>
      ) : (
<div className="card shadow-sm mb-4">

  <div className="card-body p-0">
    <div className="table-responsive">
      <table className="table table-hover mb-0 custom-table">
        <thead>
          <tr className="table-dark">
            <th>Employee</th>
            <th>Matricule</th>
            <th>Email</th>
            <th>Company</th>
            <th>Badges</th>
            <th style={{ width: "22%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map((emp) => (
            <tr key={emp.id}>
              <td>
                <strong>
                  {emp.firstName} {emp.lastName}
                </strong>
              </td>
              <td>{emp.matricule}</td>
              <td>{emp.email}</td>
              <td>{companies[emp.companyId] || "Unknown"}</td>
              <td>
                {emp.badgesIds.length} badge
                {emp.badgesIds.length !== 1 ? "s" : ""}
                {emp.badgesIds.length > 0 && employeeAllBadgesExpired(emp) && (
                  <span className="ms-2 text-danger fw-bold">(Expired)</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-2">
                  {emp.badgesIds.length > 0 && (
                    <Form.Select
                      size="sm"
                      value={selectedBadgeId || ""}
                      onChange={(e) =>
                        setSelectedBadgeId(Number(e.target.value))
                      }
                      style={{ width: "150px" }}
                    >
                      <option value="">Select Badge</option>
                      {emp.badgesIds.map((id) => (
                        <option key={id} value={id}>
                          {badges[id]?.code || `Badge ${id}`}
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
    {renderPagination()}
</div>
      
      )}
      {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <small className="text-muted">
              Page {currentPage} of {totalPages}
            </small>
            <div className="pagination-buttons">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>

      {/* ✅ Generate Badge Modal */}
      <Modal show={showGenerateModal} onHide={closeGenerateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate New Badge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="generate-badge-form" onSubmit={handleBadgeSubmit}>
            {/* Badge Code */}
            <Form.Group className="mb-3">
              <Form.Label>Badge Code</Form.Label>
              <Form.Control
                type="text"
                value={badgeData.code || ""}
                onChange={(e) =>
                  setBadgeData({ ...badgeData, code: e.target.value })
                }
                required
              />
            </Form.Group>

            {/* Issued / Expiry Dates */}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Issued Date</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={badgeData.issuedDate || ""}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={badgeData.expiryDate || ""}
                    onChange={(e) =>
                      setBadgeData({
                        ...badgeData,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Company Selector */}
            <Form.Group>
              <Form.Label>Company</Form.Label>
              <Form.Select
                value={badgeData.companyId || ""}
                onChange={(e) =>
                  setBadgeData({
                    ...badgeData,
                    companyId: Number(e.target.value),
                  })
                }
              >
                {Object.entries(companies).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeGenerateModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="generate-badge-form"
            disabled={submitting}
          >
            {submitting ? "Generating..." : "Generate"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Badge Details Modal */}
      <Modal show={showDetailsModal} onHide={closeBadgeDetailsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Badge Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {badgeDetails ? (
            (() => {
              const employee = employees.find(
                (e) => e.id === badgeDetails.userId
              );
              const employeeName = employee
                ? `${employee.firstName} ${employee.lastName}`
                : `User #${badgeDetails.userId}`;

              const isExpired = new Date(badgeDetails.expiryDate) < new Date();

              return (
                <div className="p-3 border rounded bg-light">
                  <h5 className="fw-bold">{badgeDetails.code}</h5>
                  <p>
                    <strong>Full Name:</strong> {employeeName}
                  </p>
                  <p>
                    <strong>Issued:</strong> {badgeDetails.issuedDate}
                  </p>
                  <p className={isExpired ? "text-danger fw-bold" : ""}>
                    <strong>Expiry:</strong> {badgeDetails.expiryDate}{" "}
                    {isExpired && "(Expired)"}
                  </p>
                  <p>
                    <strong>Company:</strong>{" "}
                    {companies[badgeDetails.companyId]}
                  </p>
                </div>
              );
            })()
          ) : (
            <p className="text-muted">No badge selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeBadgeDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Badges;
