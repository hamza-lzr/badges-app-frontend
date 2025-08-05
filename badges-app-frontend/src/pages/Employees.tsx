import React, { useEffect, useState } from "react";
import type { UserDTO, Status, CompanyDTO } from "../types";
import {
  fetchEmployees,
  updateEmployeeStatus,
  deleteEmployee,
  createEmployee,
} from "../api/ApiEmployee";
import { fetchCompanies } from "../api/apiCompany";
import { Modal, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Pagination } from "react-bootstrap";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof UserDTO>("firstName");
  const [sortAsc, setSortAsc] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserDTO | null>(null);

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    loadEmployees();
    loadCompanies();
  }, []);

  useEffect(() => {
    const state = (location.state || {}) as { openEditModalForUser?: number };
    if (state.openEditModalForUser) {
      const userId = state.openEditModalForUser;
      const user = employees.find((emp) => emp.id === userId);
      if (user) {
        openEditModal(user);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [
    location.state, // watch for incoming router‐state
    employees, // only fire once we actually have employees
    navigate,
    location.pathname,
  ]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleStatusChange = async (employee: UserDTO, newStatus: Status) => {
    try {
      await updateEmployeeStatus(employee.id, {
        ...employee,
        status: newStatus,
      });
      loadEmployees();
    } catch (error) {
      console.error(
        `Error updating status for employee ${employee.id}:`,
        error
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee(newEmployee);
      loadEmployees();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const resetForm = () => {
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
  };

  const getCompanyName = (id: number) =>
    companies.find((c) => c.id === id)?.name || "Unknown";

  const handleSort = (key: keyof UserDTO) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const aVal = (a[sortKey] ?? "").toString().toLowerCase();
    const bVal = (b[sortKey] ?? "").toString().toLowerCase();
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filteredEmployees = sortedEmployees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const companyName = getCompanyName(emp.companyId).toLowerCase();
    return (
      fullName.includes(query) ||
      emp.matricule?.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      companyName.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const pageData = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditModal = (employee: UserDTO) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingEmployee) return;
    try {
      await updateEmployeeStatus(editingEmployee.id, editingEmployee);
      loadEmployees();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Employees</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="alert alert-info text-center">
          No employees found. Try another search.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("matricule")}
                >
                  Matricule {sortKey === "matricule" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("firstName")}
                >
                  Full Name {sortKey === "firstName" && (sortAsc ? "▲" : "▼")}
                </th>
                <th>Email</th>
                <th>Phone</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("companyId")}
                >
                  Company {sortKey === "companyId" && (sortAsc ? "▲" : "▼")}
                </th>
                <th>Badges</th>
                <th>Status</th>
                <th style={{ width: "300px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.matricule || "—"}</td>
                  <td>
                    <strong>
                      {emp.firstName} {emp.lastName}
                    </strong>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || "—"}</td>
                  <td>{getCompanyName(emp.companyId)}</td>
                  <td>
                    <span className="badge bg-info">
                      {emp.badgesIds.length} Badge
                      {emp.badgesIds.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    {/* First row: Status Actions */}
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      <button
                        className="btn btn-sm btn-success"
                        style={{ flex: "1 1 auto" }}
                        onClick={() => handleStatusChange(emp, "ACTIVE")}
                        disabled={emp.status === "ACTIVE"}
                      >
                        <i className="bi bi-check-circle me-1"></i> Activate
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ flex: "1 1 auto" }}
                        onClick={() => handleStatusChange(emp, "INACTIVE")}
                        disabled={emp.status === "INACTIVE"}
                      >
                        <i className="bi bi-pause-circle me-1"></i> Deactivate
                      </button>
                      <button
                        className="btn btn-sm btn-warning text-dark"
                        style={{ flex: "1 1 auto" }}
                        onClick={() => handleStatusChange(emp, "BLOCKED")}
                        disabled={emp.status === "BLOCKED"}
                      >
                        <i className="bi bi-slash-circle me-1"></i> Block
                      </button>
                    </div>

                    {/* Second row: Edit/Delete */}
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => openEditModal(emp)}
                      >
                        <i className="bi bi-pencil-square me-1"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger flex-fill"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
  <div className="d-flex justify-content-center mt-3">
    <Pagination>
      <Pagination.Prev
        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
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
        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  </div>
)}
      

      {/*  Add Employee Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="add-employee-form" onSubmit={handleCreateEmployee}>
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={newEmployee.firstName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={newEmployee.lastName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label>Matricule</label>
              <input
                type="text"
                className="form-control"
                value={newEmployee.matricule}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, matricule: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label>Company</label>
              <select
                className="form-control"
                value={newEmployee.companyId || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    companyId: Number(e.target.value),
                  })
                }
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="add-employee-form">
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Edit Employee Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingEmployee && (
            <>
              <div className="mb-3">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingEmployee.firstName}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingEmployee.lastName}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editingEmployee.email}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingEmployee.phone || ""}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-success";
    case "INACTIVE":
      return "bg-secondary";
    case "BLOCKED":
      return "bg-danger";
    default:
      return "bg-warning";
  }
};

export default Employees;
