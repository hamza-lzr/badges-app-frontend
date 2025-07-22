import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const gridItems = [
  {
    title: "My Profile",
    icon: "bi-person-circle",
    link: "/employee/profile",
    description: "View and edit your personal information.",
  },
  {
    title: "My Badges",
    icon: "bi-credit-card-2-front",
    link: "/employee/badges",
    description: "See your active and expired badges.",
  },
  {
    title: "My Accesses",
    icon: "bi-shield-check",
    link: "/employee/accesses",
    description: "Review your airport and area accesses.",
  },
  {
    title: "Notifications",
    icon: "bi-bell",
    link: "/employee/notifications",
    description: "Check your latest notifications.",
  },
  {
    title: "Send a Request",
    icon: "bi-send",
    link: "/employee/requests",
    description: "Submit a new request to the admin.",
  },
];

// ✅ Color palette
const accentRed = "#b11e2f"; // Subtle Royal Air Maroc accent
const softGrey = "#f8f9fa";  // Background grey
const textGrey = "#555";     // Neutral text color

const HomePage: React.FC = () => {
  return (
    <>
      {/* ✅ Minimalist Hero */}
      <div className="py-5 mb-4" style={{ background: softGrey }}>
        <Container className="text-center">
          <h1 className="fw-semibold mb-2" style={{ color: "#222" }}>
            Employee Portal
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "1.05rem" }}>
            Access your profile, badges, requests, and notifications in one place.
          </p>
        </Container>
      </div>

      {/* ✅ Grid of Features */}
      <Container className="pb-5">
        <Row className="g-4 justify-content-center">
          {gridItems.map((item) => (
            <Col key={item.title} xs={12} sm={6} md={4} lg={3}>
              <Link
                to={item.link}
                style={{ textDecoration: "none" }}
                className="d-block h-100"
              >
                <Card
                  className="h-100 border-0 shadow-sm rounded-4 hover-card"
                  style={{ background: "#fff" }}
                >
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    {/* ✅ Subtle icon with minimalist background */}
                    <div
                      className="d-flex align-items-center justify-content-center mb-3 rounded-circle"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: softGrey,
                      }}
                    >
                      <i
                        className={`bi ${item.icon}`}
                        style={{
                          fontSize: "1.8rem",
                          color: accentRed,
                        }}
                      ></i>
                    </div>

                    <Card.Title
                      className="fw-semibold mb-2"
                      style={{ color: "#222" }}
                    >
                      {item.title}
                    </Card.Title>
                    <Card.Text className="text-muted small" style={{ color: textGrey }}>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ✅ Hover animation */}
      <style>
        {`
          .hover-card {
            transition: all 0.25s ease;
          }
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.08);
          }
        `}
      </style>
    </>
  );
};

export default HomePage;
