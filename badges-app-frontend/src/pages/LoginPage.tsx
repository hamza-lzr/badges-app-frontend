import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";


const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  resource_access?: {
    [clientId: string]: { roles: string[] };
  };
  exp: number;
  iat: number;
}

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

    // ✅ Decode token
    const decoded = jwtDecode<KeycloakDecodedToken>(access_token);
    console.log("Decoded token:", decoded);

    // ✅ Extract roles (realm-level)
    const roles = decoded.realm_access?.roles || [];
    console.log("Roles:", roles);

    // ✅ Save tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    // ✅ Check if ADMIN
    if (roles.includes("ADMIN")) {
      navigate("/admin/dashboard");
    } else {
      setError("You are not authorized to access admin dashboard");
      // Optionally logout immediately
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  } catch (err) {
    if (isAxiosError(err)) {
      console.error("Login failed:", err.response?.data || err.message);
    } else {
      console.error("Unexpected error:", err);
    }
    setError("Invalid username or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Admin Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in err &&
    (err as AxiosError).isAxiosError === true
  );
}

export default LoginPage;

