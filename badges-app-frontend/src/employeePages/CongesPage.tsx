import React, { useState } from "react";
import { Container, Spinner, Alert, Pagination } from "react-bootstrap";
import { useConges } from "../hooks/useConges";
import type { CongeDTO } from "../types";

import CongesToolbar from "../components/conges/CongesToolbar";
import CongesCardView from "../components/conges/CongesCardView";
import CongesTableView from "../components/conges/CongesTableView";
import CreateCongeModal from "../components/conges/CreateCongeModal";
import CongeDetailsModal from "../components/conges/CongeDetailsModal";

import "./CongesPage.css";

type ViewMode = "cards" | "table";

const EmployeeCongesPage: React.FC = () => {
  const {
    loading,
    submitting,
    filteredSortedConges,
    paginatedConges,
    totalPages,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    handleCreateConge,
  } = useConges();

  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConge, setSelectedConge] = useState<CongeDTO | null>(null);

  const openDetailsModal = (conge: CongeDTO) => {
    setSelectedConge(conge);
    setShowDetailsModal(true);
  };

  const handleCreateSubmit = async (data: Omit<CongeDTO, 'id' | 'status' | 'userId' | 'createdAt'>) => {
    await handleCreateConge(data);
    setShowCreateModal(false);
  };
  
  return (
    <Container className="py-5">
      <CongesToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNewRequest={() => setShowCreateModal(true)}
      />

      {loading ? (
        <div className="d-flex flex-column align-items-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Chargement de vos congés...</p>
        </div>
      ) : filteredSortedConges.length === 0 ? (
        <Alert variant="light" className="text-center border">
          Aucune demande de congé trouvée.
        </Alert>
      ) : viewMode === "cards" ? (
        <CongesCardView conges={paginatedConges} onCongeClick={openDetailsModal} />
      ) : (
        <CongesTableView conges={paginatedConges} onCongeClick={openDetailsModal} />
      )}

      {filteredSortedConges.length > 0 && totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      )}

      <CreateCongeModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        submitting={submitting}
        onSubmit={handleCreateSubmit}
      />

      <CongeDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        conge={selectedConge}
      />
    </Container>
  );
};

export default EmployeeCongesPage;
