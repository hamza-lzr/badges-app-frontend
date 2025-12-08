import { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
} from "../api/apiNotification";
import { fetchEmployees } from "../api/ApiEmployee";
import { fetchCompanies } from "../api/apiCompany";

import type { CompanyDTO, NotificationDTO, UserDTO } from "../types";

const ITEMS_PER_PAGE = 10;

// --- Helper Function: Extracts Complexity ---
// Moving this outside the hook reduces the hook's complexity score immediately.
const shouldIncludeNotification = (
  n: NotificationDTO,
  filters: {
    user: string;
    company: string;
    status: "all" | "read" | "unread";
    from: string;
    to: string;
  },
  employees: UserDTO[],
  companies: CompanyDTO[]
): boolean => {
  // 1. Check Status
  if (filters.status === "read" && !n.read) return false;
  if (filters.status === "unread" && n.read) return false;

  // 2. Check Date
  const date = new Date(n.createdAt).toISOString().slice(0, 10);
  if (filters.from && date < filters.from) return false;
  if (filters.to && date > filters.to) return false;

  // 3. Resolve User (optimization: find once)
  const user = employees.find((e) => e.id === n.userId);

  // 4. Check User Filter
  if (filters.user && user) {
    const target =
      `${user.firstName} ${user.lastName} ${user.matricule}`.toLowerCase();
    if (!target.includes(filters.user.toLowerCase())) return false;
  }

  // 5. Check Company Filter
  if (filters.company && user) {
    const company = companies.find((c) => c.id === user.companyId);
    if (
      !company ||
      !company.name.toLowerCase().includes(filters.company.toLowerCase())
    ) {
      return false;
    }
  }

  return true;
};

export const useNotificationsData = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    user: "",
    company: "",
    status: "all" as "all" | "read" | "unread",
    from: "",
    to: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [notif, emp, comp] = await Promise.all([
        fetchNotifications(),
        fetchEmployees(),
        fetchCompanies(),
      ]);
      setNotifications(notif);
      setEmployees(emp);
      setCompanies(comp);
    } catch (error) {
      console.error("Error loading notifications data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => {
        const company =
          companies.find((c) => c.id === emp.companyId)?.name ?? "";
        return {
          id: emp.id!,
          label: `${emp.firstName} ${emp.lastName} (${emp.matricule})${
            company ? " • " + company : ""
          }`,
        };
      }),
    [employees, companies]
  );

  // --- REFACTORED: Complexity drastically reduced here ---
  const filtered = useMemo(() => {
    return notifications
      .filter((n) =>
        shouldIncludeNotification(n, filters, employees, companies)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [notifications, filters, employees, companies]);

  const paginated = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleDelete = useCallback(
    async (id?: number) => {
      if (!id || !window.confirm("Delete this notification?")) return;
      await deleteNotification(id);
      loadData();
    },
    [loadData]
  );

  const handleMarkAsRead = useCallback(
    async (id?: number) => {
      if (!id) return;
      await markNotificationAsRead(id);
      loadData();
    },
    [loadData]
  );

  const handleCreate = useCallback(
    async (newNotification: Partial<NotificationDTO>) => {
      if (!newNotification.message || !newNotification.userId) return;
      await createNotification(newNotification as NotificationDTO);
      loadData();
    },
    [loadData]
  );

  return {
    notifications,
    employees,
    companies,
    loading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    paginated,
    totalPages,
    employeeOptions,
    handleCreate,
    handleDelete,
    handleMarkAsRead,
    reloadNotifications: loadData,
  };
};