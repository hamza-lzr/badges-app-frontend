import React, { useEffect, useState } from "react";
import type { EmployeeDTO, Status } from "../types";
import {
  fetchEmployees,
  updateEmployeeStatus,
  deleteEmployee,
  createEmployee,
} from "../api/ApiEmployee";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

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

  const handleStatusChange = async (
    employee: EmployeeDTO,
    newStatus: Status
  ) => {
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

  const [newEmployee, setNewEmployee] = useState<EmployeeDTO>({
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
    badgeId: 0,
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee(newEmployee);
      loadEmployees();
      resetForm();
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
      badgeId: 0,
    });
  };

  return (
    <div>
      <h2 className="mb-4">Employees</h2>

      {loading ? (
        <div className="text-center my-5">Loading employees...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Matricule</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company ID</th>
                <th>Badge ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.matricule}</td>
                  <td>
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.companyId}</td>
                  <td>{emp.badgeId}</td>
                  <td>
                    <span className={`badge ${getStatusClass(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusChange(emp, "ACTIVE")}
                        disabled={emp.status === "ACTIVE"}
                      >
                        Activate
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleStatusChange(emp, "INACTIVE")}
                        disabled={emp.status === "INACTIVE"}
                      >
                        Deactivate
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="mt-5 mb-3">Add New Employee</h3>
          <form onSubmit={handleCreateEmployee} className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                value={newEmployee.firstName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                value={newEmployee.lastName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Phone"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Matricule"
                value={newEmployee.matricule}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, matricule: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Company ID"
                value={newEmployee.companyId || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    companyId: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Badge ID"
                value={newEmployee.badgeId || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    badgeId: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Create Employee
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-success";
    case "INACTIVE":
      return "bg-secondary";
    case "BANNED":
      return "bg-danger";
    default:
      return "bg-warning";
  }
};

export default Employees;
