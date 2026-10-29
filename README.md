# Airport Badges — React Frontend

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)

Administrator and employee interfaces for the airport badge application I built during my 2025 internship at Royal Air Maroc.

[Spring Boot backend](https://github.com/hamza-lzr/badgesApp) · [My portfolio](https://lazaar.netlify.app/)

## Start with the code

- [Routes and lazy-loaded screens](src/App.tsx)
- [Shared API client and bearer-token handling](src/api/httpClient.ts)
- [Sign-in and sign-out](src/auth/keycloak.ts)
- [Administrator route guard](src/components/ProtectedRoute.tsx) and [employee route guard](src/employeeComponents/EmployeeProtectedRoute.tsx)

## Features

- Administrator dashboard and employee self-service portal
- Badge, airport-access, company, and location management
- Leave and service-request workflows
- In-app notifications and employee profile management
- Keycloak authentication with `ADMIN` and `EMPLOYEE` route protection
- Responsive UI built with Bootstrap and React Bootstrap

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- Axios
- Bootstrap and React Bootstrap
- Keycloak-compatible OpenID Connect endpoints
- ESLint

## Getting started

### Prerequisites

- Node.js 22.12 or newer, or Node.js 20.19+ on the Node 20 release line
- The backend API running locally
- A Keycloak realm and public client configured for the application

### Installation

```bash
git clone https://github.com/hamza-lzr/badges-app-frontend.git
cd badges-app-frontend
npm ci
cp .env.example .env
npm run dev
```

The development server is available at `http://localhost:5173` by default. In PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

| Interface | Entry point | Required realm role |
| --- | --- | --- |
| Administrator | `/login` → `/admin/dashboard` | `ADMIN` |
| Employee | `/employee/login` → `/employee/home` | `EMPLOYEE` |

## Configuration

Copy `.env.example` to `.env` and adjust these values for your environment:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Spring Boot API base URL |
| `VITE_KEYCLOAK_BASE_URL` | `http://localhost:8081` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | `ram` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENT_ID` | `ram-badges` | Public frontend client ID |

Only public browser configuration belongs in `VITE_*` variables. Never place client secrets or other private credentials in frontend environment files.

### Keycloak setup for this implementation

- The realm must match the API issuer: `ram` by default.
- The public frontend client is `ram-badges` by default. The current login form uses `grant_type=password`, so the client needs **Direct access grants** enabled for sign-in to work.
- The frontend origin (`http://localhost:5173` locally) must be allowed by Keycloak and by the backend's `CORS_ALLOWED_ORIGINS`.
- Assign `ADMIN` or `EMPLOYEE` as realm roles to local test users. The route guards read them from `realm_access.roles`.

The backend's admin client is separate. Configure its secret only on the server.

## Quality checks

```bash
npm run lint
npm run build
```

Run both checks together with:

```bash
npm run check
```

## Project structure

```text
src/
├── api/                 API modules and shared authenticated HTTP client
├── auth/                Keycloak session operations
├── components/          Administrator UI components
├── config/              Runtime environment configuration
├── employeeComponents/ Employee layout and navigation
├── employeePages/       Employee-facing screens
├── hooks/               Reusable data and state hooks
└── pages/               Administrator screens
```

## Related project

- [Spring Boot backend](https://github.com/hamza-lzr/badgesApp)
