import React, { useEffect, useState } from "react";
import { Card, Spinner, Button, Row, Col, Badge, Container } from "react-bootstrap";
import { fetchMyProfile } from "../api/ApiEmployee";
import { fetchCompanyById } from "../api/apiCompany";
import type { UserDTO } from "../types";
import { useNavigate } from "react-router-dom";

const MyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchMyProfile();
        setProfile(data);

        if (data.companyId) {
          const company = await fetchCompanyById(data.companyId);
          setCompanyName(company.name);
        } else {
          setCompanyName("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-3">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container text-center mt-4">
        <p className="text-muted">Could not load your profile. Please try again later.</p>
      </div>
    );
  }

  const { firstName, lastName, matricule, email, phone, role, status, badgesIds } = profile;

  return (
    <Container className="py-5" style={{ maxWidth: "850px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#333333" }}>My Profile</h1>
        <p className="text-muted">Manage your personal information and credentials</p>
      </div>

      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="px-4 py-4">
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: 72,
                height: 72,
                backgroundColor: "#f8f9fa",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#495057",
              }}
            >
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </div>
            <div>
              <h5 className="mb-1" style={{ color: "#333333" }}>{firstName} {lastName}</h5>
              <small className="text-muted">Matricule: {matricule}</small>
              <div className="mt-2">
                <Badge bg={role === "EMPLOYEE" ? "secondary" : "primary"} className="me-2">
                  {role}
                </Badge>
                <Badge bg={status === "ACTIVE" ? "success" : "danger"}>
                  {status}
                </Badge>
              </div>
            </div>
          </div>

          <hr className="my-3" />

          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Email</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>{email}</div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Phone</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>{phone}</div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Company</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>{companyName}</div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Linked Badges</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>{badgesIds?.length ?? 0} badge(s)</div>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={() => navigate("/employee/requests?type=profile_update")}
            >
              Request Profile Update
            </Button>
          </div>
        </Card.Body>
      </Card>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          h1, h5 {
            font-weight: 700;
          }

          p, .card-text {
            font-weight: 400;
          }

          .rounded-pill {
            border-radius: 50px;
          }
        `}
      </style>
    </Container>
  );
};

export default MyProfilePage;
