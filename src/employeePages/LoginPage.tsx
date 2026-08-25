import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { authenticate, clearSession, storeSession } from "../auth/keycloak";

// ✅ Keycloak decoded token type
interface DecodedToken {
  preferred_username: string;
  realm_access?: { roles: string[] };
  exp: number;
}

const EmployeeLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // could be matricule or email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const ramLogo = "/ram.png";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tokens = await authenticate(username, password);
      const { access_token } = tokens;

      // ✅ Decode to check roles (optional)
      const decoded = jwtDecode<DecodedToken>(access_token);
      const roles = decoded.realm_access?.roles || [];

      if (roles.includes("EMPLOYEE")) {
        storeSession(tokens);
        navigate("/employee/home"); // ✅ Employee home page
      } else {
        setError("You are not authorized to access employee home");
        clearSession();
      }
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-bs-theme="light"
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={
        {
          "--bs-primary": "#C2002F",
          "--bs-primary-rgb": "194, 0, 47",
        } as React.CSSProperties
      }
    >
      {/* Background gradient */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(194,0,47,0.18), transparent 60%), radial-gradient(900px 600px at 100% 0%, rgba(218,0,47,0.12), transparent 55%), linear-gradient(135deg, #fff 0%, #fff 60%, #f8f8f9 100%)",
        }}
      />

      {/* RAM logo watermark */}
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

      {/* Card */}
      <div
        className="position-relative card border-0 shadow-lg rounded-4 p-4 p-md-5"
        style={{
          width: 440,
          maxWidth: "92vw",
          background: "#fff",
          borderTop: "5px solid #C2002F",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: 60,
              height: 60,
              background: "rgba(194,0,47,0.12)",
              color: "#C2002F",
            }}
          >
            {/* Lock icon instead of airplane */}
            <i
              className="bi bi-shield-lock-fill"
              style={{ fontSize: 26 }}
              aria-hidden="true"
            />
          </div>
          <h3 className="fw-bold mb-1" style={{ color: "#1f2937" }}>
            Login
          </h3>
          <div className="text-muted">Portail Employé - Royal Air Maroc</div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-start"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="needs-validation" noValidate>
          <div className="mb-3">
            <label className="form-label">E-mail / Nom d'utilisateur</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person" />
              </span>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your matricule or email"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Mot de Passe</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock" />
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
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill py-2"
            disabled={loading}
            aria-busy={loading}
            style={{ boxShadow: "0 8px 18px rgba(194,0,47,0.25)" }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Logging in…
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;
