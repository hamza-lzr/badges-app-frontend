import React, { useEffect, useState } from "react";
import { fetchMyRequests, createMyRequest } from "../api/apiRequest";
import { fetchMyProfile } from "../api/ApiEmployee"; // ✅ NEW: same approach as Badges page
import type { Request, ReqStatus, ReqType, UserDTO } from "../types";
import {
  Spinner,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Pagination,
} from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";

const STATUS_OPTIONS: ReqStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const TYPE_OPTIONS: ReqType[] = [
  "AIRPORT_ACCESS",
  "PROFILE",
  "NEW_BADGE",
  "COMPANY",
  "OTHER",
];

const formatEnum = (text: string) =>
  text
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const EmployeeRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<ReqStatus | "ALL">("ALL");

  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState<{
    description: string;
    reqType: ReqType;
  }>({
    description: "",
    reqType: "OTHER",
  });

  // ✅ Logged-in user
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);

  const location = useLocation();
  const state = location.state as { openRequestModal?: boolean; reqType?: ReqType };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  // ✅ Fetch logged-in user first
  useEffect(() => {
    const loadUserAndRequests = async () => {
      try {
        // fetch user like in Badges page
        const user = await fetchMyProfile();
        setCurrentUser(user);

        const data = await fetchMyRequests();
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRequests(sorted);
      } catch (err) {
        console.error("Failed to fetch user or requests", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndRequests();
  }, []);

  useEffect(() => {
    if (state?.openRequestModal) {
      setShowModal(true);
      setNewRequest((prev) => ({
        ...prev,
        reqType: state.reqType || "OTHER",
      }));
    }
  }, [state]);

  const filteredRequests =
    filterStatus === "ALL"
      ? requests
      : requests.filter((req) => req.reqStatus === filterStatus);

  const getStatusBadge = (status: ReqStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );
      case "APPROVED":
        return <Badge bg="success">Approved</Badge>;
      case "REJECTED":
        return <Badge bg="danger">Rejected</Badge>;
    }
  };

  // ✅ Create new request → include userId & createdAt
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      console.error("Cannot create request: user not loaded");
      return;
    }

    try {
      await createMyRequest({
        description: newRequest.description,
        reqType: newRequest.reqType,
        reqStatus: "PENDING",
        userId: currentUser.id, // ✅ ONLY send this
      });
      setShowModal(false);
      setNewRequest({ description: "", reqType: "OTHER" });

      // reload list
      const updated = await fetchMyRequests();
      const sorted = [...updated].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(sorted);
    } catch (err) {
      console.error("Failed to create request", err);
    }
  };

  // Get current requests for the active page
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold" style={{ color: "#333333" }}>My Requests</h3>
        <Button
          variant="success"
          className="rounded-pill shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle" style={{ fontSize: "1.2rem" }}></i> New Request
        </Button>
      </div>

      {/* FILTERS */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={filterStatus === "ALL" ? "dark" : "outline-secondary"}
              size="sm"
              className="rounded-pill shadow-sm"
              onClick={() => setFilterStatus("ALL")}
            >
              All
            </Button>
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? "dark" : "outline-secondary"}
                size="sm"
                className="rounded-pill shadow-sm"
                onClick={() => setFilterStatus(s)}
              >
                {formatEnum(s)}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* LOADING */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading your requests...</p>
        </div>
      ) : currentRequests.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          No requests {filterStatus !== "ALL" && `with status ${filterStatus.toLowerCase()}`}.
        </Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {currentRequests.map((req) => (
            <div
              key={req.id}
              className="p-3 rounded shadow-sm border bg-white hover-shadow"
              style={{ transition: "0.2s ease-in-out" }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-dark fw-bold">
                  {formatEnum(req.reqType)}
                </h6>
                {getStatusBadge(req.reqStatus)}
              </div>

              {/* Body */}
              <p className="mb-2 text-muted">{req.description}</p>

              {/* Timestamp */}
              <small className="text-muted">
                {req.createdAt
                  ? `Submitted ${formatDistanceToNow(new Date(req.createdAt), {
                      addSuffix: true,
                    })}`
                  : "Date unavailable"}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination className="shadow-sm rounded-pill">
            {[...Array(Math.ceil(filteredRequests.length / requestsPerPage))].map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => setCurrentPage(index + 1)}
                className="rounded-pill"
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}

      {/* ✅ MODAL: CREATE NEW REQUEST */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
        className="rounded-4 shadow-sm"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: "#333333" }}>
            Create New Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRequest}>
            {/* Request Type */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                Request Type
              </Form.Label>
              <Form.Select
                value={newRequest.reqType}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    reqType: e.target.value as ReqType,
                  })
                }
                className="shadow-sm rounded-pill"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatEnum(t)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    description: e.target.value,
                  })
                }
                placeholder="Explain your request..."
                required
                className="shadow-sm rounded-4"
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                className="rounded-pill shadow-sm me-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                className="rounded-pill shadow-sm"
              >
                Submit Request
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          h3, h6 {
            font-weight: 700;
          }

          .rounded-pill {
            border-radius: 50px;
          }

          .rounded-4 {
            border-radius: 1rem;
          }

          .hover-shadow:hover {
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeRequestsPage;

