import React, { useEffect, useState } from "react";
import {
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Badge,
  Container,
  Modal,
  Form,
} from "react-bootstrap";
import { fetchMyProfile, changeMyPassword } from "../api/ApiEmployee";
import { fetchCompanyById } from "../api/apiCompany";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { UserDTO } from "../types";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ⬅️ au début du fichier

const MyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne sont pas identiques");
      return;
    }

    setChanging(true);

    try {
      await changeMyPassword(newPassword);
      toast.success("Le mot de passe a été mis à jour avec succès.");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message || "Error");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-3">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container text-center mt-4">
        <p className="text-muted">
          Impossible de charger votre profil. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    matricule,
    email,
    phone,
    role,
    status,
    badgesIds,
  } = profile;

  return (
    <Container className="py-5" style={{ maxWidth: "850px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#333333" }}>
          Mon Profil
        </h1>
        <p className="text-muted">
          Gérez vos informations personnelles et vos identifiants
        </p>
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
              <h5 className="mb-1" style={{ color: "#333333" }}>
                {firstName} {lastName}
              </h5>
              <small className="text-muted">Matricule: {matricule}</small>
              <div className="mt-2">
                <Badge
                  bg={role === "EMPLOYEE" ? "secondary" : "primary"}
                  className="me-2"
                >
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
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {email}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Téléphone</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {phone}
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Entreprise</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {companyName}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Badges Associés</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {badgesIds?.length ?? 0} badge(s)
              </div>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 py-2 shadow-sm me-3"
              onClick={() => navigate("/employee/requests?type=profile_update")}
            >
              Demander une mise à jour du profil
            </Button>
            <Button
              variant="outline-danger"
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Changer le mot de passe
            </Button>
          </div>

          {/* Password Change Modal */}
          <Modal
            show={showPasswordModal}
            onHide={() => setShowPasswordModal(false)}
            centered
            backdrop="static"
            className="rounded-4 shadow-sm"
          >
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold" style={{ color: "#333333" }}>
                Changer le mot de passe
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                    Nouveau Mot de Passe
                  </Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez votre nouveau mot de passe"
                    required
                    className="shadow-sm rounded-4 pe-5"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "38px",
                      right: "15px",
                      cursor: "pointer",
                      color: "#6c757d",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                    Confirmer le Mot de Passe
                  </Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                    className="shadow-sm rounded-4 pe-5"
                  />
                </Form.Group>

                <div className="text-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPasswordModal(false)}
                    className="rounded-pill shadow-sm me-2"
                    disabled={changing}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    className="rounded-pill shadow-sm"
                    disabled={changing}
                  >
                    {changing ? "En cours de changement..." : "Changer le mot de passe"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
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

          .rounded-4 {
            border-radius: 1rem;
          }

          .hover-shadow:hover {
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </Container>
  );
};

export default MyProfilePage;
