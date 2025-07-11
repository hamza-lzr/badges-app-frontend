import React, { useEffect, useState } from "react";
import type { CompanyDTO } from "../types";
import {
  fetchCompanies,
  createCompany,
  deleteCompany,
} from "../api/apiCompany";

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState<Omit<CompanyDTO, "id">>({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(newCompany);
      loadCompanies();
      resetForm();
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
    }
  };

  const resetForm = () => {
    setNewCompany({
      name: "",
      address: "",
      phone: "",
      description: "",
    });
  };

  return (
    <div>
      <h2 className="mb-4">Companies</h2>

      {loading ? (
        <div className="text-center my-5">Loading companies...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>{company.name}</td>
                  <td>{company.address}</td>
                  <td>{company.phone}</td>
                  <td>{company.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(company.id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="mt-5 mb-3">Add New Company</h3>
          <form onSubmit={handleCreateCompany} className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Company Name"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, name: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Address"
                value={newCompany.address}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, address: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Phone"
                value={newCompany.phone}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, phone: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Description"
                value={newCompany.description}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, description: e.target.value })
                }
              />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Create Company
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Companies;
