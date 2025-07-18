import React from "react";
import { Card, Row, Col } from "react-bootstrap";
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

const HomePage: React.FC = () => {
  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-semibold text-center">Welcome to Your Employee Portal</h2>
      <Row className="g-4 justify-content-center">
        {gridItems.map((item) => (
          <Col key={item.title} xs={12} sm={6} md={4} lg={3}>
            <Link to={item.link} style={{ textDecoration: "none" }}>
              <Card className="h-100 shadow-sm border-0 hover-shadow transition">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center py-4">
                  <i className={`bi ${item.icon} mb-3`} style={{ fontSize: "2.5rem", color: "#0d6efd" }}></i>
                  <Card.Title className="fw-bold mb-2" style={{ color: "#222" }}>{item.title}</Card.Title>
                  <Card.Text className="text-muted small">{item.description}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;