import React, { useEffect, useState } from "react";
import { fetchCountries, createCountry, deleteCountry } from "../api/apiCountry";
import { fetchCitiesByCountry, createCity, deleteCity } from "../api/apiCity";
import { fetchAirports, createAirport, deleteAirport } from "../api/apiAirport";

import type { CountryDTO, CityDTO, AirportDTO } from "../types";

const LocationManagement: React.FC = () => {
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [airports, setAirports] = useState<AirportDTO[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAirports, setLoadingAirports] = useState(false);

  // New forms
  const [newCountry, setNewCountry] = useState<CountryDTO>({ name: "" });
  const [newCity, setNewCity] = useState<CityDTO>({ name: "", countryId: "" });
  const [newAirport, setNewAirport] = useState<AirportDTO>({
    iata: "",
    name: "",
    cityId: 0,
  });

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

  const handleSelectCountry = async (countryId: number) => {
    setSelectedCountry(countryId);
    setSelectedCity(null);
    setCities([]);
    setAirports([]);

    try {
      setLoadingCities(true);
      const data = await fetchCitiesByCountry(countryId);
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSelectCity = async (cityId: number) => {
    setSelectedCity(cityId);
    setAirports([]);
    try {
      setLoadingAirports(true);
      const data = await fetchAirports(); // Fetch all airports
      // Filter airports for selected city
      const filtered = data.filter((a) => a.cityId === cityId);
      setAirports(filtered);
    } catch (error) {
      console.error("Error loading airports:", error);
    } finally {
      setLoadingAirports(false);
    }
  };

  // CRUD: Countries
  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCountry(newCountry);
      setNewCountry({ name: "" });
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
      setCities([]);
      setAirports([]);
    } catch (error) {
      console.error("Error deleting country:", error);
    }
  };

  // CRUD: Cities
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) {
      alert("Select a country first!");
      return;
    }
    try {
      await createCity({ ...newCity, countryId: String(selectedCountry) });
      setNewCity({ name: "", countryId: "" });
      handleSelectCountry(selectedCountry);
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!window.confirm("Delete this city?")) return;
    try {
      await deleteCity(id);
      if (selectedCountry) handleSelectCountry(selectedCountry);
    } catch (error) {
      console.error("Error deleting city:", error);
    }
  };

  // CRUD: Airports
  const handleAddAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) {
      alert("Select a city first!");
      return;
    }
    try {
      await createAirport({ ...newAirport, cityId: selectedCity });
      setNewAirport({ iata: "", name: "", cityId: 0 });
      handleSelectCity(selectedCity);
    } catch (error) {
      console.error("Error adding airport:", error);
    }
  };

  const handleDeleteAirport = async (id: number) => {
    if (!window.confirm("Delete this airport?")) return;
    try {
      await deleteAirport(id);
      if (selectedCity) handleSelectCity(selectedCity);
    } catch (error) {
      console.error("Error deleting airport:", error);
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">🌍 Location Management</h2>

      {/* ==================== COUNTRIES ==================== */}
      <section>
        <h4>Countries</h4>
        {loadingCountries ? (
          <p>Loading countries...</p>
        ) : (
          <div>
            <ul className="list-group mb-3">
              {countries.map((country) => (
                <li
                  key={country.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    selectedCountry === country.id ? "active text-white" : ""
                  }`}
                  onClick={() => handleSelectCountry(country.id!)}
                  style={{ cursor: "pointer" }}
                >
                  {country.name}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCountry(country.id!);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {/* Add Country Form */}
            <form className="d-flex gap-2" onSubmit={handleAddCountry}>
              <input
                type="text"
                className="form-control"
                placeholder="New country name"
                value={newCountry.name}
                onChange={(e) => setNewCountry({ name: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
          </div>
        )}
      </section>

      <hr />

      {/* ==================== CITIES ==================== */}
      {selectedCountry && (
        <section>
          <h4>Cities in Selected Country</h4>
          {loadingCities ? (
            <p>Loading cities...</p>
          ) : cities.length === 0 ? (
            <p>No cities available for this country.</p>
          ) : (
            <ul className="list-group mb-3">
              {cities.map((city) => (
                <li
                  key={city.id}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    selectedCity === city.id ? "active text-white" : ""
                  }`}
                  onClick={() => handleSelectCity(city.id!)}
                  style={{ cursor: "pointer" }}
                >
                  {city.name}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCity(city.id!);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add City Form */}
          <form className="d-flex gap-2" onSubmit={handleAddCity}>
            <input
              type="text"
              className="form-control"
              placeholder="New city name"
              value={newCity.name}
              onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
              required
            />
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
        </section>
      )}

      <hr />

      {/* ==================== AIRPORTS ==================== */}
      {selectedCity && (
        <section>
          <h4>Airports in Selected City</h4>
          {loadingAirports ? (
            <p>Loading airports...</p>
          ) : airports.length === 0 ? (
            <p>No airports available for this city.</p>
          ) : (
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>IATA</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {airports.map((airport) => (
                  <tr key={airport.id}>
                    <td>{airport.id}</td>
                    <td>{airport.iata}</td>
                    <td>{airport.name}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAirport(airport.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add Airport Form */}
          <form className="row g-2 mt-3" onSubmit={handleAddAirport}>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="IATA"
                value={newAirport.iata}
                onChange={(e) =>
                  setNewAirport({ ...newAirport, iata: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Airport Name"
                value={newAirport.name}
                onChange={(e) =>
                  setNewAirport({ ...newAirport, name: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100">
                Add Airport
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default LocationManagement;
