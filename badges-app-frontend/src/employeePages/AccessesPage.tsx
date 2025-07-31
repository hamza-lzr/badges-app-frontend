import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Alert, Card, Button, Row, Col, Table } from "react-bootstrap";
import { fetchMyAccesses } from "../api/apiAccess";
import { fetchBadgesByEmployee } from "../api/apiBadge";
import { fetchAirports } from "../api/apiAirport";
import type { AccessDTO, BadgeDTO, AirportDTO } from "../types";

// ✅ View Modes: table or grid
type ViewMode = "table" | "grid";

const EmployeeAccessesPage: React.FC = () => {
  const [accesses, setAccesses] = useState<AccessDTO[]>([]);
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [airports, setAirports] = useState<AirportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const navigate = useNavigate();

  // ✅ Build quick lookup maps
  const badgeMap = badges.reduce<Record<number, string>>((acc, badge) => {
    if (badge.id !== undefined) acc[badge.id] = badge.code;
    return acc;
  }, {});

  const airportMap = airports.reduce<Record<number, string>>((acc, airport) => {
    if (airport.id !== undefined) acc[airport.id] = airport.name;
    return acc;
  }, {});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [accessRes, badgeRes, airportRes] = await Promise.all([
          fetchMyAccesses(),  // ✅ Only this employee's accesses
          fetchBadgesByEmployee(),    // ✅ Only this employee's badges
          fetchAirports(),    // ✅ All airports (public)
        ]);

        setAccesses(accessRes);
        setBadges(badgeRes);
        setAirports(airportRes);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  const AccessStatusBadge: React.FC<{ endDate: string }> = ({ endDate }) => {
    const expired = isExpired(endDate);
    const expiringSoon =
      !expired &&
      new Date(endDate).getTime() - new Date().getTime() <=
        7 * 24 * 60 * 60 * 1000; // 7 days

    if (expired) return <span className="badge bg-danger">Expired</span>;
    if (expiringSoon) return <span className="badge bg-warning text-dark">Expiring Soon</span>;
    return <span className="badge bg-success">Active</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your accesses...</p>
      </div>
    );
  }

  if (accesses.length === 0) {
    return (
      <Alert variant="info" className="text-center mt-5">
        You have no airport accesses.{" "}
        <Button
          variant="primary"
          onClick={() =>
            navigate("/employee/requests", {
              state: { openRequestModal: true, reqType: "AIRPORT_ACCESS" },
            })
          }
        >
          Request Access
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container py-4">
      {/* ✅ Header with view mode toggle */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#333333" }}>My Airport Accesses</h2>

        <div className="d-flex gap-2">
          {/* Table view icon */}
          <Button
            variant={viewMode === "table" ? "primary" : "outline-secondary"}
            size="sm"
            className="rounded-pill shadow-sm"
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <i className="bi bi-list" style={{ fontSize: "1.2rem" }}></i>
          </Button>

          {/* Grid view icon */}
          <Button
            variant={viewMode === "grid" ? "primary" : "outline-secondary"}
            size="sm"
            className="rounded-pill shadow-sm"
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <i className="bi bi-grid" style={{ fontSize: "1.2rem" }}></i>
          </Button>

          {/* Request Access Button */}
          <Button
            variant="success"
            size="sm"
            className="rounded-pill shadow-sm"
            onClick={() =>
              navigate("/employee/requests", {
                state: { openRequestModal: true, reqType: "AIRPORT_ACCESS" },
              })
            }
            title="Request New Access"
          >
            <i className="bi bi-plus-circle" style={{ fontSize: "1.2rem" }}></i> Request Access
          </Button>
        </div>
      </div>

      {/* ✅ TABLE VIEW */}
      {viewMode === "table" && (
        <Table bordered hover responsive className="shadow-sm align-middle rounded-4">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Access</th>
              <th>Badge</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accesses.map((access, idx) => {
              const airportName = airportMap[access.airportId] || `Airport #${access.airportId}`;
              const badgeCode = badgeMap[access.badgeId] || `Badge #${access.badgeId}`;

              return (
                <tr key={access.id} className="shadow-sm">
                  <td>{idx + 1}</td>
                  <td>Access to <strong>{airportName}</strong></td>
                  <td>{badgeCode}</td>
                  <td>{new Date(access.startDate).toLocaleDateString()}</td>
                  <td>{new Date(access.endDate).toLocaleDateString()}</td>
                  <td><AccessStatusBadge endDate={access.endDate} /></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* ✅ GRID VIEW */}
      {viewMode === "grid" && (
        <Row className="g-4">
          {accesses.map((access) => {
            const airportName = airportMap[access.airportId] || `Airport #${access.airportId}`;
            const badgeCode = badgeMap[access.badgeId] || `Badge #${access.badgeId}`;

            return (
              <Col key={access.id} xs={12} md={6} lg={4}>
                <Card className="shadow-sm h-100 border-0 hover-shadow rounded-4">
                  <Card.Body>
                    <Card.Title className="fw-bold text-primary">
                      Access to {airportName}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      Badge: {badgeCode}
                    </Card.Text>
                    <Card.Text>
                      <strong>Start:</strong> {new Date(access.startDate).toLocaleDateString()}<br />
                      <strong>End:</strong> {new Date(access.endDate).toLocaleDateString()}
                    </Card.Text>
                    <div>
                      <AccessStatusBadge endDate={access.endDate} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          h2 {
            font-weight: 700;
          }

          .rounded-pill {
            border-radius: 50px;
          }

          .hover-shadow:hover {
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeAccessesPage;
