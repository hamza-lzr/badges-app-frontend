import React, { useEffect, useState, useMemo } from "react";
import type { CompanyDTO } from "../types";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../api/apiCompany";
import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";

type SortKey = "name" | "phone" | "address";

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Add/Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  const [newCompany, setNewCompany] = useState<Omit<CompanyDTO, "id">>({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Sorting states
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

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

  // ✅ Open modal in Add mode
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedCompanyId(null);
    resetForm();
    setShowModal(true);
  };

  // ✅ Open modal in Edit mode
  const openEditModal = (company: CompanyDTO) => {
    setIsEditing(true);
    setSelectedCompanyId(company.id!);
    setNewCompany({
      name: company.name,
      address: company.address || "",
      phone: company.phone || "",
      description: company.description || "",
    });
    setShowModal(true);
  };

  // ✅ Save handler (both add & edit)
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && selectedCompanyId) {
        await updateCompany(selectedCompanyId, newCompany);
        showSuccessToast("Company updated successfully!");
      } else {
        await createCompany(newCompany);
        showSuccessToast("Company created successfully!");
      }

      await loadCompanies();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;
    try {
      await deleteCompany(id);
      await loadCompanies();
      showSuccessToast("Company deleted successfully!");
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

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ✅ Filter + Sort + Pagination logic
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || "").includes(searchTerm)
    );
  }, [companies, searchTerm]);

  const sortedCompanies = useMemo(() => {
    const sorted = [...filteredCompanies].sort((a, b) => {
      const aVal = (a[sortKey] || "").toString().toLowerCase();
      const bVal = (b[sortKey] || "").toString().toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredCompanies, sortKey, sortAsc]);

  const totalPages = Math.ceil(sortedCompanies.length / pageSize);
  const paginatedCompanies = sortedCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ✅ Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc); // toggle asc/desc
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Companies</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          Add Company
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, address or phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Companies Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading companies...</p>
        </div>
      ) : sortedCompanies.length === 0 ? (
        <div className="alert alert-info text-center">
          {companies.length === 0
            ? `No companies found. Click "Add Company" to create one.`
            : `No results for "${searchTerm}".`}
        </div>
      ) : (
        <>
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("name")}
                  >
                    Name{"      "}
                    {sortKey === "name" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("address")}
                  >Address{"     "}
                    {sortKey === "address" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSort("phone")}
                  >Phone {"     "}
                    {sortKey === "phone" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.map((company, index) => (
                  <tr key={company.id}>
                    <td>
                      <span className="badge bg-secondary">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                    </td>
                    <td>
                      <strong>{company.name}</strong>
                    </td>
                    <td>{company.address || "—"}</td>
                    <td>{company.phone || "—"}</td>
                    <td>{company.description || "—"}</td>
                    <td className="d-flex gap-2">
                      {/* ✅ Edit Button */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEditModal(company)}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      {/* ✅ Delete Button */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(company.id!)}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div>
              <button
                className="btn btn-md btn-outline-secondary me-2"
                disabled={currentPage === 1}
                style={{ width: "80px" }}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-md btn-outline-secondary"
                style={{ width: "80px" }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* ✅ Modal for Add/Edit Company */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Company" : "Add Company"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form id="company-form" onSubmit={handleSaveCompany}>
            <div className="mb-3">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.name}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, name: e.target.value })
                }
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.address}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, address: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.phone}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, phone: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={2}
                value={newCompany.description}
                onChange={(e) =>
                  setNewCompany({ ...newCompany, description: e.target.value })
                }
              />
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            type="submit"
            form="company-form"
            disabled={submitting}
          >
            {submitting ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Success Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Companies;
