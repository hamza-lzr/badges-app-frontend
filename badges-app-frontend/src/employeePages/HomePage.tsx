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

// RAM Brand Colors
const colors = {
  primary: "#C4122F",    // RAM Red
  secondary: "#D4AF37",  // Gold accent
  dark: "#333333",       // Dark grey
  light: "#FFFFFF",      // White
  lightGrey: "#F8F9FA",  // Background grey
  textGrey: "#666666"    // Text grey
};

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <div 
        className="position-relative"
        style={{
          background: colors.lightGrey,
          padding: "4rem 0",
          marginBottom: "2rem",
        }}
      >
        <Container className="text-center">
          <img 
            src="/Logo_Royal_Air_Maroc.svg.png" 
            alt="RAM Logo" 
            className="mb-4" 
            height="50"
          />
          <h1 className="display-5 fw-bold mb-3" style={{ color: colors.dark }}>
            Welcome to Your Employee Portal
          </h1>
          <p className="lead mb-0" style={{ color: colors.textGrey }}>
            Access and manage your professional credentials with Royal Air Maroc
          </p>
        </Container>
      </div>

      {/* Grid of Features */}
      <Container className="pb-5">
        <Row className="g-4">
          {gridItems.map((item) => (
            <Col key={item.title} xs={12} sm={6} md={6} lg={4}>
              <Link
                to={item.link}
                style={{ textDecoration: "none" }}
                className="d-block h-100"
              >
                <Card
                  className="h-100 border-0 shadow-sm rounded-4 feature-card"
                  style={{ background: colors.light }}
                >
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                    <div className="icon-container mb-3">
                      <i className={`bi ${item.icon}`}></i>
                    </div>

                    <Card.Title className="h5 mb-3" style={{ color: colors.dark }}>
                      {item.title}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

          body {
            font-family: 'Roboto', sans-serif;
          }

          .feature-card {
            background: ${colors.light};
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
          }

          .icon-container {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: ${colors.lightGrey};
            transition: all 0.3s ease;
          }

          .icon-container i {
            font-size: 1.8rem;
            color: ${colors.primary};
            transition: all 0.3s ease;
          }

          .feature-card:hover .icon-container {
            background: ${colors.primary};
          }

          .feature-card:hover .icon-container i {
            color: ${colors.light};
          }
          
          .feature-card:hover .card-title {
            color: ${colors.primary} !important;
          }

          h1, h5 {
            font-weight: 700;
          }

          p, .card-text {
            font-weight: 400;
          }
        `}
      </style>
    </>
  );
};

export default HomePage;
