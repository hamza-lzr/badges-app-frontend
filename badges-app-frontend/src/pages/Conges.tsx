import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Form,
  Modal,
  Pagination,
} from "react-bootstrap";
import {
  fetchConges,
  approveConge,
  rejectConge,
  deleteConge,
} from "../api/apiConge";
import { fetchEmployees } from "../api/ApiEmployee";
import type { CongeDTO, UserDTO } from "../types";

const CongeManagement: React.FC = () => {
  const [conges, setConges] = useState<CongeDTO[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal for confirming deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [congeToDelete, setCongeToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    setLoading(true);
    const [congesData, employeesData] = await Promise.all([
      fetchConges(),
      fetchEmployees(),
    ]);

    // Trier du plus récent au plus ancien
    const sortedConges = congesData.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setConges(sortedConges);
    setEmployees(employeesData);
  } catch (err) {
    console.error("Error fetching congés or employees:", err);
  } finally {
    setLoading(false);
  }
};


  const getEmployeeName = (userId: number) => {
    const emp = employees.find((e) => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `User #${userId}`;
  };

  const handleApprove = async (id: number) => {
    await approveConge(id);
    await loadData();
  };

  const handleReject = async (id: number) => {
    await rejectConge(id);
    await loadData();
  };


  const handleDelete = async () => {
    if (congeToDelete !== null) {
      await deleteConge(congeToDelete);
      setShowDeleteModal(false);
      setCongeToDelete(null);
      await loadData();
    }
  };

  /** Filtered and paginated conges */
  const filteredConges = conges.filter((c) => {
    const empName = getEmployeeName(c.userId).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      empName.includes(query) || c.description?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredConges.length / itemsPerPage);
  const paginatedConges = filteredConges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Gestion des Congés</h2>
        <div className="d-flex gap-3">
          <Form.Control
            type="text"
            placeholder="Rechercher un employé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: "250px" }}
          />
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Rejeté</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Chargement des congés...</p>
        </div>
      ) : filteredConges.length === 0 ? (
        <div className="alert alert-light text-center border">
          Aucun congé trouvé.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Employé</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th style={{ width: "22%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedConges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{getEmployeeName(c.userId)}</strong>
                    </td>
                    <td>{c.startDate}</td>
                    <td>{c.endDate}</td>
                    <td>{c.description}</td>
                    <td>
                      <span
                        className={`badge bg-${
                          c.status === "APPROVED"
                            ? "success"
                            : c.status === "REJECTED"
                            ? "danger"
                            : "warning text-dark"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {new Date(c.createdAt).toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>{" "}
                    <td>
                      <div className="d-flex gap-2">
                        {c.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(c.id!)}
                            >
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(c.id!)}
                            >
                              Rejeter
                            </Button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce congé ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CongeManagement;
