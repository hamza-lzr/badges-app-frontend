import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import { fetchEmployees } from "../api/ApiEmployee";
import { createBadge, fetchBadgeById, fetchBadges } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import type { UserDTO, BadgeDTO } from "../types";
import { useLocation, useNavigate } from "react-router-dom";

type BadgeMap = Record<number, BadgeDTO>;

const Badges: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<BadgeMap>({});
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
  const [selectedBadgeByUser, setSelectedBadgeByUser] = useState<
    Record<number, number | "">
  >({});

  // Badge creation data
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const location = useLocation();
  const navigate = useNavigate();

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

    if (state.openGenerateModalForUser != null && employees.length) {
      const user = employees.find(
        (e) => e.id === state.openGenerateModalForUser
      );
      if (user) {
        openGenerateBadgeModal(user);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [
    location.state,
    employees,
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
      const data = await fetchBadges();
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

  const employeeHasExpiredBadge = (emp: UserDTO) => {
    return emp.badgesIds.some((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });
  };

  const employeeAllBadgesExpired = (emp: UserDTO): boolean =>
    emp.badgesIds.every((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });

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

    const matchesExpired = !showExpiredOnly || employeeHasExpiredBadge(emp);

    return matchesSearch && matchesCompany && matchesExpired;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openGenerateBadgeModal = (employee: UserDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    setSelectedEmployee(employee);
    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      companyId: employee.companyId,
      status: "ACTIVE",
    });
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setSelectedEmployee(null);
    setBadgeData({});
  };

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !badgeData.code ||
      !badgeData.issuedDate ||
      !badgeData.expiryDate ||
      !selectedEmployee?.id ||
      !badgeData.companyId ||
      !badgeData.status
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
        userId: selectedEmployee.id,
        accessListIds: [],
        status: badgeData.status,
      });

      await loadEmployees();
      closeGenerateModal();
    } catch (err) {
      console.error("Error creating badge:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <div className="container py-4">
      {/* Header & Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Badges Management</h2>

        <div className="d-flex gap-3 align-items-center">
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

          <Form.Control
            type="text"
            placeholder="Search employees, badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "250px" }}
          />

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

      {/* Table Section */}
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
                    <th style={{ width: "12%" }}>Employee</th>
                    <th style={{ width: "10%" }}>Matricule</th>
                    <th style={{ width: "18%" }}>Email</th>
                    <th style={{ width: "15%" }}>Company</th>
                    <th style={{ width: "8%" }}>Badges</th>
                    <th style={{ width: "29%" }}>Actions</th>
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
                      <td>
                        <span className="text-muted">
                          {emp.matricule}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "150px" }}
                        >
                          {emp.email}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "120px" }}
                        >
                          {companies[emp.companyId] || "Unknown"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-secondary me-1">
                            {emp.badgesIds.length}
                          </span>
                          {emp.badgesIds.length > 0 &&
                            employeeAllBadgesExpired(emp) && (
                              <span className="badge bg-danger">Expired</span>
                            )}
                        </div>
                      </td>
                      <td>
                        <div className="actions-container">
                          {(() => {
                            const empId = emp.id!;
                            const badgeIds = emp.badgesIds ?? [];
                            const hasBadges = badgeIds.length > 0;
                            const selected = selectedBadgeByUser[empId] ?? "";

                            return (
                              <>
                                <Form.Select
                                  size="sm"
                                  value={selected}
                                  onChange={(e) =>
                                    setSelectedBadgeByUser((prev) => ({
                                      ...prev,
                                      [empId]:
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value),
                                    }))
                                  }
                                  disabled={!hasBadges}
                                  aria-disabled={!hasBadges}
                                  title={
                                    hasBadges
                                      ? "Select a badge"
                                      : "No badges for this employee"
                                  }
                                  className="action-select"
                                >
                                  {hasBadges ? (
                                    <>
                                      <option value="">Select Badge</option>
                                      {badgeIds.map((id) => (
                                        <option key={id} value={id}>
                                          {badges[id]?.code || `Badge ${id}`}
                                        </option>
                                      ))}
                                    </>
                                  ) : (
                                    <option value="">No badges</option>
                                  )}
                                </Form.Select>

                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => {
                                    if (selected !== "")
                                      openBadgeDetails(Number(selected));
                                  }}
                                  disabled={!hasBadges || selected === ""}
                                  className="action-btn action-btn-view"
                                >
                                  Afficher
                                </Button>

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openGenerateBadgeModal(emp)}
                                  className="action-btn action-btn-add"
                                >
                                  Ajouter
                                </Button>
                              </>
                            );
                          })()}
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

      {/* Pagination Info */}
      <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
        <small className="text-muted">
          Page {currentPage} of {totalPages} • Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
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
                onChange={(e) =>
                  setBadgeData({ ...badgeData, code: e.target.value })
                }
                required
              />
            </Form.Group>

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
            <Form.Group className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={badgeData.status || "ACTIVE"}
                onChange={(e) =>
                  setBadgeData({
                    ...badgeData,
                    status: e.target.value as "ACTIVE" | "INACTIVE",
                  })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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

      {/* Badge Details Modal */}
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
                  <p>
                    <strong>Status:</strong> {badgeDetails.status}
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

      {/* Consistent CSS Styles */}
      <style>
        {`
          /* Actions container with consistent grid layout */
          .actions-container {
            display: grid;
            grid-template-columns: 130px 80px 90px;
            gap: 6px;
            align-items: center;
            width: 100%;
            min-width: 306px; /* Prevents shrinking */
          }

          /* Consistent select field sizing */
          .action-select {
            width: 130px !important;
            min-width: 130px !important;
            max-width: 130px !important;
            font-size: 1rem;
          }

          /* Consistent button sizing */
          .action-btn {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 1rem;
          }

          .action-btn-view {
            width: 80px !important;
            min-width: 80px !important;
            max-width: 80px !important;
          }

          .action-btn-add {
            width: 90px !important;
            min-width: 90px !important;
            max-width: 90px !important;
          }

          /* Responsive behavior */
          @media (max-width: 768px) {
            .actions-container {
              grid-template-columns: 1fr;
              gap: 4px;
              min-width: auto;
            }
            
            .action-select,
            .action-btn-view,
            .action-btn-add {
              width: 100% !important;
              min-width: auto !important;
              max-width: none !important;
            }
          }

          /* Table improvements */
          .custom-table th {
            font-weight: 600;
            font-size: 1rem;
            border-bottom: 2px solid #dee2e6;
          }

          .custom-table td {
            vertical-align: middle;
            font-size: 1rem;
            padding: 0.75rem 0.5rem;
          }

          /* Ensure table layout is stable */
          .custom-table {
            table-layout: fixed;
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default Badges;
