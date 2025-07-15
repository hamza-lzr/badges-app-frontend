import React, { useEffect, useState } from "react";
import { fetchCountries, createCountry, deleteCountry } from "../api/apiCountry";
import type { CountryDTO } from "../types";
import { useNavigate } from "react-router-dom";

const LocationManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false); // ✅ toggle add form
  const [newCountry, setNewCountry] = useState<CountryDTO>({ name: "" });

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
      setShowAddForm(false); // ✅ hide form after adding
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
    navigate(`/admin/cities/${countryId}`, { state: { countryName } }); // ✅ navigate to CitiesPage
  };

  return (
    <div className="container">
      <h2 className="my-4">Location Management</h2>

      {/* Add Country Button + Form */}
      {!showAddForm ? (
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowAddForm(true)}
        >
          Add a New Country
        </button>
      ) : (
        <form className="d-flex gap-2 mb-3" onSubmit={handleAddCountry}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter country name"
            value={newCountry.name}
            onChange={(e) => setNewCountry({ name: e.target.value })}
            required
            autoFocus
          />
          <button type="submit" className="btn btn-success">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      <hr />

      {/* List of Countries */}
      <h4>Available Countries</h4>

      {loadingCountries ? (
        <p>Loading countries...</p>
      ) : countries.length === 0 ? (
        <p className="text-muted">No countries found. Add one above.</p>
      ) : (
        <ul className="list-group">
          {countries.map((country) => (
            <li
              key={country.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{country.name}</strong>
              </div>
              <div className="d-flex gap-2">
                {/* ✅ Go to Cities button */}
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => goToCities(country.id!, country.name)}
                >
                  Go to Cities
                </button>
                {/* Delete button */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCountry(country.id!)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationManagement;
