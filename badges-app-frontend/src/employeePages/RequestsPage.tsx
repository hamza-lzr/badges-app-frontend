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
} from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";

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
  userId: currentUser.id // ✅ ONLY send this
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

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">My Requests</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          New Request
        </Button>
      </div>

      {/* FILTERS */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={filterStatus === "ALL" ? "dark" : "outline-secondary"}
              size="sm"
              onClick={() => setFilterStatus("ALL")}
            >
              All
            </Button>
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? "dark" : "outline-secondary"}
                size="sm"
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
      ) : filteredRequests.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          No requests{" "}
          {filterStatus !== "ALL" &&
            `with status ${filterStatus.toLowerCase()}`}
          .
        </Alert>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-3 rounded shadow-sm border bg-white"
              style={{ transition: "0.2s ease-in-out" }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-dark fw-semibold">
                  {formatEnum(req.reqType)}
                </h6>
                {getStatusBadge(req.reqStatus)}
              </div>

              {/* Body */}
              <p className="mb-2 text-muted">{req.description}</p>

              {/* Timestamp */}
              <small className="text-muted">
                {req.createdAt
                  ? `Submitted ${formatDistanceToNow(
                      new Date(req.createdAt),
                      { addSuffix: true }
                    )}`
                  : "Date unavailable"}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL: CREATE NEW REQUEST */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRequest}>
            {/* Request Type */}
            <Form.Group className="mb-3">
              <Form.Label>Request Type</Form.Label>
              <Form.Select
                value={newRequest.reqType}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    reqType: e.target.value as ReqType,
                  })
                }
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, description: e.target.value })
                }
                placeholder="Explain your request..."
                required
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeRequestsPage;

