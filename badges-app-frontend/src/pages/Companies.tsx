import React, { useState } from "react";
import type { CompanyDTO } from "../types";
import { useCompanies } from "../hooks/useCompanies";
import { Toast, ToastContainer } from "react-bootstrap";

import CompaniesHeader from "../components/company/CompaniesHeader";
import CompaniesTable from "../components/company/CompaniesTable";
import AddEditCompanyModal from "../components/company/AddEditCompanyModal";
import CompanyDetailsModal from "../components/company/CompanyDetailsModal";

const Companies: React.FC = () => {
  const {
    loading,
    companies,
    paginatedCompanies,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    sortKey,
    sortAsc,
    handleSort,
    handleSave: handleSaveCompany,
    handleDelete,
  } = useCompanies();

  // Modal and Toast States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailsCompany, setDetailsCompany] = useState<CompanyDTO | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyForm, setCompanyForm] = useState<Omit<CompanyDTO, "id">>({
    name: "", address: "", phone: "", description: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedCompanyId(null);
    setCompanyForm({ name: "", address: "", phone: "", description: "" });
    setShowAddEditModal(true);
  };

  const openEditModal = (company: CompanyDTO, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setSelectedCompanyId(company.id!);
    setCompanyForm({
      name: company.name,
      address: company.address || "",
      phone: company.phone || "",
      description: company.description || "",
    });
    setShowAddEditModal(true);
  };
  
  const openDetailsModal = (company: CompanyDTO) => {
    setDetailsCompany(company);
    setShowDetailsModal(true);
  };

  const handleLocalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await handleSaveCompany(companyForm, selectedCompanyId);
      showSuccessToast(isEditing ? "Entreprise modifiée avec succès !" : "Entreprise ajoutée avec succès !");
      setShowAddEditModal(false);
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocalDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await handleDelete(id);
    showSuccessToast("Entreprise supprimée avec succès !");
  }

  return (
    <div className="container py-4">
      <CompaniesHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setCurrentPage={setCurrentPage}
        openAddModal={openAddModal}
      />

      <CompaniesTable
        loading={loading}
        paginatedCompanies={paginatedCompanies}
        sortKey={sortKey}
        sortAsc={sortAsc}
        handleSort={handleSort}
        openDetailsModal={openDetailsModal}
        openEditModal={openEditModal}
        handleDelete={handleLocalDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        companiesCount={companies.length}
        searchTerm={searchTerm}
      />

      <AddEditCompanyModal
        show={showAddEditModal}
        onHide={() => setShowAddEditModal(false)}
        isEditing={isEditing}
        submitting={submitting}
        newCompany={companyForm}
        setNewCompany={setCompanyForm}
        handleSave={handleLocalSave}
      />

      <CompanyDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        company={detailsCompany}
      />

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