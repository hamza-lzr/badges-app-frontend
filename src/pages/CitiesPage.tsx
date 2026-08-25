import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchCitiesByCountry, createCity, deleteCity } from "../api/apiCity";
import type { CityDTO } from "../types";

const CitiesPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get country name from navigation state (optional)
  const countryName = (location.state as { countryName?: string })?.countryName || "Selected Country";

  const [cities, setCities] = useState<CityDTO[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCity, setNewCity] = useState<CityDTO>({ name: "", countryId: Number(countryId) || 0 });

  useEffect(() => {
    if (countryId) {
      loadCities(Number(countryId));
    }
  }, [countryId]);

  const loadCities = async (id: number) => {
    try {
      setLoadingCities(true);
      const data = await fetchCitiesByCountry(id);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryId) return;
    try {
      await createCity({ ...newCity, countryId: Number(countryId) });
      setNewCity({ name: "", countryId: Number(countryId) });
      setShowAddForm(false);
      loadCities(Number(countryId));
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!window.confirm("Delete this city?")) return;
    try {
      await deleteCity(id);
      if (countryId) loadCities(Number(countryId));
    } catch (error) {
      console.error("Error deleting city:", error);
    }
  };

const goToAirports = (cityId: number, cityName: string) => {
  // Pass the cityId as a query parameter
  navigate(`/admin/airports?cityId=${cityId}`, { state: { cityName } });
};

  return (
    <div className="container">
      <h2 className="fw-semibold my-4">Villes du pays: {countryName}</h2>

{/* Buttons Row */}
<div className="d-flex align-items-center gap-2 mb-3">
  {/* Back to countries */}
  <button 
    className="btn btn-secondary" 
    onClick={() => navigate('/admin/locations')}
  >
    Retour aux pays
  </button>

  {/* Add City Button */}
  {!showAddForm ? (
    <button
      className="btn btn-primary"
      onClick={() => setShowAddForm(true)}
    >
      Ajouter une ville
    </button>
  ) : (
    <form className="d-flex gap-2 flex-grow-1" onSubmit={handleAddCity}>
      <input
        type="text"
        className="form-control"
        placeholder="Enter city name"
        value={newCity.name}
        onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
        required
        autoFocus
      />
      <button type="submit" className="btn btn-success">
        Enregistrer
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setShowAddForm(false)}
      >
        Annuler
      </button>
    </form>
  )}
</div>


      <hr />

      {/* List of Cities */}
      <h4>Villes enregistrées</h4>

      {loadingCities ? (
        <p>Chargement des villes...</p>
      ) : cities.length === 0 ? (
        <p className="text-muted">Aucune ville trouvée. Ajoutez-en une ci-dessus.</p>
      ) : (
        <ul className="list-group">
          {cities.map((city) => (
            <li
              key={city.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{city.name}</strong>
              </div>
              <div className="d-flex gap-2">
                {/* ✅ Go to Airports button */}
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => goToAirports(city.id!, city.name)}
                >
                Voir les aéroports
                </button>
                {/* Delete button */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCity(city.id!)}
                >
                Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitiesPage;
