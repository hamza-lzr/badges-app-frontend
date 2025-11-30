import React, { useEffect, useState } from "react";
import type { UserDTO, Status } from "../types";
import { updateEmployeeStatus, updateEmployee, createEmployee } from "../api/ApiEmployee";
import { Container, Card, Button, Badge, Spinner, Pagination } from "react-bootstrap";
import { BiFilter, BiPlus } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import EmployeeFilters from "../components/employee/EmployeeFilters";
import EmployeeTable from "../components/employee/EmployeeTable";
import AddEmployeeModal from "../components/employee/AddEmployeeModal";
import EditEmployeeModal from "../components/employee/EditEmployeeModal";
import EmployeeDetailModal from "../components/employee/EmployeeDetailModal";
import { useEmployeeData } from "../hooks/useEmployeeData";

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && typeof err.message === "string") return err.message;
  // This can be expanded based on your API's error structure
  return "Une erreur est survenue";
};

const Employees: React.FC = () => {
  const {
    employees: pageData,
    allEmployees,
    companies,
    loading,
    reloadData,
    getCompanyName,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    sortKey,
    sortAsc,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    totalFilteredCount,
  } = useEmployeeData();

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<UserDTO | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Effect to handle opening edit modal from another page (e.g., Requests)
  useEffect(() => {
    const state = (location.state || {}) as { openEditModalForUser?: number };
    if (state.openEditModalForUser && allEmployees.length > 0) {
      const user = allEmployees.find(e => e.id === state.openEditModalForUser);
      if (user) {
        openEditModal(user);
        navigate(location.pathname, { replace: true, state: {} }); // Clear state after use
      }
    }
  }, [location.state, allEmployees, navigate, location.pathname]);

  // --- Modal Handlers ---
  const openEditModal = (employee: UserDTO) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const openDetailModal = (employee: UserDTO) => {
    setDetailEmployee(employee);
    setShowDetailModal(true);
  };

  // --- API Mutation Handlers ---
  const handleStatusChange = async (employee: UserDTO, newStatus: Status) => {
    try {
      await updateEmployeeStatus(employee.id, { ...employee, status: newStatus });
      toast.success(`Statut de ${employee.firstName} mis à jour.`);
      await reloadData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleCreateEmployee = async (employeeData: Omit<UserDTO, "id" | "badgesIds">) => {
    try {
      await createEmployee(employeeData);
      toast.success("Employé ajouté avec succès");
      await reloadData();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
      throw e; // Re-throw to keep modal open on error
    }
  };

  const handleEditSave = async (employee: UserDTO) => {
    try {
      await updateEmployee(employee.id, employee);
      toast.success("Employé mis à jour");
      await reloadData();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
      throw e; // Re-throw to keep modal open on error
    }
  };

  return (
    <Container fluid className="bg-light py-4" style={{ minHeight: "100vh" }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-2">Gestion des Collaborateurs</h1>
        <p className="text-muted fs-5">Rechercher, filtrer et gérer les collaborateurs</p>
      </div>

      <div className="d-flex justify-content-end mt-4 mb-2">
        <Button onClick={() => setShowAddModal(true)} className="px-3 py-2 fw-semibold">
          <BiPlus size={18} className="me-2" />
          Ajouter un collaborateur
        </Button>
      </div>

      <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <Card.Header className="bg-gradient text-white py-3" style={{ background: "linear-gradient(135deg, #343a40 0%, #495057 100%)", borderRadius: "15px 15px 0 0" }}>
          <h5 className="mb-0 d-flex align-items-center">
            <BiFilter size={24} className="me-2" />
            Filtres et recherche
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <EmployeeFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            companies={companies}
          />
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-muted mb-0">Affichage de {pageData.length} sur {totalFilteredCount} collaborateurs</h6>
        <Badge bg="secondary" className="fs-6 px-3 py-2">Page {currentPage} sur {totalPages}</Badge>
      </div>

      <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <div className="position-relative">
          {loading && (
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-90 rounded-top" style={{ zIndex: 10, borderRadius: "15px" }}>
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="text-muted mt-3 mb-0">Chargement des collaborateurs...</p>
            </div>
          )}
          <EmployeeTable
            employees={pageData}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onSelect={openDetailModal}
            getCompanyName={getCompanyName}
            sortKey={sortKey}
            sortAsc={sortAsc}
            onSort={handleSort}
          />
        </div>

        {totalPages > 1 && (
          <Card.Footer className="bg-white border-0 py-3" style={{ borderRadius: "0 0 15px 15px" }}>
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
                {/* Simplified Pagination Logic can be added here if needed */}
                {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      <AddEmployeeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSave={handleCreateEmployee}
        companies={companies}
      />

      <EditEmployeeModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSave={handleEditSave}
        employee={editingEmployee}
        companies={companies}
      />

      <EmployeeDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        employee={detailEmployee}
        getCompanyName={getCompanyName}
      />
    </Container>
  );
};

export default Employees;
