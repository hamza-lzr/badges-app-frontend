import React, { useEffect, useState } from "react";
import {
  fetchCountries,
  createCountry,
  deleteCountry,
  updateCountry,
} from "../api/apiCountry";
import type { CountryDTO } from "../types";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Modal } from "react-bootstrap";

const LocationManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCountry, setNewCountry] = useState<CountryDTO>({ name: "" });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryDTO | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const data = await fetchCountries();
      setCountries(data);
    } catch (error) {
      console.error("Error loading countries:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCountry(newCountry);
      setNewCountry({ name: "" });
      setShowAddForm(false);
      loadCountries();
    } catch (error) {
      console.error("Error adding country:", error);
    }
  };

  const handleDeleteCountry = async (id: number) => {
    if (!window.confirm("Delete this country?")) return;
    try {
      await deleteCountry(id);
      loadCountries();
    } catch (error) {
      console.error("Error deleting country:", error);
    }
  };

  const handleEditCountry = async (id: number, updatedCountry: CountryDTO) => {
    try {
      await updateCountry(id, updatedCountry);
      setShowEditForm(false);
      setEditingCountry(null);
      loadCountries();
    } catch (error) {
      console.error("Error editing country:", error);
    }
  };

  const goToCities = (countryId: number, countryName: string) => {
    navigate(`/admin/cities/${countryId}`, { state: { countryName } });
  };

  /** Filter + Sort Countries */
  const filteredCountries = countries
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  //Pagination
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = filteredCountries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Gestion des régions</h2>

        {/* Small stats */}
        {!loadingCountries && (
          <span className="text-muted">
            <strong>{countries.length}</strong> Pays enregistré
            {countries.length !== 1 ? "s" : "."}
          </span>
        )}
      </div>

      {/* Add Country Button / Form */}
      {!showAddForm ? (
        <Button
          variant="primary"
          className="mb-3"
          onClick={() => setShowAddForm(true)}
        >
          Ajouter un pays
        </Button>
      ) : (
        <Form className="d-flex gap-2 mb-3" onSubmit={handleAddCountry}>
          <Form.Control
            type="text"
            placeholder="Entrez le nom du pays"
            value={newCountry.name}
            onChange={(e) => setNewCountry({ name: e.target.value })}
            required
            autoFocus
          />
          <Button type="submit" variant="success">
            Enregistrer
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(false)}>
            Annuler
          </Button>
        </Form>
      )}

      {/* Filters: Search + Sort */}
      <div className="d-flex gap-3 mb-3 align-items-center">
        <Form.Control
          type="text"
          placeholder="Rechercher des pays..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "250px" }}
        />

        <Button
          variant="outline-secondary"
          onClick={() => setSortAsc(!sortAsc)}
        >
          Trier {sortAsc ? "A → Z" : "Z → A"}
        </Button>
      </div>

      <hr />

      {/* Country List */}

      {loadingCountries ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p className="text-muted mt-2">Chargement des pays...</p>
        </div>
      ) : filteredCountries.length === 0 ? (
        <p className="text-muted">
          Aucun pays trouvé. Essayez une autre recherche.
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Pays</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCountries.map((country) => (
                <tr key={country.id}>
                  <td>
                    <strong>{country.name}</strong>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => goToCities(country.id!, country.name)}
                        title="Voir les villes"
                      >
                        Voir villes
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingCountry(country);
                          setShowEditForm(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCountry(country.id!)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      {/* Edit Country Modal */}
      <Modal show={showEditForm} onHide={() => setShowEditForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le pays</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCountry && (
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group className="mb-3">
                <Form.Label>Nom du pays</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCountry.name}
                  onChange={(e) =>
                    setEditingCountry({
                      ...editingCountry,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditForm(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (editingCountry) {
                handleEditCountry(editingCountry.id!, editingCountry);
              }
            }}
          >
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LocationManagement;
