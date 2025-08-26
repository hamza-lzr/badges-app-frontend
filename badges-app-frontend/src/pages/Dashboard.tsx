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
  MdPeople,
  MdWork,
  MdLocationOn,
  MdBusiness,
  MdBadge,
  MdLock,
  MdNotifications,
  MdFlight,
} from "react-icons/md";
import { FaSuitcase } from "react-icons/fa";
import { motion } from "framer-motion";

import { fetchEmployees } from "../api/ApiEmployee";
import { fetchBadges } from "../api/apiBadge";
import { fetchAirports } from "../api/apiAirport";
import { fetchCompanies } from "../api/apiCompany";
import { fetchRequests } from "../api/apiRequest";

import type { Request, ReqStatus } from "../types";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [expiredBadges, setExpiredBadges] = useState(0);
  const [totalAirports, setTotalAirports] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [employeeMap, setEmployeeMap] = useState<Record<number, string>>({});

  const adminLinks = [
    {
      to: "/admin/employees",
      label: "Employees",
      icon: <MdPeople size={32} />,
    },
    { to: "/admin/requests", label: "Demandes", icon: <MdWork size={32} /> },
    { to: "/admin/airports", label: "Aéroports", icon: <MdFlight size={32} /> },
    {
      to: "/admin/companies",
      label: "Entreprises",
      icon: <MdBusiness size={32} />,
    },
    { to: "/admin/badges", label: "Badges", icon: <MdBadge size={32} /> },
    {
      to: "/admin/locations",
      label: "Régions",
      icon: <MdLocationOn size={32} />,
    },
    { to: "/admin/accesses", label: "Accès", icon: <MdLock size={32} /> },
    {
      to: "/admin/notifications",
      label: "Mes notifications",
      icon: <MdNotifications size={32} />,
    },
    { to: "/admin/conges", label: "Congés", icon: <FaSuitcase size={32} /> }, // Assuming MdWork for Congés
  ];

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

      const empMap: Record<number, string> = {};
      emps.forEach((e) => {
        empMap[e.id] = `${e.firstName} ${e.lastName}`;
      });
      setEmployeeMap(empMap);

      setTotalEmployees(emps.length);
      setActiveUsers(emps.filter((e) => e.status === "ACTIVE").length);
      setTotalBadges(badges.length);
      setExpiredBadges(
        badges.filter((b) => new Date(b.expiryDate) < new Date()).length
      );
      setTotalAirports(airports.length);
      setTotalCompanies(companies.length);

      const recent = [...reqs]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentRequests(recent);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
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

  return (
    <div className="dashboard-bg">
      <Container fluid className="text-center py-3">
        <motion.h1
          className="text-center fw-bold display-6 mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          E-badges Back-office
        </motion.h1>

        {/* ==== Navigation Cards ==== */}
        <Container style={{ maxWidth: "1200px" }} className="mx-auto">
          <Row className="row-cols-3 row-cols-md-3 g-4 mb-5">
            {adminLinks.map(({ to, label, icon }, i) => (
              <Col key={to}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card onClick={() => navigate(to)} className="dashboard-card">
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="dashboard-icon mb-3"
                      >
                        {icon}
                      </motion.div>
                      <h5 className="fw-bold text-dark text-center">{label}</h5>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* ==== Statistics Title ==== */}
            <motion.h2
              className="fw-bold text-start mb-4 px-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Statistiques
            </motion.h2>

            {/* ==== Statistics Cards ==== */}
            <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mb-5">
              <StatCard
                title="Collaborateurs"
                value={totalEmployees}
                icon={<MdPeople />}
                delay={0.1}
              />
              <StatCard
                title="Collaborateurs actifs"
                value={activeUsers}
                icon={<MdPeople />}
                delay={0.2}
              />
              <StatCard
                title="Badges"
                value={totalBadges}
                icon={<MdBadge />}
                delay={0.3}
              />
              <StatCard
                title="Badges expirés"
                value={expiredBadges}
                icon={<MdBadge />}
                delay={0.4}
              />
              <StatCard
                title="Aéroports"
                value={totalAirports}
                icon={<MdFlight />}
                delay={0.5}
              />
              <StatCard
                title="Entreprises"
                value={totalCompanies}
                icon={<MdBusiness />}
                delay={0.6}
              />
            </Row>

            {/* ==== Recent Requests ==== */}
            <Card className="shadow-sm border-0">
              <Card.Header className="card-header">Demandes récentes</Card.Header>
              <Card.Body className="p-0">
                {requestsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="secondary" />
                  </div>
                ) : recentRequests.length === 0 ? (
                  <p className="p-4 text-center text-muted">
                    Aucune demande récente.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <Table hover bordered className="mb-0">
                      <thead>
                        <tr>
                          <th>Collaborateur</th>
                          <th>Type</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRequests.map((r) => (
                          <tr key={r.id}>
                            <td>{employeeMap[r.userId]}</td>
                            <td>{r.reqType.replace("_", " ")}</td>
                            <td>
                              <Badge
                                pill
                                className={getStatusClass(r.reqStatus)}
                              >
                                {r.reqStatus}
                              </Badge>
                            </td>
                            <td>
                              {new Date(r.createdAt).toLocaleString([], {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
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
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  delay?: number;
}> = ({ title, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.03 }}
  >
    <Card className="stat-card h-100">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 stat-icon">{icon}</div>
        <div>
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

export default Dashboard;
