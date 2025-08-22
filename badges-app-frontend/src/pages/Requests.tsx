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

// Fonction pour traduire les statuts en français
const translateStatus = (status: ReqStatus | "ALL"): string => {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "APPROVED":
      return "Approuvé";
    case "REJECTED":
      return "Rejeté";
    case "ALL":
      return "Tous les statuts";
    default:
      return status;
  }
};

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
    <Container fluid className="bg-light py-4" style={{ minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-2">Gestion des demandes</h1>
        <p className="text-muted fs-5">Gérer et examiner les demandes des employés efficacement</p>
      </div>

      {/* Filters Card */}
      <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <Card.Header className="bg-gradient text-white py-3" style={{ 
          background: "linear-gradient(135deg, #343a40 0%, #495057 100%)",
          borderRadius: "15px 15px 0 0"
        }}>
          <h5 className="mb-0 d-flex align-items-center">
            <BiFilter size={24} className="me-2" />
            Filtres et recherche
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4 align-items-end">
            {/* Search */}
            <Col xl={4} lg={6} md={12}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Rechercher des demandes
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0 px-3" style={{ borderRadius: "10px 0 0 10px" }}>
                  <BiSearch size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher par description ou nom d'employé..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-start-0 px-3"
                  style={{ borderRadius: "0 10px 10px 0" }}
                />
              </InputGroup>
            </Col>

            {/* Status Filter */}
            <Col xl={3} lg={6} md={6}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Filtre de statut
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0 px-3" style={{ borderRadius: "10px 0 0 10px" }}>
                  <BiFilter size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ReqStatus | "ALL");
                    setCurrentPage(1);
                  }}
                  className="border-start-0 px-3"
                  style={{ borderRadius: "0 10px 10px 0" }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {translateStatus(s)}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            {/* Date Range */}
            <Col xl={5} lg={12} md={6}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Plage de dates
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0 px-3" style={{ borderRadius: "10px 0 0 0" }}>
                  <BiCalendar size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-start-0 border-end-0 px-3"
                />
                <InputGroup.Text className="bg-light border-start-0 border-end-0 px-3 text-secondary fw-semibold">
                  à
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-start-0 px-3"
                  style={{ borderRadius: "0 10px 10px 0" }}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-muted mb-0">
          Affichage de {pageData.length} sur {filteredRequests.length} demandes
        </h6>
        <Badge bg="secondary" className="fs-6 px-3 py-2">
          Page {currentPage} sur {totalPages || 1}
        </Badge>
      </div>

      {/* Table Card */}
      <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <div className="position-relative">
          {loading && (
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-90 rounded-top" style={{ zIndex: 10, borderRadius: "15px" }}>
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="text-muted mt-3 mb-0">Chargement des demandes...</p>
            </div>
          )}

          <div className="table-responsive" style={{ borderRadius: "15px", overflow: "hidden" }}>
            <Table hover className="mb-0 align-middle">
              <thead style={{ 
                background: "linear-gradient(135deg, #343a40 0%, #495057 100%)", 
                color: "#fff" 
              }}>
                <tr>
                  <th className="px-4 py-3 fw-semibold border-0">Description</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "120px" }}>
                    Type
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "120px" }}>
                    Statut
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0">Employé</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "160px" }}>
                    Créée le
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "180px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="text-muted">
                        <BiSearch size={48} className="mb-3 opacity-50" />
                        <p className="fs-5 mb-0">Aucune demande trouvée</p>
                        <small>Essayez d'ajuster vos filtres</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((r, index) => (
                    <tr
                      key={r.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-light'} border-0`}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        setDetailRequest(r);
                        setShowDetailModal(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="text-truncate" style={{ maxWidth: "300px" }} title={r.description}>
                          {r.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge bg="info" className="text-capitalize px-2 py-1">
                          {r.reqType.replace("_", " ").toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge bg={badgeVariant(r.reqStatus)} className="px-3 py-2 fw-semibold">
                          {translateStatus(r.reqStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="fw-semibold text-dark">
                          {getEmployeeName(r.userId)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <small className="text-muted">
                          {new Date(r.createdAt).toLocaleString([], {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </small>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.reqStatus === "PENDING" ? (
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              className="px-3 py-1 fw-semibold"
                              style={{ borderRadius: "8px", minWidth: "70px" }}
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
                              className="px-3 py-1 fw-semibold"
                              style={{ borderRadius: "8px", minWidth: "70px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(r, "REJECTED");
                              }}
                            >
                              Rejeter
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {r.reqStatus === "APPROVED" ? "✓ Traité" : "✗ Rejeté"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="bg-white border-0 py-3" style={{ borderRadius: "0 0 15px 15px" }}>
            <div className="d-flex justify-content-center">
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
      >
        <Modal.Header 
          closeButton 
          className="bg-gradient text-white"
          style={{ 
            background: "linear-gradient(135deg, #343a40 0%, #495057 100%)"
          }}
        >
          <Modal.Title className="fw-bold">Détails de la demande</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailRequest && (
            <Row className="g-4">
              <Col md={12}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-secondary mb-2">Description</h6>
                    <p className="mb-0">{detailRequest.description}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Type de demande</h6>
                  <Badge bg="info" className="px-3 py-2 text-capitalize">
                    {detailRequest.reqType.replace("_", " ").toLowerCase()}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Statut</h6>
                  <Badge bg={badgeVariant(detailRequest.reqStatus)} className="px-3 py-2 fw-semibold">
                    {translateStatus(detailRequest.reqStatus)}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Employé</h6>
                  <p className="mb-0 fw-semibold">{getEmployeeName(detailRequest.userId)}</p>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Créée le</h6>
                  <p className="mb-0">
                    {new Date(detailRequest.createdAt).toLocaleString([], {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestsPage;