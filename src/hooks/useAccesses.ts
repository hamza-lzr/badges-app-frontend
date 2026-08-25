import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AccessDTO, AirportDTO, BadgeDTO, UserDTO } from "../types";
import {
  fetchAccesses,
  createAccess,
  updateAccess,
  deleteAccess,
} from "../api/apiAccess";
import { fetchAirports } from "../api/apiAirport";
import { fetchBadges } from "../api/apiBadge";
import { fetchEmployees } from "../api/ApiEmployee";

type OwnerInfo = {
  fullName: string;
  firstName: string;
  lastName:string;
  matricule?: string;
};

export const useAccesses = () => {
  const [accessList, setAccessList] = useState<AccessDTO[]>([]);
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [airportFilter, setAirportFilter] = useState<number | "">("");
  const [nameFilter, setNameFilter] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [accessesData, airportsData, badgesData, employeesData] =
        await Promise.all([
          fetchAccesses(),
          fetchAirports(),
          fetchBadges(),
          fetchEmployees(),
        ]);
      setAccessList(accessesData);
      setAirports(airportsData);
      setBadges(badgesData);
      setEmployees(employeesData);

      const state = (location.state || {}) as {
        nameFilter?: string;
        matriculeFilter?: string;
      };
      if (state.nameFilter || state.matriculeFilter) {
        if (state.nameFilter) {
          setNameFilter(state.nameFilter);
        } else if (state.matriculeFilter) {
          setNameFilter(state.matriculeFilter);
        }
        // Clear location state only after processing it
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) {
      console.error("Failed to load accesses data", err);
    } finally {
      setLoading(false);
    }
  }, [location, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const airportsMap = useMemo(
    () =>
      Object.fromEntries(
        airports.map((a) => [a.id, `${a.name} (${a.iata})`])
      ),
    [airports]
  );
  const badgesMap = useMemo(
    () => Object.fromEntries(badges.map((b) => [b.id!, b.code])),
    [badges]
  );

  const badgeOwnerMap = useMemo(() => {
    const employeesById = Object.fromEntries(
      employees.map((e) => [e.id, e])
    );
    return badges.reduce((acc, b) => {
      const ownerId = b.userId;
      const emp = ownerId ? employeesById[ownerId] : undefined;
      if (emp && b.id != null) {
        acc[b.id] = {
          fullName: `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim(),
          firstName: emp.firstName ?? "",
          lastName: emp.lastName ?? "",
          matricule: emp.matricule,
        };
      }
      return acc;
    }, {} as Record<number, OwnerInfo>);
  }, [badges, employees]);

  const filteredAccesses = useMemo(() => {
    return accessList.filter((a) => {
      const q = searchQuery.toLowerCase();
      const airportName = (airportsMap[a.airportId] || "").toLowerCase();
      const badgeCode = (badgesMap[a.badgeId] || "").toLowerCase();
      const owner = badgeOwnerMap[a.badgeId];
      const empName = (owner?.fullName ?? "").toLowerCase();

      const matchesSearch = badgeCode.includes(q) || airportName.includes(q);
      const matchesAirport =
        airportFilter === "" || a.airportId === airportFilter;
      const matchesName =
        nameFilter.trim() === "" ||
        empName.includes(nameFilter.toLowerCase().trim());

      return matchesSearch && matchesAirport && matchesName;
    });
  }, [
    accessList,
    searchQuery,
    airportFilter,
    nameFilter,
    airportsMap,
    badgesMap,
    badgeOwnerMap,
  ]);

  const handleSave = useCallback(
    async (formData: AccessDTO, editingId: number | null) => {
      if (editingId) {
        await updateAccess(editingId, formData);
      } else {
        await createAccess(formData);
      }
      await loadData();
    },
    [loadData]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Delete this access?")) return;
      await deleteAccess(id);
      await loadData();
    },
    [loadData]
  );

  return {
    loading,
    airports,
    badges,
    badgeOwnerMap,
    airportsMap,
    badgesMap,
    filteredAccesses,
    searchQuery,
    setSearchQuery,
    airportFilter,
    setAirportFilter,
    nameFilter,
    setNameFilter,
    handleSave,
    handleDelete,
  };
};