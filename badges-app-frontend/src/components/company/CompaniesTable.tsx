import React from "react";
import type { CompanyDTO } from "../../types";

type SortKey = "name" | "phone" | "address";
const DESC_COL_WIDTH = 260;

interface CompaniesTableProps {
  loading: boolean;
  paginatedCompanies: CompanyDTO[];
  sortKey: SortKey;
  sortAsc: boolean;
  handleSort: (key: SortKey) => void;
  openDetailsModal: (company: CompanyDTO) => void;
  openEditModal: (company: CompanyDTO, e?: React.MouseEvent) => void;
  handleDelete: (id: number, e?: React.MouseEvent) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  companiesCount: number;
  searchTerm: string;
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({
  loading,
  paginatedCompanies,
  sortKey,
  sortAsc,
  handleSort,
  openDetailsModal,
  openEditModal,
  handleDelete,
  currentPage,
  totalPages,
  setCurrentPage,
  companiesCount,
  searchTerm,
}) => {
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Chargement des entreprises...</p>
      </div>
    );
  }

  if (paginatedCompanies.length === 0) {
    return (
      <div className="alert alert-info text-center">
        {companiesCount === 0
          ? `Aucune entreprise trouvée. Cliquez sur "Ajouter une Entreprise" pour en créer une.`
          : `Aucun résultat pour "${searchTerm}".`}
      </div>
    );
  }

  return (
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
      <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
        <small className="text-muted">
          Page {currentPage} sur {totalPages}
        </small>
        <div className="pagination-buttons">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </button>
        </div>
      </div>
    </>
  );
};

export default CompaniesTable;
