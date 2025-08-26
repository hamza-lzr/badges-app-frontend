import React, { useEffect, useMemo, useState } from "react";
import type { UserDTO, Status, CompanyDTO } from "../types";
import {
  fetchEmployees,
  updateEmployeeStatus,
  updateEmployee,
  createEmployee,
} from "../api/ApiEmployee";
import { fetchCompanies } from "../api/apiCompany";
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
import { BiSearch, BiFilter, BiPlus, BiUser, BiBuilding } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// put this near the top of the file (below imports)
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && typeof err.message === "string")
    return err.message;

  if (typeof err === "object" && err !== null) {
    const rec = err as Record<string, unknown>;
    const response = rec.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;

    const fromData = data?.message;
    if (typeof fromData === "string") return fromData;

    const fromTop = rec.message;
    if (typeof fromTop === "string") return fromTop;
  }
  return "Une erreur est survenue";
};

// ---- Statuts employés
const EMP_STATUS: Array<Status | "ALL"> = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "BLOCKED",
];

const translateEmpStatus = (s: Status | "ALL") => {
  switch (s) {
    case "ACTIVE":
      return "Actif";
    case "INACTIVE":
      return "Inactif";
    case "BLOCKED":
      return "Bloqué";
    case "ALL":
      return "Tous les statuts";
    default:
      return s;
  }
};

