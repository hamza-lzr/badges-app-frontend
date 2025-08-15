import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Form,
  Pagination,
  Modal,
  Button,
  Badge as BsBadge,
  Table,
  ButtonGroup,
  InputGroup,
} from "react-bootstrap";
import { fetchConges, createConge } from "../api/apiConge";
import { fetchMyProfile } from "../api/ApiEmployee";
import type { CongeDTO, UserDTO } from "../types";

type ViewMode = "cards" | "table";

const EmployeeCongesPage: React.FC = () => {
  const [conges, setConges] = useState<CongeDTO[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const congesPerPage = 9;

  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const [selectedConge, setSelectedConge] = useState<CongeDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load data
  const loadConges = async () => {
    try {
      setLoading(true);
      const data = await fetchConges();
      setConges(data || []);
    } catch (err) {
      console.error("Error loading congés:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profile: UserDTO = await fetchMyProfile();
        setUserId(profile.id);
        await loadConges();
      } catch (err) {
        console.error("Error loading profile or congés", err);
      }
    };
    init();
  }, []);

  // Helpers
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <BsBadge bg="success">Approved</BsBadge>;
      case "REJECTED":
        return <BsBadge bg="danger">Rejected</BsBadge>;
      default:
        return (
          <BsBadge bg="warning" text="dark">
            Pending
          </BsBadge>
        );
    }
  };

  const rangeInvalid = !!startDate && !!endDate && startDate > endDate; // "YYYY-MM-DD" compares lexically

  const filteredSorted = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const arr = (conges || []).filter((c) => {
      const desc = c.description?.toLowerCase() || "";
      const dateRange = `${c.startDate ?? ""} ${c.endDate ?? ""}`.toLowerCase();
      const searchMatch = desc.includes(term) || dateRange.includes(term);
      const statusMatch = statusFilter === "all" || c.status === statusFilter;
      return searchMatch && statusMatch;
    });

    // Sort: latest → oldest by createdAt, fallback to startDate
    arr.sort((a, b) => {
      const aKey = a.createdAt || a.startDate || "";
      const bKey = b.createdAt || b.startDate || "";
      return new Date(bKey).getTime() - new Date(aKey).getTime();
    });

    return arr;
  }, [conges, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSorted.length / congesPerPage) || 1;

  const paginatedConges = filteredSorted.slice(
    (currentPage - 1) * congesPerPage,
    currentPage * congesPerPage
  );

  // Reset to first page when filters/search/view change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  return (
    <Container className="py-5">
      {/* Header (centered) */}
      <div className="text-center mb-3">
        <h1 className="fw-bold mb-1" style={{ color: "#333" }}>
          My Leave Requests
        </h1>
        <div className="text-muted">Track and manage your submitted leaves</div>
      </div>

{/* Toolbar: search + status + view toggle + CTA */}
<div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2 gap-md-3 px-3 py-2 mb-4">
  {/* Left: Search + Filter with spacing */}
  <div className="d-flex align-items-center gap-2">
    <InputGroup className="flex-grow-1" style={{ minWidth: 390, maxWidth: 600 }}>
      <InputGroup.Text>
        <i className="bi bi-search"></i>
      </InputGroup.Text>
      <Form.Control
        placeholder="Search by description or dates..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />
    </InputGroup>

    {/* add a little spacing to the left on top of gap */}
    <Form.Select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
      }}
      className="w-auto ms-1 ms-md-2"
      style={{ minWidth: 140, maxWidth: 220 }}
    >
      <option value="all">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
    </Form.Select>
  </div>

  {/* Right: View toggle + CTA */}
  <div className="d-flex align-items-center justify-content-end gap-2">
    <ButtonGroup aria-label="View mode">
      <Button
        variant={viewMode === "cards" ? "primary" : "outline-primary"}
        onClick={() => setViewMode("cards")}
        title="Cards view"
      >
        <i className="bi bi-grid-3x3-gap-fill" />
      </Button>
      <Button
        variant={viewMode === "table" ? "primary" : "outline-primary"}
        onClick={() => setViewMode("table")}
        title="List view"
      >
        <i className="bi bi-list" />
      </Button>
    </ButtonGroup>

    <Button
      variant="outline-success"
      className="rounded-pill px-3"
      onClick={() => setShowCreateModal(true)}
    >
      <i className="bi bi-plus-circle me-2"></i>Request a Leave
    </Button>
  </div>
</div>


      {/* Content */}
      {loading ? (
        <div className="d-flex flex-column align-items-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading your leaves...</p>
        </div>
      ) : filteredSorted.length === 0 ? (
        <Alert variant="light" className="text-center border">
          No leave requests found.
        </Alert>
      ) : viewMode === "cards" ? (
        <>
          <Row className="g-4">
            {paginatedConges.map((conge) => (
              <Col key={conge.id} xs={12} sm={6} md={4}>
                <Card
                  className="shadow-sm h-100 border-0 rounded-4"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedConge(conge);
                    setShowModal(true);
                  }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Card.Title className="fw-bold text-primary mb-0">
                        {formatDate(conge.startDate)} →{" "}
                        {formatDate(conge.endDate)}
                      </Card.Title>
                      {renderStatusBadge(conge.status)}
                    </div>
                    <div className="small text-muted mb-2">
                      Requested: {formatDate(conge.createdAt)}
                    </div>
                    <Card.Text
                      className="text-secondary"
                      style={{ minHeight: 48 }}
                    >
                      {conge.description || (
                        <span className="text-muted">No description</span>
                      )}
                    </Card.Text>
                    <div className="mt-auto d-flex justify-content-end">
                      <i className="bi bi-chevron-right text-primary" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <>
          <div className="card shadow-sm">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Date Range</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Requested on</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedConges.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </td>
                      <td>{renderStatusBadge(c.status)}</td>
                      <td className="text-secondary">
                        {c.description || (
                          <span className="text-muted">No description</span>
                        )}
                      </td>
                      <td className="text-muted">{formatDate(c.createdAt)}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setSelectedConge(c);
                            setShowModal(true);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {filteredSorted.length > 0 && totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          />
        </Pagination>
      )}

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConge && (
            <>
              <p className="mb-2">
                <strong>Date Range:</strong>{" "}
                {formatDate(selectedConge.startDate)} →{" "}
                {formatDate(selectedConge.endDate)}
              </p>
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                {renderStatusBadge(selectedConge.status)}
              </p>
              <p className="mb-2">
                <strong>Description:</strong>{" "}
                {selectedConge.description || "N/A"}
              </p>
              <p className="mb-0">
                <strong>Requested on:</strong>{" "}
                {formatDate(selectedConge.createdAt)}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Request a New Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                max={endDate || undefined}
                isInvalid={rangeInvalid}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Start date cannot be after end date.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                min={startDate || undefined}
                isInvalid={rangeInvalid}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                End date must be on or after start date.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-1">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your leave"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={
              submitting || !startDate || !endDate || !userId || rangeInvalid
            }
            onClick={async () => {
              if (rangeInvalid) return;
              setSubmitting(true);
              try {
                const createdAt = new Date().toISOString();
                await createConge({
                  startDate,
                  endDate,
                  description,
                  createdAt,
                  status: "PENDING",
                  userId: userId!,
                });
                await loadConges();
                setShowCreateModal(false);
                setStartDate("");
                setEndDate("");
                setDescription("");
              } catch (err) {
                console.error("Error creating conge:", err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeCongesPage;
