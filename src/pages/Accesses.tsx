import React, { useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useAccesses } from "../hooks/useAccesses";
import AccessesHeader from "../components/accesses/AccessesHeader";
import AccessesFilters from "../components/accesses/AccessesFilters";
import AccessesTableView from "../components/accesses/AccessesTableView";
import AccessesGridView from "../components/accesses/AccessesGridView";
import AccessFormModal from "../components/accesses/AccessFormModal";
import type { AccessDTO } from "../types";

type ViewMode = "table" | "grid";

const AdminAccessesPage: React.FC = () => {
  const {
    loading,
    airportsMap,
    badgesMap,
    badgeOwnerMap,
    filteredAccesses,
    searchQuery,
    setSearchQuery,
    airportFilter,
    setAirportFilter,
    nameFilter,
    setNameFilter,
    handleSave,
    handleDelete,
  } = useAccesses();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showModal, setShowModal] = useState(false);
  const [editingAccess, setEditingAccess] = useState<AccessDTO | null>(null);

  const openAddModal = () => {
    setEditingAccess(null);
    setShowModal(true);
  };

  const openEditModal = (access: AccessDTO) => {
    setEditingAccess(access);
    setShowModal(true);
  };

  const onSave = (formData: AccessDTO) => {
    handleSave(formData, editingAccess?.id ?? null);
    setShowModal(false);
  };

  return (
    <div className="container py-4">
      <AccessesHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAdd={openAddModal}
      />
      <AccessesFilters
        airportFilter={airportFilter}
        onAirportFilterChange={setAirportFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        airportsMap={airportsMap}
      />

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Chargement...</p>
        </div>
      ) : filteredAccesses.length === 0 ? (
        <Alert variant="info" className="text-center">
          Aucun accès trouvé.
        </Alert>
      ) : viewMode === "table" ? (
        <AccessesTableView
          accesses={filteredAccesses}
          airportsMap={airportsMap}
          badgesMap={badgesMap}
          badgeOwnerMap={badgeOwnerMap}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      ) : (
        <AccessesGridView
          accesses={filteredAccesses}
          airportsMap={airportsMap}
          badgesMap={badgesMap}
          badgeOwnerMap={badgeOwnerMap}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <AccessFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={onSave}
        editingAccess={editingAccess}
        airportsMap={airportsMap}
        badgesMap={badgesMap}
      />
    </div>
  );
};

export default AdminAccessesPage;