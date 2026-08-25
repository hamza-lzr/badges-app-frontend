import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { AirportDTO, CityDTO, CountryDTO } from "../types";
import {
  fetchAirports,
  createAirport,
  deleteAirport,
  updateAirport,
} from "../api/apiAirport";
import { fetchCities } from "../api/apiCity";
import { fetchCountries } from "../api/apiCountry";

type SortKey = "iata" | "name" | "city" | "country";

export const useAirports = () => {
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [searchParams] = useSearchParams();
  const cityIdFilter = searchParams.get("cityId");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [countriesData, citiesData, airportsData] = await Promise.all([
        fetchCountries(),
        fetchCities(),
        fetchAirports(),
      ]);
      setCountries(countriesData);
      setCities(citiesData);
      setAirports(airportsData);
    } catch (error) {
      console.error("Error loading airport data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const citiesMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);
  const countriesMap = useMemo(() => new Map(countries.map((c) => [c.id, c])), [countries]);

  const getCityName = useCallback((cityId: number) => citiesMap.get(cityId)?.name || "Unknown", [citiesMap]);
  const getCountryName = useCallback((cityId: number) => {
    const city = citiesMap.get(cityId);
    return city ? countriesMap.get(city.countryId)?.name || "Unknown" : "Unknown";
  }, [citiesMap, countriesMap]);

  const allCountriesList = useMemo(() => 
    Array.from(new Set(countries.map(c => c.name).filter(Boolean)))
  , [countries]);

  const filteredAirports = useMemo(() => {
    return airports.filter((airport) => {
      const query = searchQuery.toLowerCase();
      const cityName = getCityName(airport.cityId).toLowerCase();
      const countryName = getCountryName(airport.cityId).toLowerCase();

      const matchesSearch =
        airport.name.toLowerCase().includes(query) ||
        airport.iata.toLowerCase().includes(query) ||
        cityName.includes(query) ||
        countryName.includes(query);

      const matchesCountryFilter = countryFilter === "" || countryName === countryFilter.toLowerCase();
      const matchesCity = cityIdFilter ? airport.cityId === Number(cityIdFilter) : true;

      return matchesSearch && matchesCountryFilter && matchesCity;
    });
  }, [airports, searchQuery, countryFilter, cityIdFilter, getCityName, getCountryName]);

  const sortedAirports = useMemo(() => {
    return [...filteredAirports].sort((a, b) => {
      let valA: string, valB: string;
      switch (sortKey) {
        case "city":
          valA = getCityName(a.cityId);
          valB = getCityName(b.cityId);
          break;
        case "country":
          valA = getCountryName(a.cityId);
          valB = getCountryName(b.cityId);
          break;
        default:
          valA = (a[sortKey] as string) || "";
          valB = (b[sortKey] as string) || "";
      }
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [filteredAirports, sortKey, sortAsc, getCityName, getCountryName]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleCreate = useCallback(async (airportData: Omit<AirportDTO, "id">) => {
    await createAirport(airportData);
    await loadData();
  }, [loadData]);

  const handleUpdate = useCallback(async (id: number, airportData: AirportDTO) => {
    await updateAirport(id, airportData);
    await loadData();
  }, [loadData]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("Delete this airport?")) return;
    await deleteAirport(id);
    await loadData();
  }, [loadData]);

  return {
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
  };
};
