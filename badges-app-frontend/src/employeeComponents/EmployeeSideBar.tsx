import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const sidebarLinks = [
    { to: "/employee/home", icon: "bi-house", label: "Accueil" },
  { to: "/employee/profile", icon: "bi-person-circle", label: "Mon Profil" },
  { to: "/employee/badges", icon: "bi-credit-card-2-front", label: "Mes Badges" },
  { to: "/employee/accesses", icon: "bi-shield-check", label: "Mes Accès" },
  { to: "/employee/requests", icon: "bi-send", label: "Envoyer une Demande" },
  { to: "/employee/conges", icon: "bi-suitcase", label: "Mes Congés" },
    { to: "/employee/notifications", icon: "bi-bell", label: "Mes Notifications" },

];




const EmployeeSideBar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

    const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await axios.post(
          "http://localhost:8081/realms/ram/protocol/openid-connect/logout",
          new URLSearchParams({
            client_id: "ram-badges",
            refresh_token: refreshToken,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
      }
    } catch (err) {
      console.warn("Keycloak logout failed, clearing tokens anyway.", err);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/employee/login");
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);


  return (
    <div
      className={`d-flex flex-column`}
      style={{
        width: collapsed ? 70 : 240,
        minHeight: "100vh",
        background: "#212529", // ✅ Dark background
        color: "#ffffff",
        transition: "width 0.25s ease",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1030  ,
      }}
    >
      {/* ✅ Sidebar Header */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-4"
        style={{ borderColor: "#212529", background: "#212529", color: "#f5f5f5" }}
      >
        {!collapsed && (
          <span
            className="fw-bold"
            style={{ fontSize: "1.1rem", color: "#f5f5f5" }}
          >
            E-portail Employé
          </span>
        )}
        <Button
          variant="outline-primary"
          size="sm"
          className="border-0"
          style={{
            background: "transparent",
            color: "#ccc",
            padding: "4px",
          }}
          onClick={() => setCollapsed((c) => !c)}
        >
          <i
            className={`bi ${
              collapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"
            }`}
          ></i>
        </Button>
      </div>

      {/* ✅ Navigation Links */}
      <div className="flex-grow-1 d-flex flex-column">
        {sidebarLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`d-flex align-items-center px-3 py-3 sidebar-link ${
                active ? "active-link" : ""
              }`}
              style={{
                gap: collapsed ? 0 : 12,
                color: active ? "#fff" : "#bbb",
                fontWeight: active ? 600 : 400,
                fontSize: "0.95rem",
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 0.2s ease",
              }}
            >
              <i
                className={`bi ${link.icon}`}
                style={{
                  fontSize: "1.4rem",
                  color: active ? "#fff" : "#ccc",
                }}
              ></i>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>


        {/* Logout Button pinned at bottom */}
      <div className="p-3 border-top border-secondary mt-auto">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={() => setShowLogoutModal(true)}
          title="Déconnexion"
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && "Déconnexion"}
        </button>
      </div>

      {/* ✅ Extra styling */}
      <style>
        {`
          .sidebar-link:hover {
            background: rgba(255,255,255,0.05);
            color: #fff !important;
          }
          .active-link {
            background: rgba(255,255,255,0.1);
            border-left: 4px solid #b11e2f;
            color: #fff !important;
          }
        `}
      </style>
      <Modal
  show={showLogoutModal}
  onHide={() => setShowLogoutModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Confirmer la déconnexion</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    Êtes-vous sûr de vouloir vous déconnecter ?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
      Annuler
    </Button>
    <Button
      variant="danger"
      onClick={() => {
        setShowLogoutModal(false);
        handleLogout();
      }}
    >
      Déconnexion
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default EmployeeSideBar;
