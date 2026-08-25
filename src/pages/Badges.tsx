import React, { useEffect, useState } from "react";
import { Spinner, Pagination } from "react-bootstrap";
import { createBadge, fetchBadgeById } from "../api/apiBadge";
import type { UserDTO, BadgeDTO } from "../types";
import { useBadges } from "../hooks/useBadges";
import BadgeFilters from "../components/badge/BadgeFilters";
import BadgesTable from "../components/badge/BadgesTable";
import GenerateBadgeModal from "../components/badge/GenerateBadgeModal";
import BadgeDetailsModal from "../components/badge/BadgeDetailsModal";
import "./Badges.css";

const Badges: React.FC = () => {
  const {
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
  } = useBadges();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserDTO | null>(null);
  const [selectedBadgeByUser, setSelectedBadgeByUser] = useState<Record<number, number | "">>({});
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = (location.state || {}) as { openGenerateModalForUser?: number };
    if (state.openGenerateModalForUser != null && employees.length) {
      const user = employees.find((e) => e.id === state.openGenerateModalForUser);
      if (user) {
        openGenerateBadgeModal(user);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, employees, navigate, location.pathname]);

  const openGenerateBadgeModal = (employee: UserDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);
    setSelectedEmployee(employee);
    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      companyId: employee.companyId,
      status: "ACTIVE",
    });
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setSelectedEmployee(null);
    setBadgeData({});
  };

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !badgeData.code ||
      !badgeData.issuedDate ||
      !badgeData.expiryDate ||
      !selectedEmployee?.id ||
      !badgeData.companyId ||
      !badgeData.status
    ) {
      console.error("Incomplete badge data");
      return;
    }
    setSubmitting(true);
    try {
      await createBadge({
        code: badgeData.code,
        issuedDate: badgeData.issuedDate,
        expiryDate: badgeData.expiryDate,
        companyId: badgeData.companyId,
        userId: selectedEmployee.id,
        accessListIds: [],
        status: badgeData.status,
      });
      await reloadEmployees();
      closeGenerateModal();
    } catch (err) {
      console.error("Error creating badge:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openBadgeDetails = async (badgeId: number) => {
    try {
      const badge = await fetchBadgeById(badgeId);
      setBadgeDetails(badge);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching badge details:", err);
    }
  };

  const closeBadgeDetailsModal = () => {
    setShowDetailsModal(false);
    setBadgeDetails(null);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
              {page}
            </Pagination.Item>
          );
        })}
        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  let content;
  if (loading) {
    content = (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Chargement des collaborateurs...</p>
      </div>
    );
  } else if (filteredEmployees.length === 0) {
    content = (
      <div className="alert alert-light text-center border">
        Aucun collaborateur trouvé correspondant à votre recherche/filtre.
      </div>
    );
  } else {
    content = (
      <>
        <BadgesTable
          employees={paginatedEmployees}
          badges={badges}
          companies={companies}
          selectedBadgeByUser={selectedBadgeByUser}
          setSelectedBadgeByUser={setSelectedBadgeByUser}
          onViewDetails={openBadgeDetails}
          onGenerate={openGenerateBadgeModal}
          employeeAllBadgesExpired={employeeAllBadgesExpired}
        />
        {renderPagination()}
      </>
    );
  }

  return (
    <div className="container py-4">
      <BadgeFilters
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showExpiredOnly={showExpiredOnly}
        setShowExpiredOnly={setShowExpiredOnly}
        companies={companies}
      />
      {content}
      <GenerateBadgeModal
        show={showGenerateModal}
        onHide={closeGenerateModal}
        badgeData={badgeData}
        setBadgeData={setBadgeData}
        companies={companies}
        onSubmit={handleBadgeSubmit}
        submitting={submitting}
      />
      <BadgeDetailsModal
        show={showDetailsModal}
        onHide={closeBadgeDetailsModal}
        badgeDetails={badgeDetails}
        employees={employees}
        companies={companies}
      />
    </div>
  );
};

export default Badges;


