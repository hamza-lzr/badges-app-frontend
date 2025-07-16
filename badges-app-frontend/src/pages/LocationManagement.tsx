import React, { useEffect, useState } from "react";
import { fetchCountries, createCountry, deleteCountry } from "../api/apiCountry";
import type { CountryDTO } from "../types";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";

const LocationManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCountry, setNewCountry] = useState<CountryDTO>({ name: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

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

  const goToCities = (countryId: number, countryName: string) => {
    navigate(`/admin/cities/${countryId}`, { state: { countryName } });
  };

  /** Filter + Sort Countries */
  const filteredCountries = countries
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold mb-0">Location Management</h2>

        {/* Small stats */}
        {!loadingCountries && (
          <span className="text-muted">
            <strong>{countries.length}</strong> Registered Countr
            {countries.length !== 1 ? "ies" : "y"}
          </span>
        )}
      </div>

      {/* Add Country Button / Form */}
      {!showAddForm ? (
        <Button variant="primary" className="mb-3" onClick={() => setShowAddForm(true)}>
          Add a New Country
        </Button>
      ) : (
        <Form className="d-flex gap-2 mb-3" onSubmit={handleAddCountry}>
          <Form.Control
            type="text"
            placeholder="Enter country name"
            value={newCountry.name}
            onChange={(e) => setNewCountry({ name: e.target.value })}
            required
            autoFocus
          />
          <Button type="submit" variant="success">
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </Form>
      )}

      {/* Filters: Search + Sort */}
      <div className="d-flex gap-3 mb-3 align-items-center">
        <Form.Control
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "250px" }}
        />

        <Button
          variant="outline-secondary"
          onClick={() => setSortAsc(!sortAsc)}
        >
          Sort {sortAsc ? "A → Z" : "Z → A"}
        </Button>
      </div>

      <hr />

      {/* Country List */}
      <h5 className="mb-3">Registered Countries</h5>

      {loadingCountries ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p className="text-muted mt-2">Loading countries...</p>
        </div>
      ) : filteredCountries.length === 0 ? (
        <p className="text-muted">No countries found. Try another search.</p>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Country</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country) => (
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
                      >
                        Go to Cities
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteCountry(country.id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
