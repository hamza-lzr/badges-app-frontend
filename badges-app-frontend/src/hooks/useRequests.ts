import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Request, ReqStatus, UserDTO } from "../types";
import { fetchRequests, updateRequestStatus } from "../api/apiRequest";
import { fetchEmployees } from "../api/ApiEmployee";

const ITEMS_PER_PAGE = 10;

export const useRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReqStatus | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Navigation side-effect state
  const [approvedRequest, setApprovedRequest] = useState<Request | null>(null);
  
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, emps] = await Promise.all([fetchRequests(), fetchEmployees()]);
      setRequests(reqs);
      setEmployees(emps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigate after state change
  useEffect(() => {
    if (approvedRequest && approvedRequest.reqType !== "OTHER") {
      const emp = employees.find((e) => e.id === approvedRequest.userId);
      if (!emp) return;

      const matricule = emp.matricule;
      switch (approvedRequest.reqType) {
        case "PROFILE":
          navigate("/admin/employees", { state: { openEditModalForUser: approvedRequest.userId } });
          break;
        case "NEW_BADGE":
          navigate("/admin/badges", { state: { openGenerateModalForUser: approvedRequest.userId } });
          break;
        case "COMPANY":
          navigate("/admin/companies", { state: { highlightCompanyModal: true } });
          break;
        case "AIRPORT_ACCESS":
          navigate("/admin/accesses", { state: { matriculeFilter: matricule, openAddModal: false } });
          break;
      }
      setApprovedRequest(null); // Reset after navigation
    }
  }, [approvedRequest, employees, navigate]);

  const getEmployeeName = useCallback(
    (userId: number) => {
      const emp = employees.find((e) => e.id === userId);
      return emp ? `${emp.firstName} ${emp.lastName}` : `#${userId}`;
    },
    [employees]
  );

  const handleStatusChange = useCallback(
    async (req: Request, status: ReqStatus) => {
      setLoading(true);
      await updateRequestStatus(req.id, status);
      await loadData();
      if (status === "APPROVED") {
        setApprovedRequest(req); // Set state to trigger navigation effect
      }
    },
    [loadData]
  );

  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.description.toLowerCase().includes(q) ||
          getEmployeeName(r.userId).toLowerCase().includes(q);
        const matchesStatus = statusFilter === "ALL" || r.reqStatus === statusFilter;
        const created = new Date(r.createdAt);
        const fromOK = dateFrom ? created >= new Date(dateFrom) : true;
        const toOK = dateTo ? created <= new Date(dateTo) : true;
        return matchesSearch && matchesStatus && fromOK && toOK;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, searchQuery, statusFilter, dateFrom, dateTo, getEmployeeName]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const pageData = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    loading,
    employees,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,
    getEmployeeName,
    handleStatusChange,
    filteredRequests,
    totalPages,
    pageData,
  };
};
