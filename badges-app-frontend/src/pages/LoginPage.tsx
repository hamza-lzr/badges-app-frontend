import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { isAxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

/** === Keycloak types === */
interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}
interface KeycloakDecodedToken {
  preferred_username: string;
  realm_access?: { roles: string[] };
  exp: number;
  iat: number;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ramLogo = "../../ram.png";


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<KeycloakTokenResponse>(
        "http://localhost:8081/realms/ram/protocol/openid-connect/token",
        new URLSearchParams({
          client_id: "ram-badges",
          grant_type: "password",
          username,
          password,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token, refresh_token } = response.data;
      const decoded = jwtDecode<KeycloakDecodedToken>(access_token);
      const roles = decoded.realm_access?.roles || [];

      if (!roles.includes("ADMIN")) {
        setError("Vous n'êtes pas autorisé(e) à accéder au Back-Office Admin.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return;
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      navigate("/admin/dashboard");
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Login failed:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error:", err);
      }
      setError("Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-simple d-flex align-items-center justify-content-center min-vh-100">
            <div
        className="position-absolute top-50 start-50 translate-middle"
        aria-hidden="true"
        style={{
          width: 720,
          height: 720,
          backgroundImage: `url(${ramLogo})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          opacity: 0.06, // subtle watermark
          filter: "grayscale(100%)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: 420, borderRadius: 18 }}>
        {/* Icon */}
        <div className="text-center mb-3">
          <div className="icon-badge mx-auto">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center fw-bold mb-1" style={{ color: "#111827" }}>Admin login</h2>
        <p className="text-center text-muted mb-4">Back-Office • Royal Air Maroc</p>

        {/* Error */}
        {error && <div className="alert alert-danger py-2">{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label fw-semibold">E-mail / Nom d’utilisateur</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your matricule or email"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Mot de Passe</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-login w-100 fw-semibold"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Login"}
          </button>
        </form>
      </div>

      {/* Minimal styles to match your screenshot */}
      <style>{`
        .login-simple {
          background:
            radial-gradient(900px 500px at 15% 0%, #f6d6dc 0%, rgba(246,214,220,0) 60%),
            linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          position: relative;
        }
        .icon-badge {
          width: 56px; height: 56px;
          display: grid; place-items: center;
          border-radius: 999px;
          background: #b11e2f1a; /* RAM red, very light */
        }
        .icon-badge .bi { color: #b11e2f; font-size: 1.25rem; }

        .input-group-text {
          background-color: #f3f4f6;
          border-color: #e5e7eb;
        }
        .form-control:focus {
          border-color: #b11e2f;
          box-shadow: 0 0 0 .2rem rgba(177,30,47,.2);
        }
        .btn-login {
          padding: .65rem 1rem;
          border-radius: 999px;
          color: #fff;
          border: 0;
          background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%); /* clean blue */
          box-shadow: 0 10px 16px rgba(177,30,47,.15); /* soft RAM-red shadow like screenshot */
        }
        .btn-login:disabled { opacity: .85; }
      `}</style>
    </div>
  );
};

export default LoginPage;