const statusBadgeVariant = (s: Status) =>
  s === "ACTIVE" ? "success" : s === "INACTIVE" ? "secondary" : "danger";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingAdd, setSavingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [companyFilter, setCompanyFilter] = useState<number | "ALL">("ALL");

  // Tri
  const [sortKey, setSortKey] = useState<keyof UserDTO>("firstName");
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<UserDTO | null>(null);

  // Form add
  const [newEmployee, setNewEmployee] = useState<UserDTO>({
    id: 0,
    email: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
    userType: "EMPLOYEE",
    matricule: "",
    firstName: "",
    lastName: "",
    phone: "",
    companyId: 0,
    badgesIds: [],
  });

  const location = useLocation();
  const navigate = useNavigate();

  // ---- Load data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [emps, comps] = await Promise.all([
          fetchEmployees(),
          fetchCompanies(),
        ]);
        setEmployees(emps);
        setCompanies(comps);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Ouvrir modal d’édition via router state (ex: depuis RequestsPage)
  useEffect(() => {
    const state = (location.state || {}) as { openEditModalForUser?: number };
    if (state.openEditModalForUser && employees.length) {
      const user = employees.find((e) => e.id === state.openEditModalForUser);
      if (user) {
        openEditModal(user);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, employees, navigate, location.pathname]);

  // ---- Helpers
  const getCompanyName = (id: number) =>
    companies.find((c) => c.id === id)?.name || "—";

  // Actions
  const handleStatusChange = async (employee: UserDTO, newStatus: Status) => {
    try {
      setLoading(true);
      await updateEmployeeStatus(employee.id, {
        ...employee,
        status: newStatus,
      });
      const refreshed = await fetchEmployees();
      setEmployees(refreshed);
    } catch (e) {
      console.error("Error updating status", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAdd(true);

      // 1) Create
      await createEmployee(newEmployee);
      toast.success("Employé ajouté avec succès");

      // 2) Close + reset immediately (so UX feels instant)
      setShowAddModal(false);
      resetForm();

      // 3) Refresh list (best-effort)
      try {
        const refreshed = await fetchEmployees();
        setEmployees(refreshed);
      } catch {
        toast.warn("Ajout effectué, mais le rafraîchissement a échoué.");
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingAdd(false);
    }
  };

  const resetForm = () =>
    setNewEmployee({
      id: 0,
      email: "",
      role: "EMPLOYEE",
      status: "ACTIVE",
      userType: "EMPLOYEE",
      matricule: "",
      firstName: "",
      lastName: "",
      phone: "",
      companyId: 0,
      badgesIds: [],
    });

  const openEditModal = (employee: UserDTO) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingEmployee) return;
    try {
      setSavingEdit(true);
      await updateEmployee(editingEmployee.id, editingEmployee);
      toast.success("Employé mis à jour");
      setShowEditModal(false);

      const refreshed = await fetchEmployees();
      setEmployees(refreshed);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingEdit(false);
    }
  };

  // Tri (incl. tri par nom d’entreprise quand key === companyId)
  const sortedEmployees = useMemo(() => {
    const clone = [...employees];
    clone.sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortKey === "companyId") {
        aVal = getCompanyName(a.companyId).toLowerCase();
        bVal = getCompanyName(b.companyId).toLowerCase();
      } else {
        aVal = (a[sortKey] ?? "").toString().toLowerCase();
        bVal = (b[sortKey] ?? "").toString().toLowerCase();
      }
      const cmp = aVal.localeCompare(bVal);
      return sortAsc ? cmp : -cmp;
    });
    return clone;
  }, [employees, sortKey, sortAsc]);

  // Filtrage
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sortedEmployees.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(q) ||
        emp.matricule?.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        getCompanyName(emp.companyId).toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || emp.status === statusFilter;
      const matchesCompany =
        companyFilter === "ALL" || emp.companyId === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [sortedEmployees, searchQuery, statusFilter, companyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const pageData = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof UserDTO) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <Container fluid className="bg-light py-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-2">
          Gestion des Collaborateurs
        </h1>
        <p className="text-muted fs-5">
          Rechercher, filtrer et gérer les collaborateurs
        </p>
      </div>
      <div className="d-flex justify-content-end mt-4 mb-2">
        <Button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 fw-semibold"
        >
          <BiPlus size={18} className="me-2" />
          Ajouter un collaborateur
        </Button>
      </div>

      {/* Filtres */}
      <Card
        className="mb-4 shadow-lg border-0"
        style={{ borderRadius: "15px" }}
      >
        <Card.Header
          className="bg-gradient text-white py-3"
          style={{
            background: "linear-gradient(135deg, #343a40 0%, #495057 100%)",
            borderRadius: "15px 15px 0 0",
          }}
        >
          <h5 className="mb-0 d-flex align-items-center">
            <BiFilter size={24} className="me-2" />
            Filtres et recherche
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4 align-items-end">
            {/* Recherche */}
            <Col xl={4} lg={6} md={12}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Rechercher des collaborateurs
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text
                  className="bg-white border-end-0 px-3"
                  style={{ borderRadius: "10px 0 0 10px" }}
                >
                  <BiSearch size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Nom, matricule, email ou entreprise…"
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

            {/* Statut */}
            <Col xl={3} lg={6} md={6}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Filtre par statut
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text
                  className="bg-white border-end-0 px-3"
                  style={{ borderRadius: "10px 0 0 10px" }}
                >
                  <BiFilter size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as Status | "ALL");
                    setCurrentPage(1);
                  }}
                  className="border-start-0 px-3"
                  style={{ borderRadius: "0 10px 10px 0" }}
                >
                  {EMP_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {translateEmpStatus(s)}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            {/* Entreprise */}
            <Col xl={3} lg={6} md={6}>
              <Form.Label className="text-secondary fw-semibold mb-2">
                Filtre par entreprise
              </Form.Label>
              <InputGroup className="shadow-sm">
                <InputGroup.Text
                  className="bg-white border-end-0 px-3"
                  style={{ borderRadius: "10px 0 0 10px" }}
                >
                  <BiBuilding size={20} className="text-secondary" />
                </InputGroup.Text>
                <Form.Select
                  value={companyFilter}
                  onChange={(e) => {
                    const v =
                      e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                    setCompanyFilter(v);
                    setCurrentPage(1);
                  }}
                  className="border-start-0 px-3"
                  style={{ borderRadius: "0 10px 10px 0" }}
                >
                  <option value="ALL">Toutes les entreprises</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Résumé */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-muted mb-0">
          Affichage de {pageData.length} sur {filteredEmployees.length} collaborateurs
        </h6>
        <Badge bg="secondary" className="fs-6 px-3 py-2">
          Page {currentPage} sur {totalPages}
        </Badge>
      </div>

      {/* Tableau */}
      <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <div className="position-relative">
          {loading && (
            <div
              className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-90 rounded-top"
              style={{ zIndex: 10, borderRadius: "15px" }}
            >
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="text-muted mt-3 mb-0">Chargement des collaborateurs...</p>
            </div>
          )}

          <div
            className="table-responsive"
            style={{ borderRadius: "15px", overflow: "hidden" }}
          >
            <Table
              hover
              className="mb-0 align-middle"
              style={{ tableLayout: "fixed" }}
            >
              {/* ✅ Symmetric columns via colgroup (sum ~ 100%) */}
              <colgroup>
                <col style={{ width: "10%" }} /> {/* Matricule */}
                <col style={{ width: "12%" }} /> {/* Employé */}
                <col style={{ width: "12%" }} /> {/* Email */}
                <col style={{ width: "12%" }} /> {/* Téléphone */}
                <col style={{ width: "10%" }} /> {/* Entreprise */}
                <col style={{ width: "8%" }} /> {/* Badges */}
                <col style={{ width: "8%" }} /> {/* Statut */}
                <col style={{ width: "16%" }} /> {/* Actions */}
              </colgroup>

              {/* ✅ True dark header */}
              <thead className="table-dark">
                <tr>
                  <th
                    className="px-4 py-3 fw-semibold border-0 text-truncate"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("matricule")}
                    title="Trier par matricule"
                  >
                    Matricule {sortKey === "matricule" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    className="px-4 py-3 fw-semibold border-0 text-truncate"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("firstName")}
                    title="Trier par nom"
                  >
                    Nom Complet {sortKey === "firstName" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-truncate">
                    Email
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-truncate">
                    Téléphone
                  </th>
                  <th
                    className="px-4 py-3 fw-semibold border-0 text-truncate"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("companyId")}
                    title="Trier par entreprise"
                  >
                    Entreprise{" "}
                    {sortKey === "companyId" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">
                    Badges
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">
                    Statut
                  </th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center text-truncate">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="text-muted">
                        <BiSearch size={48} className="mb-3 opacity-50" />
                        <p className="fs-5 mb-0">Aucun collaborateur trouvé</p>
                        <small>Essayez d’ajuster vos filtres</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((emp, idx) => (
                    <tr
                      key={emp.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-light"
                      } border-0`}
                      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      onClick={() => {
                        setDetailEmployee(emp);
                        setShowDetailModal(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          idx % 2 === 0 ? "#fff" : "#f8f9fa";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <td
                        className="px-4 py-3 text-truncate"
                        title={emp.matricule || "—"}
                      >
                        {emp.matricule || "—"}
                      </td>

                      <td className="px-4 py-3 text-truncate">
                        <div className="d-flex align-items-center gap-2">
                          <BiUser className="text-secondary" />
                          <div
                            className="fw-semibold text-dark text-truncate"
                            title={`${emp.firstName} ${emp.lastName}`}
                          >
                            {emp.firstName} {emp.lastName}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-truncate" title={emp.email}>
                        {emp.email}
                      </td>
                      <td
                        className="px-4 py-3 text-truncate"
                        title={emp.phone || "—"}
                      >
                        {emp.phone || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-truncate"
                        title={getCompanyName(emp.companyId)}
                      >
                        {getCompanyName(emp.companyId)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Badge bg="info" className="px-2 py-1">
                          {emp.badgesIds.length} Badge
                          {emp.badgesIds.length !== 1 ? "s" : ""}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <Badge
                          bg={statusBadgeVariant(emp.status)}
                          className="px-3 py-2 fw-semibold"
                        >
                          {translateEmpStatus(emp.status)}
                        </Badge>
                      </td>

                      {/* ✅ Symmetric grid for actions (3 on top, 2 below) */}
                      <td className="px-2 py-2">
                        <div
                          className="gap-2"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "8px",
                          }}
                          onClick={(e) => e.stopPropagation()} // keep row click off buttons
                        >
                          <Button
                            size="sm"
                            variant="success"
                            className="w-100 fw-semibold"
                            style={{ minHeight: 34 }}
                            onClick={() => handleStatusChange(emp, "ACTIVE")}
                            disabled={emp.status === "ACTIVE"}
                          >
                            Activer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="w-100 fw-semibold"
                            style={{ minHeight: 34 }}
                            onClick={() => handleStatusChange(emp, "INACTIVE")}
                            disabled={emp.status === "INACTIVE"}
                          >
                            Désactiver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="w-100 fw-semibold"
                            style={{ minHeight: 34 }}
                            onClick={() => handleStatusChange(emp, "BLOCKED")}
                            disabled={emp.status === "BLOCKED"}
                          >
                            Bloquer
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="w-100 fw-semibold"
                            style={{ minHeight: 34 }}
                            onClick={() => openEditModal(emp)}
                          >
                            Modifier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Pagination unchanged */}
        {totalPages > 1 && (
          <Card.Footer
            className="bg-white border-0 py-3"
            style={{ borderRadius: "0 0 15px 15px" }}
          >
            <div className="d-flex justify-content-center">
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
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

      {/* Modal Détails */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          className="bg-gradient text-black"
          style={{
            background: "linear-gradient(135deg, #343a40 0%, #495057 100%)",
          }}
        >
          <Modal.Title className="fw-bold">Détails du collaborateur</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {detailEmployee && (
            <Row className="g-4">
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-secondary mb-2">Identité</h6>
                    <p className="mb-1 fw-semibold">
                      {detailEmployee.firstName} {detailEmployee.lastName}
                    </p>
                    <small className="text-muted">
                      Matricule : {detailEmployee.matricule || "—"}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-secondary mb-2">Entreprise</h6>
                    <p className="mb-0">
                      {getCompanyName(detailEmployee.companyId)}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Contact</h6>
                  <p className="mb-1">{detailEmployee.email}</p>
                  <small className="text-muted">
                    Tél : {detailEmployee.phone || "—"}
                  </small>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Statut</h6>
                  <Badge
                    bg={statusBadgeVariant(detailEmployee.status)}
                    className="px-3 py-2 fw-semibold"
                  >
                    {translateEmpStatus(detailEmployee.status)}
                  </Badge>
                </div>
              </Col>
              <Col md={6}>
                <div>
                  <h6 className="text-secondary mb-2">Badges</h6>
                  <Badge bg="info" className="px-3 py-2">
                    {detailEmployee.badgesIds.length} Badge
                    {detailEmployee.badgesIds.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </Col>
              <Col md={6}></Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Ajout */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header
          closeButton
          className="bg-gradient text-black"
          style={{
            background: "linear-gradient(135deg, #343a40 0%, #495057 100%)",
          }}
        >
          <Modal.Title>Ajouter un collaborateur</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <form id="add-employee-form" onSubmit={handleCreateEmployee}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  value={newEmployee.firstName}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  value={newEmployee.lastName}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, lastName: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Matricule</Form.Label>
                <Form.Control
                  value={newEmployee.matricule}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      matricule: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Entreprise</Form.Label>
                <Form.Select
                  value={newEmployee.companyId || ""}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      companyId: Number(e.target.value),
                    })
                  }
                  required
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="add-employee-form"
            disabled={savingAdd}
          >
            {savingAdd ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Édition */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          className="bg-gradient text-black"
          style={{
            background: "linear-gradient(135deg, #343a40 0%, #495057 100%)",
          }}
        >
          <Modal.Title>Modifier le collaborateur</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editingEmployee && (
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  value={editingEmployee.firstName}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      firstName: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  value={editingEmployee.lastName}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      lastName: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      email: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  value={editingEmployee.phone || ""}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      phone: e.target.value,
                    })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Label>Entreprise</Form.Label>
                <Form.Select
                  value={editingEmployee.companyId}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      companyId: Number(e.target.value),
                    })
                  }
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={editingEmployee.status}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      status: e.target.value as Status,
                    })
                  }
                >
                  {["ACTIVE", "INACTIVE", "BLOCKED"].map((s) => (
                    <option key={s} value={s}>
                      {translateEmpStatus(s as Status)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSave}
            disabled={savingEdit}
          >
            {savingEdit ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Employees;
