import axios from "axios";
import { keycloakEndpoint, runtimeConfig } from "../config/runtime";

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export const authenticate = async (username: string, password: string) => {
  const response = await axios.post<KeycloakTokenResponse>(
    keycloakEndpoint("token"),
    new URLSearchParams({
      client_id: runtimeConfig.keycloakClientId,
      grant_type: "password",
      username,
      password,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  return response.data;
};

export const storeSession = (tokens: KeycloakTokenResponse) => {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
};

export const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const endSession = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    if (refreshToken) {
      await axios.post(
        keycloakEndpoint("logout"),
        new URLSearchParams({
          client_id: runtimeConfig.keycloakClientId,
          refresh_token: refreshToken,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
    }
  } finally {
    clearSession();
  }
};
