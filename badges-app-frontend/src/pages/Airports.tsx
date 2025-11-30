import React, { useState, useCallback } from "react";
import type { AirportDTO } from "../types";
import { useAirports } from "../hooks/useAirports";

import AirportsHeader from "../components/airport/AirportsHeader";
import AirportsTable from "../components/airport/AirportsTable";
import AirportModal from "../components/airport/AirportModal";

const Airports: React.FC = () => {
  const {
    loading,
    cities,
    countries,
    sortedAirports,
    searchQuery,
    setSearchQuery,
    countryFilter,
    setCountryFilter,
    allCountriesList,
    sortKey,
    sortAsc,
    handleSort,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useAirports();

  // Modal and Form States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [airportData, setAirportData] = useState<Partial<AirportDTO>>({});

  const openAddModal = () => {
    setIsEditing(false);
    setAirportData({ iata: "", name: "", cityId: 0 });
    setShowModal(true);
  };

  const openEditModal = (airport: AirportDTO) => {
    setIsEditing(true);
    setAirportData(airport);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setAirportData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && airportData.id) {
        await handleUpdate(airportData.id, airportData as AirportDTO);
      } else {
        await handleCreate(airportData as Omit<AirportDTO, "id">);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving airport:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCityName = useCallback(
    (cityId: number) => cities.find(c => c.id === cityId)?.name || 'Unknown',
    [cities]
  );
  
  const getCountryName = useCallback(
    (cityId: number) => {
      const city = cities.find(c => c.id === cityId);
      return city ? countries.find(c => c.id === city.countryId)?.name || 'Unknown' : 'Unknown';
    },
    [cities, countries]
  );

  return (
    <div className="container py-4">
      <AirportsHeader
        filteredCount={sortedAirports.length}
        loading={loading}
        openAddModal={openAddModal}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        allCountries={allCountriesList}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <AirportsTable
        loading={loading}
        airports={sortedAirports}
        sortKey={sortKey}
        sortAsc={sortAsc}
        handleSort={handleSort}
        getCityName={getCityName}
        getCountryName={getCountryName}
        handleEdit={openEditModal}
        handleDelete={handleDelete}
      />

      <AirportModal
        show={showModal}
        onHide={closeModal}
        isEditing={isEditing}
        submitting={submitting}
        airportData={airportData}
        setAirportData={setAirportData}
        handleSubmit={handleSubmit}
        cities={cities}
        countries={countries}
      />
    </div>
  );
};

export default Airports;
