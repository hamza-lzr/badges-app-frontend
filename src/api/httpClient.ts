import axios from "axios";
import { clearSession } from "../auth/keycloak";
import { runtimeConfig } from "../config/runtime";

export const createApiClient = (resourcePath: string) => {
  const normalizedPath = resourcePath.replace(/^\/+|\/+$/g, "");
  const client = axios.create({
    baseURL: `${runtimeConfig.apiBaseUrl}/${normalizedPath}`,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSession();
        const loginPath = window.location.pathname.startsWith("/employee")
          ? "/employee/login"
          : "/login";

        if (window.location.pathname !== loginPath) {
          window.location.assign(loginPath);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};
