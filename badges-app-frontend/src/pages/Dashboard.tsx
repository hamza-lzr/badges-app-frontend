import React, { useEffect, useState } from "react";
import { fetchEmployees } from "../api/ApiEmployee";
import { fetchBadges } from "../api/apiBadge";
import { fetchAirports } from "../api/apiAirport";
import { fetchCompanies } from "../api/apiCompany";
import { fetchRequests } from "../api/apiRequest";

import type {  Request } from "../types";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [expiredBadges, setExpiredBadges] = useState(0);
  const [totalAirports, setTotalAirports] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  const [recentRequests, setRecentRequests] = useState<Request[]>([]);

  const [employeeMap, setEmployeeMap] = useState<Record<number, string>>({});
  const [employeeCompanyMap, setEmployeeCompanyMap] = useState<Record<number, number>>({});
  const [companyMap, setCompanyMap] = useState<Record<number, string>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all in parallel
      const [employees, badges, airports, companies, requests] = await Promise.all([
        fetchEmployees(),
        fetchBadges(),
        fetchAirports(),
        fetchCompanies(),
        fetchRequests(),
      ]);

      // ✅ Build Employee Name map & Employee → Company map
      const empNameMap: Record<number, string> = {};
      const empCompanyMap: Record<number, number> = {};
      employees.forEach((emp) => {
        empNameMap[emp.id] = `${emp.firstName} ${emp.lastName}`;
        empCompanyMap[emp.id] = emp.companyId;
      });
      setEmployeeMap(empNameMap);
      setEmployeeCompanyMap(empCompanyMap);

      // ✅ Build Company name map
      const compMap: Record<number, string> = {};
      companies.forEach((c) => {
        if (c.id) compMap[c.id] = c.name;
      });
      setCompanyMap(compMap);

      // ✅ Stats
      setTotalEmployees(employees.length);
      setActiveUsers(employees.filter((e) => e.status === "ACTIVE").length);

      setTotalBadges(badges.length);
      setExpiredBadges(
        badges.filter((b) => new Date(b.expiryDate) < new Date()).length
      );

      setTotalAirports(airports.length);
      setTotalCompanies(companies.length);

      // ✅ Sort requests by createdAt desc and take last 5
      const recent = [...requests]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentRequests(recent);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeDisplay = (employeeId: number) => {
    const name = employeeMap[employeeId] || `User #${employeeId}`;
    const companyId = employeeCompanyMap[employeeId];
    const companyName = companyId ? companyMap[companyId] : undefined;
    return companyName ? `${name} (${companyName})` : name;
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          {/* ✅ Stats */}
          <div className="row g-4 mb-5">
            <StatCard title="Employees (All Companies)" value={totalEmployees} />
            <StatCard title="Badges Registered" value={totalBadges} />
            <StatCard title="Expired Badges" value={expiredBadges} />
            <StatCard title="Airports Registered" value={totalAirports} />
            <StatCard title="Companies Registered" value={totalCompanies} />
            <StatCard title="Active Users" value={activeUsers} />
          </div>

          {/* ✅ Recent Requests Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Requests</h5>

              {recentRequests.length === 0 ? (
                <p className="text-muted">No recent requests.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Request Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((req) => (
                        <tr key={req.id}>
                          <td>{getEmployeeDisplay(req.employeeId)}</td>
                          <td>{req.reqType}</td>
                          <td>
                            <span className={`badge ${getStatusClass(req.reqStatus)}`}>
                              {req.reqStatus}
                            </span>
                          </td>
                          <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ✅ Reusable Stat Card
const StatCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <div className="col-sm-6 col-lg-4">
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h6 className="text-muted">{title}</h6>
        <h3 className="fw-bold text-primary">{value}</h3>
      </div>
    </div>
  </div>
);

// ✅ Bootstrap badge colors for request status
const getStatusClass = (status: string) => {
  switch (status) {
    case "PENDING":
    case "Pending":
      return "bg-warning text-dark";
    case "APPROVED":
    case "Approved":
      return "bg-success";
    case "REJECTED":
    case "Rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

export default Dashboard;
