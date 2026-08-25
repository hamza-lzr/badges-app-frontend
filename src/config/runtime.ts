const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const runtimeConfig = {
  apiBaseUrl: withoutTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  ),
  keycloakBaseUrl: withoutTrailingSlash(
    import.meta.env.VITE_KEYCLOAK_BASE_URL ?? "http://localhost:8081",
  ),
  keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM ?? "ram",
  keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "ram-badges",
} as const;

export const keycloakEndpoint = (action: "token" | "logout") =>
  `${runtimeConfig.keycloakBaseUrl}/realms/${encodeURIComponent(
    runtimeConfig.keycloakRealm,
  )}/protocol/openid-connect/${action}`;
