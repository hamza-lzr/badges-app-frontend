import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  InputGroup,
  Button,
  Badge,
  Spinner,
  Pagination,
  Modal,
} from "react-bootstrap";
import { BiSearch, BiFilter, BiCalendar } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { fetchRequests, updateRequestStatus } from "../api/apiRequest";
import { fetchEmployees } from "../api/ApiEmployee";
import type { Request, ReqStatus, UserDTO } from "../types";

const STATUS_OPTIONS: Array<ReqStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReqStatus | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState<Request | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [reqs, emps] = await Promise.all([
          fetchRequests(),
          fetchEmployees(),
        ]);
        setRequests(reqs);
        setEmployees(emps);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getEmployeeName = (userId: number) => {
    const emp = employees.find((e) => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `#${userId}`;
  };

  const handleStatusChange = async (req: Request, status: ReqStatus) => {
    setLoading(true);
    await updateRequestStatus(req.id, status);
    setRequests(await fetchRequests());
    setLoading(false);

    if (status === "APPROVED" && req.reqType !== "OTHER") {
      const emp = employees.find((e) => e.id === req.userId)!;
      const matricule = emp.matricule;
      switch (req.reqType) {
        case "PROFILE":
          navigate("/admin/employees", {
            state: { openEditModalForUser: req.userId },
          });
          break;
        case "NEW_BADGE":
          navigate("/admin/badges", {
            state: { openGenerateModalForUser: req.userId },
          });
          break;
        case "COMPANY":
          navigate("/admin/companies", {
            state: { highlightCompanyModal: true },
          });
          break;
        case "AIRPORT_ACCESS":
          navigate("/admin/accesses", {
            state: { matriculeFilter: matricule, openAddModal: false },
          });
          break;
      }
    }
  };

  // filter & sort
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.description.toLowerCase().includes(q) ||
          getEmployeeName(r.userId).toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || r.reqStatus === statusFilter;
        const created = new Date(r.createdAt);
        const fromOK = dateFrom ? created >= new Date(dateFrom) : true;
        const toOK = dateTo ? created <= new Date(dateTo) : true;
        return matchesSearch && matchesStatus && fromOK && toOK;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [requests, searchQuery, statusFilter, dateFrom, dateTo]);

  // pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const pageData = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const badgeVariant = (status: ReqStatus) =>
    status === "PENDING"
      ? "warning"
      : status === "APPROVED"
      ? "success"
      : "danger";

  return (
    <Container fluid className="bg-light py-3">
      <h4 className="mb-4 fs-2 display-5 text-black font-weight-bold">
        Request Management
      </h4>

      {/* Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="py-3">
          <Row className="align-items-center gx-3">
            {/* Search */}
            <Col xs={12} md={5} lg={4}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                <InputGroup.Text className="bg-white border-0 px-3">
                  <BiSearch size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by description or employee "
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-0 px-3"
                />
              </InputGroup>
            </Col>

            {/* Status */}
            <Col xs={12} md={3} lg={2}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                <InputGroup.Text className="bg-white border-0 px-3">
                  <BiFilter size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ReqStatus | "ALL");
                    setCurrentPage(1);
                  }}
                  className="border-0 px-3"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "ALL" ? "All Statuses" : s}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            {/* From–To Date Range */}
            <Col xs={12} md={6} lg={4}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                {/* calendar icon */}
                <InputGroup.Text className="bg-white border-0 px-3">
                  <BiCalendar size={18} className="text-secondary" />
                </InputGroup.Text>
                {/* From */}
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-0 px-2"
                />
                <InputGroup.Text className="bg-white border-0 px-2 text-secondary">
                  to
                </InputGroup.Text>
                {/* To */}
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-0 px-2"
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <div className="position-relative">
          {loading && (
            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 rounded-top">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          <Table
            responsive
            hover
            striped
            className="mb-0 shadow-sm"
            style={{
              borderRadius: "0.5rem",
              overflow: "hidden",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead style={{ backgroundColor: "#343a40", color: "#fff" }}>
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3" style={{ width: "8rem" }}>
                  Type
                </th>
                <th className="px-4 py-3" style={{ width: "8rem" }}>
                  Status
                </th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3" style={{ width: "10rem" }}>
                  Created At
                </th>
                <th className="px-4 py-3 text-end" style={{ width: "12rem" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No requests found.
                  </td>
                </tr>
              ) : (
                pageData.map((r) => (
                  <tr
                    key={r.id}
                    className="align-middle"
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => {
                      setDetailRequest(r);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-4 py-3">{r.description}</td>
                    <td className="text-capitalize px-4 py-3">
                      {r.reqType.replace("_", " ").toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge bg={badgeVariant(r.reqStatus)} pill>
                        {r.reqStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{getEmployeeName(r.userId)}</td>
                    <td className="px-4 py-3">
                      {new Date(r.createdAt).toLocaleString([], {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(r, "APPROVED");
                          }}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(r, "REJECTED");
                          }}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="bg-white border-0 d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Description:</strong>
            <br />
            {detailRequest?.description}
          </p>
          <p>
            <strong>Type:</strong>{" "}
            {detailRequest && detailRequest.reqType.replace("_", " ")}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {detailRequest && (
              <Badge bg={badgeVariant(detailRequest.reqStatus)} pill>
                {detailRequest.reqStatus}
              </Badge>
            )}
          </p>
          <p>
            <strong>Employee:</strong>{" "}
            {detailRequest && getEmployeeName(detailRequest.userId)}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {detailRequest &&
              new Date(detailRequest.createdAt).toLocaleString([], {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestsPage;
