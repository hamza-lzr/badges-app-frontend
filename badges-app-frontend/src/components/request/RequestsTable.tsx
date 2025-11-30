import React from "react";
import { Card, Table, Badge, Spinner, Pagination, Button } from "react-bootstrap";
import { BiSearch } from "react-icons/bi";
import type { Request, ReqStatus } from "../../types";

const translateStatus = (status: ReqStatus | "ALL"): string => {
    switch (status) {
      case "PENDING": return "En attente";
      case "APPROVED": return "Approuvé";
      case "REJECTED": return "Rejeté";
      case "ALL": return "Tous les statuts";
      default: return status;
    }
  };

const badgeVariant = (status: ReqStatus) =>
  status === "PENDING"
    ? "warning"
    : status === "APPROVED"
    ? "success"
    : "danger";

interface RequestsTableProps {
  loading: boolean;
  pageData: Request[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  getEmployeeName: (userId: number) => string;
  handleStatusChange: (req: Request, status: ReqStatus) => void;
  openDetailModal: (req: Request) => void;
  setCurrentPage: (page: number) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  loading,
  pageData,
  filteredCount,
  currentPage,
  totalPages,
  getEmployeeName,
  handleStatusChange,
  openDetailModal,
  setCurrentPage,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-muted mb-0">
          Affichage de {pageData.length} sur {filteredCount} demandes
        </h6>
        <Badge bg="secondary" className="fs-6 px-3 py-2">
          Page {currentPage} sur {totalPages || 1}
        </Badge>
      </div>

      <Card className="shadow-lg border-0 requests-table-card">
        <div className="position-relative">
          {loading && (
            <div className="table-loading-overlay">
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="text-muted mt-3 mb-0">Chargement des demandes...</p>
            </div>
          )}
          <div className="table-responsive requests-table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="requests-table-header">
                <tr>
                  <th className="px-4 py-3 fw-semibold border-0">Description</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "120px" }}>Type</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "120px" }}>Statut</th>
                  <th className="px-4 py-3 fw-semibold border-0">Employé</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "160px" }}>Créée le</th>
                  <th className="px-4 py-3 fw-semibold border-0 text-center" style={{ width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="text-muted">
                        <BiSearch size={48} className="mb-3 opacity-50" />
                        <p className="fs-5 mb-0">Aucune demande trouvée</p>
                        <small>Essayez d'ajuster vos filtres</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((r) => (
                    <tr
                      key={r.id}
                      className="request-table-row"
                      onClick={() => openDetailModal(r)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-truncate" style={{ maxWidth: "300px" }} title={r.description}>
                          {r.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge bg="info" className="text-capitalize px-2 py-1">
                          {r.reqType.replace("_", " ").toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge bg={badgeVariant(r.reqStatus)} className="px-3 py-2 fw-semibold">
                          {translateStatus(r.reqStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="fw-semibold text-dark">{getEmployeeName(r.userId)}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <small className="text-muted">
                          {new Date(r.createdAt).toLocaleString([], {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: false,
                          })}
                        </small>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.reqStatus === "PENDING" ? (
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              className="px-3 py-1 fw-semibold action-btn"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(r, "APPROVED"); }}
                            >
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="px-3 py-1 fw-semibold action-btn"
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(r, "REJECTED"); }}
                            >
                              Rejeter
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {r.reqStatus === "APPROVED" ? "✓ Traité" : "✗ Rejeté"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
        {totalPages > 1 && (
          <Card.Footer className="bg-white border-0 py-3 requests-table-footer">
            <div className="d-flex justify-content-center">
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default RequestsTable;
