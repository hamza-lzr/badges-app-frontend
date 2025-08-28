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

const DESC_COL_WIDTH = 260; // largeur fixe du descriptif (px)

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal Readonly (Details)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCompany, setDetailsCompany] = useState<CompanyDTO | null>(null);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Add/Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const [newCompany, setNewCompany] = useState<Omit<CompanyDTO, "id">>({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  // Search / Pagination / Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
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

  // Add
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedCompanyId(null);
    resetForm();
    setShowModal(true);
  };

  // Edit
  const openEditModal = (company: CompanyDTO, e?: React.MouseEvent) => {
    e?.stopPropagation(); // ne pas déclencher l'ouverture du modal de détails
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

  // Readonly Details
  const openDetailsModal = (company: CompanyDTO) => {
    setDetailsCompany(company);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsCompany(null);
  };

  // Save
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && selectedCompanyId) {
        await updateCompany(selectedCompanyId, newCompany);
        showSuccessToast("Entreprise modifiée avec succès !");
      } else {
        await createCompany(newCompany);
        showSuccessToast("Entreprise ajoutée avec succès !");
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

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation(); // ne pas ouvrir le modal de détails
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;
    try {
      await deleteCompany(id);
      await loadCompanies();
      showSuccessToast("Entreprise supprimée avec succès !");
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
    }
  };

  const resetForm = () => {
    setNewCompany({ name: "", address: "", phone: "", description: "" });
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter + Sort + Pagination
  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.phone || "").includes(searchTerm)
      ),
    [companies, searchTerm]
  );

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Entreprises</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1" />
          Ajouter une Entreprise
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher par nom, adresse ou téléphone..."
          style={{ width: 400 }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Chargement des entreprises...</p>
        </div>
      ) : sortedCompanies.length === 0 ? (
        <div className="alert alert-info text-center">
          {companies.length === 0
            ? `Aucune entreprise trouvée. Cliquez sur "Ajouter une Entreprise" pour en créer une.`
            : `Aucun résultat pour "${searchTerm}".`}
        </div>
      ) : (
        <>
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                    Nom{" "}
                    {sortKey === "name" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("address")}>
                    Adresse{" "}
                    {sortKey === "address" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("phone")}>
                    Téléphone{" "}
                    {sortKey === "phone" &&
                      (sortAsc ? (
                        <i className="bi bi-caret-up-fill text-primary"></i>
                      ) : (
                        <i className="bi bi-caret-down-fill text-primary"></i>
                      ))}
                  </th>
                  {/* largeur fixe pour la colonne Descriptif */}
                  <th style={{ width: DESC_COL_WIDTH, maxWidth: DESC_COL_WIDTH }}>
                    Descriptif
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => openDetailsModal(company)}
                    style={{ cursor: "pointer" }}
                    title="Voir les détails"
                  >
                    <td>
                      <strong>{company.name}</strong>
                    </td>
                    <td>{company.address || "—"}</td>
                    <td>{company.phone || "—"}</td>
                    <td>
                      {/* Wrapper avec largeur fixe + ellipsis */}
                      <div
                        style={{
                          width: DESC_COL_WIDTH,
                          maxWidth: DESC_COL_WIDTH,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={company.description || "—"}
                      >
                        {company.description || "—"}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={(e) => openEditModal(company, e)}
                          title="Modifier"
                        >
                          <i className="bi bi-pencil" />
                          Modifier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={(e) => handleDelete(company.id!, e)}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <small className="text-muted">
              Page {currentPage} sur {totalPages}
            </small>
            <div className="pagination-buttons">
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Précédent
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Add/Edit Company */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Modifier l'entreprise" : "Ajouter une entreprise"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="company-form" onSubmit={handleSaveCompany}>
            <div className="mb-3">
              <label className="form-label">Nom de l'entreprise</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Adresse</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.address}
                onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Téléphone</label>
              <input
                type="text"
                className="form-control"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Descriptif</label>
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
            Annuler
          </Button>
          <Button variant="success" type="submit" form="company-form" disabled={submitting}>
            {submitting ? "Enregistrement..." : isEditing ? "Modifier" : "Ajouter"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Readonly Details */}
      <Modal show={showDetailsModal} onHide={closeDetailsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'entreprise</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsCompany ? (
            <div className="vstack gap-2">
              <div>
                <small className="text-muted d-block">Nom</small>
                <div className="fw-semibold">{detailsCompany.name}</div>
              </div>
              <div>
                <small className="text-muted d-block">Adresse</small>
                <div>{detailsCompany.address || "—"}</div>
              </div>
              <div>
                <small className="text-muted d-block">Téléphone</small>
                <div>{detailsCompany.phone || "—"}</div>
              </div>
              <div>
                <small className="text-muted d-block">Descriptif</small>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {detailsCompany.description || "—"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted">Aucune entreprise sélectionnée.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailsModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Toast */}
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

