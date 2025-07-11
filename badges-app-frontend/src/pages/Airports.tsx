import React, { useEffect, useState } from "react";
import type { AirportDTO } from "../types";
import {
  fetchAirports,
  createAirport,
  deleteAirport,
} from "../api/apiAirport";

const Airports: React.FC = () => {
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAirport, setNewAirport] = useState<AirportDTO>({
    iata: "",
    name: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      setLoading(true);
      const data = await fetchAirports();
      setAirports(data);
    } catch (error) {
      console.error("Error fetching airports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAirport(newAirport);
      setNewAirport({ iata: "", name: "", city: "", country: "" });
      loadAirports();
    } catch (error) {
      console.error("Error creating airport:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this airport?")) return;
    try {
      await deleteAirport(id);
      loadAirports();
    } catch (error) {
      console.error("Error deleting airport:", error);
    }
  };

  return (
    <div className="container">
      <h2 className="my-4">Airports</h2>

      {loading ? (
        <div>Loading airports...</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>IATA</th>
              <th>Name</th>
              <th>City</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airports.map((airport) => (
              <tr key={airport.id}>
                <td>{airport.id}</td>
                <td>{airport.iata}</td>
                <td>{airport.name}</td>
                <td>{airport.city}</td>
                <td>{airport.country}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(airport.id!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 className="mt-5">Add New Airport</h4>
      <form onSubmit={handleCreate} className="row g-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="IATA"
            value={newAirport.iata}
            onChange={(e) => setNewAirport({ ...newAirport, iata: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={newAirport.name}
            onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="City"
            value={newAirport.city}
            onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Country"
            value={newAirport.country}
            onChange={(e) => setNewAirport({ ...newAirport, country: e.target.value })}
            required
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Add Airport
          </button>
        </div>
      </form>
    </div>
  );
};

export default Airports;
