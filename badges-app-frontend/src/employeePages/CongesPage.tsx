import React, { useEffect, useState, useMemo } from "react";
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
} from "react-bootstrap";
import { fetchConges, createConge } from "../api/apiConge";
import { fetchMyProfile } from "../api/ApiEmployee";
import type { CongeDTO, UserDTO } from "../types";

const EmployeeCongesPage: React.FC = () => {
  const [conges, setConges] = useState<CongeDTO[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const congesPerPage = 6;

  const [selectedConge, setSelectedConge] = useState<CongeDTO | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Reusable loader function
  const loadConges = async () => {
    try {
      setLoading(true);
      const data = await fetchConges();
      setConges(data);
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

  const filteredConges = useMemo(() => {
    return conges.filter((c) => {
      const desc = c.description?.toLowerCase() || "";
      const dateRange = `${c.startDate} ${c.endDate}`;
      const searchMatch =
        desc.includes(searchTerm.toLowerCase()) ||
        dateRange.includes(searchTerm);

      const statusMatch = statusFilter === "all" || c.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [conges, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredConges.length / congesPerPage);
  const paginatedConges = filteredConges.slice(
    (currentPage - 1) * congesPerPage,
    currentPage * congesPerPage
  );

  const renderStatusBadge = (status: string) => {
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

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#333333" }}>
          My Leave Requests
        </h1>
        <p className="text-muted">
          Track and manage your submitted leave requests
        </p>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            placeholder="Search by description or dates..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex flex-column align-items-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading your leaves...</p>
        </div>
      ) : filteredConges.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          No leave requests found.
        </Alert>
      ) : (
        <>
          <Row className="g-4">
            {paginatedConges.map((conge) => (
              <Col key={conge.id} xs={12} sm={6} md={4}>
                <Card
                  className="shadow-sm h-100 border-0 hover-shadow rounded-4"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedConge(conge);
                    setShowModal(true);
                  }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Card.Title className="fw-bold text-primary">
                        {conge.startDate} → {conge.endDate}
                      </Card.Title>
                      {renderStatusBadge(conge.status)}
                    </div>
                    <Card.Text className="small text-muted">
                      {conge.description || "No description"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              />
            </Pagination>
          )}
        </>
      )}

      {/* ➕ Button to trigger modal */}
      <div className="text-center mt-4">
        <Button
          variant="outline-success"
          className="rounded-pill px-4 py-2 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle"></i> Request a Leave
        </Button>
      </div>

      {/* 📄 Modal for viewing conge details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConge && (
            <>
              <p>
                <strong>Date Range:</strong> {selectedConge.startDate} →{" "}
                {selectedConge.endDate}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {renderStatusBadge(selectedConge.status)}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedConge.description || "N/A"}
              </p>
              <p>
                <strong>Requested on:</strong> {selectedConge.createdAt}
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

      {/* 📝 Modal for creating new conge */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
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
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={submitting || !startDate || !endDate || !userId}
            onClick={async () => {
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

