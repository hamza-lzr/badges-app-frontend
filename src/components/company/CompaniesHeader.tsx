import React from "react";

interface CompaniesHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setCurrentPage: (page: number) => void;
  openAddModal: () => void;
}

const CompaniesHeader: React.FC<CompaniesHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  openAddModal,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Entreprises</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-1" />
          Ajouter une Entreprise
        </button>
      </div>
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
    </>
  );
};

export default CompaniesHeader;
