import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useRequests } from "../hooks/useRequests";
import type { Request } from "../types";

import RequestsFilters from "../components/request/RequestsFilters";
import RequestsTable from "../components/request/RequestsTable";
import RequestDetailsModal from "../components/request/RequestDetailsModal";

import "./Requests.css";

const RequestsPage: React.FC = () => {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,
    getEmployeeName,
    handleStatusChange,
    filteredRequests,
    totalPages,
    pageData,
  } = useRequests();

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState<Request | null>(null);

  const openDetailModal = (req: Request) => {
    setDetailRequest(req);
    setShowDetailModal(true);
  };

  return (
    <Container fluid className="bg-light py-4" style={{ minHeight: "100vh" }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-2">
          Gestion des demandes
        </h1>
        <p className="text-muted fs-5">
          Gérer et examiner les demandes des employés efficacement
        </p>
      </div>

      <RequestsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        setCurrentPage={setCurrentPage}
      />

      <RequestsTable
        loading={loading}
        pageData={pageData}
        filteredCount={filteredRequests.length}
        currentPage={currentPage}
        totalPages={totalPages}
        getEmployeeName={getEmployeeName}
        handleStatusChange={handleStatusChange}
        openDetailModal={openDetailModal}
        setCurrentPage={setCurrentPage}
      />

      <RequestDetailsModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        request={detailRequest}
        getEmployeeName={getEmployeeName}
      />
    </Container>
  );
};

export default RequestsPage;
