import { useState, useEffect, useMemo, useCallback } from "react";
import type { CompanyDTO } from "../types";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../api/apiCompany";

type SortKey = "name" | "phone" | "address";

export const useCompanies = (pageSize = 5) => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSave = useCallback(
    async (
      companyData: Omit<CompanyDTO, "id">,
      id: number | null
    ): Promise<void> => {
      if (id) {
        await updateCompany(id, companyData);
      } else {
        await createCompany(companyData);
      }
      await loadCompanies();
    },
    [loadCompanies]
  );

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;
      try {
        await deleteCompany(id);
        await loadCompanies();
      } catch (error) {
        console.error(`Error deleting company ${id}:`, error);
      }
    },
    [loadCompanies]
  );

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.phone || "").includes(searchTerm)
      ),
    [companies, searchTerm]
  );

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      const aVal = (a[sortKey] || "").toString().toLowerCase();
      const bVal = (b[sortKey] || "").toString().toLowerCase();
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredCompanies, sortKey, sortAsc]);

  const totalPages = Math.ceil(sortedCompanies.length / pageSize);
  const paginatedCompanies = sortedCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return {
    loading,
    companies,
    paginatedCompanies,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    sortKey,
    sortAsc,
    handleSort,
    handleSave,
    handleDelete,
  };
};
