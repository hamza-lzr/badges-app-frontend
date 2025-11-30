
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEmployees } from "../api/ApiEmployee";
import { fetchBadges } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import type { UserDTO, BadgeDTO } from "../types";

type BadgeMap = Record<number, BadgeDTO>;

export const useBadges = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<BadgeMap>({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<number | "">("");
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [companyData, badgeData, employeeData] = await Promise.all([
          fetchCompanies(),
          fetchBadges(),
          fetchEmployees(),
        ]);

        const companyMap = Object.fromEntries(
          companyData.map((c) => [c.id!, c.name])
        );
        setCompanies(companyMap);

        const badgeMap: BadgeMap = {};
        badgeData.forEach((b) => {
          if (b.id) badgeMap[b.id] = b;
        });
        setBadges(badgeMap);

        setEmployees(employeeData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const reloadEmployees = async () => {
    try {
        setLoading(true);
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
  }

  const employeeHasExpiredBadge = (emp: UserDTO) => {
    return emp.badgesIds.some((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });
  };

  const employeeAllBadgesExpired = (emp: UserDTO): boolean =>
    emp.badgesIds.every((badgeId) => {
      const badge = badges[badgeId];
      if (!badge) return false;
      return new Date(badge.expiryDate) < new Date();
    });

  const filteredEmployees = employees.filter((emp) => {
    const companyName = companies[emp.companyId]?.toLowerCase() || "";
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matricule = emp.matricule?.toLowerCase() || "";
    const badgeCodes = emp.badgesIds
      .map((id) => badges[id]?.code?.toLowerCase() || "")
      .join(" ");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      matricule.includes(query) ||
      companyName.includes(query) ||
      badgeCodes.includes(query);

    const matchesCompany =
      companyFilter === "" || emp.companyId === companyFilter;

    const matchesExpired = !showExpiredOnly || employeeHasExpiredBadge(emp);

    return matchesSearch && matchesCompany && matchesExpired;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    employees,
    companies,
    badges,
    loading,
    searchQuery,
    setSearchQuery,
    companyFilter,
    setCompanyFilter,
    showExpiredOnly,
    setShowExpiredOnly,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedEmployees,
    filteredEmployees,
    employeeAllBadgesExpired,
    reloadEmployees,
    navigate,
    location,
  };
};
