import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  BiUser,
  BiListUl,
  BiBuilding,
  BiMap,
  BiLockAlt,
  BiBell,
  BiCard,
} from "react-icons/bi";
import { BsAirplane} from "react-icons/bs";

import { fetchEmployees } from "../api/ApiEmployee";
import { fetchBadges } from "../api/apiBadge";
import { fetchAirports } from "../api/apiAirport";
import { fetchCompanies } from "../api/apiCompany";
import { fetchRequests } from "../api/apiRequest";
import type { Request, ReqStatus } from "../types";



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // stats
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [expiredBadges, setExpiredBadges] = useState(0);
  const [totalAirports, setTotalAirports] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // recent requests
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // maps for lookups
  const [employeeMap, setEmployeeMap] = useState<Record<number, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [companyMap, setCompanyMap] = useState<Record<number, string>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [emps, badges, airports, companies, reqs] = await Promise.all([
        fetchEmployees(),
        fetchBadges(),
        fetchAirports(),
        fetchCompanies(),
        fetchRequests(),
      ]);

      // employee & company maps
      const empMap: Record<number, string> = {};
      emps.forEach((e) => {
        empMap[e.id] = `${e.firstName} ${e.lastName}`;
      });
      setEmployeeMap(empMap);

      const compMap: Record<number, string> = {};
      companies.forEach((c) => {
        if (c.id) compMap[c.id] = c.name;
      });
      setCompanyMap(compMap);

      // stats
      setTotalEmployees(emps.length);
      setActiveUsers(emps.filter((e) => e.status === "ACTIVE").length);
      setTotalBadges(badges.length);
      setExpiredBadges(
        badges.filter((b) => new Date(b.expiryDate) < new Date()).length
      );
      setTotalAirports(airports.length);
      setTotalCompanies(companies.length);

      // recent requests
      setRequestsLoading(true);
      const recent = [...reqs]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentRequests(recent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRequestsLoading(false);
    }
  };

  const getStatusClass = (status: ReqStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-dark";
      case "APPROVED":
        return "bg-success";
      case "REJECTED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const adminLinks = [
    { to: "/admin/employees",   label: "Employees",      icon: <BiUser /> },
    { to: "/admin/requests",    label: "Requests",       icon: <BiListUl /> },
    { to: "/admin/airports",    label: "Airports",       icon: <BsAirplane /> },
    { to: "/admin/companies",   label: "Companies",      icon: <BiBuilding /> },
    { to: "/admin/badges",      label: "Badges",         icon: <BiCard /> },
    { to: "/admin/locations",   label: "Locations",      icon: <BiMap /> },
    { to: "/admin/accesses",    label: "Accesses",       icon: <BiLockAlt /> },
    { to: "/admin/notifications", label: "Notifications", icon: <BiBell /> },
  ];

  return (
    <Container fluid className="py-5">
      <h1 className="text-center mb-5">Admin Dashboard</h1>

      {/*==== 4-column grid of cards ====*/}
      <Row className="row-cols-1 row-cols-md-4 g-4 mb-5">
        {adminLinks.map(({ to, label, icon }) => (
          <Col key={to}>
            <Card
              onClick={() => navigate(to)}
              className="h-100 shadow-sm border-0 hover-shadow cursor-pointer"
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="display-4 text-primary mb-3">{icon}</div>
                <h5>{label}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/*==== Statistics Section ====*/}
          <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mb-5">
            <StatCard title="Employees"       value={totalEmployees} icon={<BiUser />} />
            <StatCard title="Active Users"     value={activeUsers}    icon={<BiUser />} />
            <StatCard title="Badges"           value={totalBadges}    icon={<BiCard />} />
            <StatCard title="Expired Badges"   value={expiredBadges}  icon={<BiCard />} />
            <StatCard title="Airports"         value={totalAirports}  icon={<BsAirplane />} />
            <StatCard title="Companies"        value={totalCompanies} icon={<BiBuilding />} />
          </Row>

          {/*==== Recent Requests ====*/}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white">
              Recent Requests
            </Card.Header>
            <Card.Body className="p-0">
              {requestsLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="secondary" />
                </div>
              ) : recentRequests.length === 0 ? (
                <p className="p-4 text-center text-muted">
                  No recent requests.
                </p>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{employeeMap[r.userId]}</td>
                          <td>{r.reqType.replace("_", " ")}</td>
                          <td>
                            <Badge pill className={getStatusClass(r.reqStatus)}>
                              {r.reqStatus}
                            </Badge>
                          </td>
                          <td>
                            {new Date(r.createdAt).toLocaleString([], {
                              day:   "2-digit",
                              month: "2-digit",
                              year:  "numeric",
                              hour:   "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card className="shadow-sm border-0 h-100">
    <Card.Body className="d-flex align-items-center">
      <div className="me-3 display-4 text-primary">{icon}</div>
      <div>
        <h6 className="text-muted mb-1">{title}</h6>
        <h3 className="fw-bold">{value}</h3>
      </div>
    </Card.Body>
  </Card>
);

export default Dashboard;
