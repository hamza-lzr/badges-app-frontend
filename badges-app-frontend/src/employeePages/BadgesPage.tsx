import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Spinner,
  Alert,
  Button,
  Form,
  Row,
  Col,
  Pagination,
  Card,
  Badge as BsBadge,
  Modal,
  Container,
} from "react-bootstrap";
import { fetchBadgesByEmployee } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import type { BadgeDTO, CompanyDTO } from "../types";
import { useNavigate } from "react-router-dom";

const EmployeeBadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const badgesPerPage = 6;

  const [selectedBadge, setSelectedBadge] = useState<BadgeDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const data = await fetchBadgesByEmployee();
        setBadges(data);

        const companyData = await fetchCompanies();
        setCompanies(companyData);
      } catch (err) {
        console.error("Failed to fetch badges or companies", err);
        setError("Failed to load your badges. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, []);

  const handleRequestModification = (badgeId: number) => {
    navigate(`/employee/requests?type=badge&id=${badgeId}`);
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();
  const isExpiringSoon = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const getCompanyName = useCallback(
    (companyId: number) => {
      const company = companies.find((c) => c.id === companyId);
      return company ? company.name : `Company #${companyId}`;
    },
    [companies]
  );

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      const matchesSearch =
        badge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCompanyName(badge.companyId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "expired")
          matchesStatus = isExpired(badge.expiryDate);
        else if (statusFilter === "expiring")
          matchesStatus = isExpiringSoon(badge.expiryDate);
        else if (statusFilter === "active")
          matchesStatus =
            !isExpired(badge.expiryDate) && !isExpiringSoon(badge.expiryDate);
      }

      return matchesSearch && matchesStatus;
    });
  }, [badges, searchTerm, statusFilter, getCompanyName]);

  const totalPages = Math.ceil(filteredBadges.length / badgesPerPage);
  const paginatedBadges = filteredBadges.slice(
    (currentPage - 1) * badgesPerPage,
    currentPage * badgesPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        />
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={currentPage === idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      </Pagination>
    );
  };

  const openBadgeModal = (badge: BadgeDTO) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">Loading your badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4 text-center shadow-sm">
        {error}
      </Alert>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#333333" }}>My Badges</h1>
        <p className="text-muted">Manage your badge information and requests</p>
      </div>

      <Row className="mb-4">
        <Col md={6} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Search by badge code or company..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col md={6} className="mb-2">
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active"> Active</option>
            <option value="expiring"> Expiring Soon</option>
            <option value="expired"> Expired</option>
          </Form.Select>
        </Col>
      </Row>

      {filteredBadges.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          No badges found matching your criteria.
        </Alert>
      ) : (
        <>
          <Row className="g-4">
            {paginatedBadges.map((badge) => {
              const expired = isExpired(badge.expiryDate);
              const expSoon = isExpiringSoon(badge.expiryDate);

              let statusBadge;
              if (expired) {
                statusBadge = (
                  <BsBadge bg="danger" className="px-2 py-1">
                    Expired
                  </BsBadge>
                );
              } else if (expSoon) {
                statusBadge = (
                  <BsBadge bg="warning" text="dark" className="px-2 py-1">
                    Expiring Soon
                  </BsBadge>
                );
              } else {
                statusBadge = (
                  <BsBadge bg="success" className="px-2 py-1">
                    Active
                  </BsBadge>
                );
              }

              return (
                <Col key={badge.id} xs={12} sm={6} md={4} lg={4}>
                  <Card
                    className="shadow-sm h-100 border-0 hover-shadow rounded-4"
                    onClick={() => openBadgeModal(badge)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Card.Title className="fw-bold text-primary">
                          {badge.code}
                        </Card.Title>
                        {statusBadge}
                      </div>

                      <Card.Text className="small text-muted mb-1">
                        <i className="bi bi-building"></i> {getCompanyName(badge.companyId)}
                      </Card.Text>

                      <Card.Text className="small text-muted">
                        <i className="bi bi-calendar-x"></i> Expires: <strong>{new Date(badge.expiryDate).toLocaleDateString()}</strong>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {renderPagination()}
        </>
      )}

      <div className="text-center mt-4">
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() =>
            navigate("/employee/requests", {
              state: { openRequestModal: true, reqType: "NEW_BADGE" },
            })
          }
        >
          <i className="bi bi-plus-circle"></i> Request a New Badge
        </Button>
      </div>

      {selectedBadge && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
          className="badge-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="text-center w-100">
              <strong style={{ color: "#333333" }}>Badge Details</strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            <div
              className="rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center"
              style={{
                width: "400px",
                height: "250px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                padding: "20px",
              }}
            >
              <h5 className="fw-bold mb-3" style={{ color: "#333333" }}>
                Badge Code: {selectedBadge.code}
              </h5>
              <p className="text-muted mb-2">
                <i className="bi bi-building"></i> Company: {getCompanyName(selectedBadge.companyId)}
              </p>
              <p className="text-muted mb-2">
                <i className="bi bi-calendar"></i> Issued Date: {new Date(selectedBadge.issuedDate).toLocaleDateString()}
              </p>
              <p className="text-muted mb-2">
                <i className="bi bi-calendar-x"></i> Expiry Date: {new Date(selectedBadge.expiryDate).toLocaleDateString()}
              </p>
              <BsBadge
                bg={isExpired(selectedBadge.expiryDate) ? "danger" : isExpiringSoon(selectedBadge.expiryDate) ? "warning" : "success"}
                className="px-3 py-2 mt-3"
              >
                {isExpired(selectedBadge.expiryDate)
                  ? "Expired"
                  : isExpiringSoon(selectedBadge.expiryDate)
                  ? "Expiring Soon"
                  : "Active"}
              </BsBadge>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={() => {
                handleRequestModification(selectedBadge.id!);
                setShowModal(false);
              }}
            >
              <i className="bi bi-send"></i> Request Modification
            </Button>
            <Button
              variant="secondary"
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          h1, h5 {
            font-weight: 700;
          }

          p, .card-text {
            font-weight: 400;
          }

          .rounded-pill {
            border-radius: 50px;
          }
        `}
      </style>
    </Container>
  );
};

export default EmployeeBadgesPage;
