import { useState, useEffect, useMemo, useCallback } from "react";
import type { CongeDTO, UserDTO } from "../types";
import { fetchMyConges, createConge } from "../api/apiConge";
import { fetchMyProfile } from "../api/ApiEmployee";

const CONGES_PER_PAGE = 9;

export const useConges = () => {
  const [conges, setConges] = useState<CongeDTO[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadConges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyConges();
      setConges(data || []);
    } catch (err) {
      console.error("Error loading congés:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const profile: UserDTO = await fetchMyProfile();
        setUserId(profile.id);
        await loadConges();
      } catch (err) {
        console.error("Error loading profile or congés", err);
      }
    };
    init();
  }, [loadConges]);
  
  const handleCreateConge = useCallback(async (newCongeData: Omit<CongeDTO, 'id' | 'status' | 'userId' | 'createdAt'>) => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const payload: Omit<CongeDTO, 'id'> = {
        ...newCongeData,
        userId: userId,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      await createConge(payload);
      await loadConges();
    } catch (err) {
      console.error("Error creating conge:", err);
      // Optionally, re-throw or handle the error to show a toast
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [userId, loadConges]);

  const filteredSortedConges = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return (conges || [])
      .filter((c) => {
        const desc = c.description?.toLowerCase() || "";
        const dateRange = `${c.startDate ?? ""} ${c.endDate ?? ""}`.toLowerCase();
        const searchMatch = desc.includes(term) || dateRange.includes(term);
        const statusMatch = statusFilter === "all" || c.status === statusFilter;
        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        const aKey = a.createdAt || a.startDate || "";
        const bKey = b.createdAt || b.startDate || "";
        return new Date(bKey).getTime() - new Date(aKey).getTime();
      });
  }, [conges, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSortedConges.length / CONGES_PER_PAGE) || 1;
  const paginatedConges = filteredSortedConges.slice(
    (currentPage - 1) * CONGES_PER_PAGE,
    currentPage * CONGES_PER_PAGE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return {
    loading,
    submitting,
    filteredSortedConges,
    paginatedConges,
    totalPages,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    handleCreateConge,
  };
};
