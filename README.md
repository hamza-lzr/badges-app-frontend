# RAM E-Badges Frontend

A React and TypeScript portal for managing airport employee badges, access permissions, leave requests, companies, locations, and notifications. The application provides separate role-aware experiences for administrators and employees and integrates with Keycloak for authentication.

This project was built during a 2025 internship and has since been cleaned up as a portfolio project. Its Spring Boot API is available in the [badgesApp backend repository](https://github.com/hamza-lzr/badgesApp).

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

- Node.js 20.19 or newer
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

The development server is available at `http://localhost:5173` by default.

## Configuration

Copy `.env.example` to `.env` and adjust these values for your environment:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Spring Boot API base URL |
| `VITE_KEYCLOAK_BASE_URL` | `http://localhost:8081` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | `ram` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENT_ID` | `ram-badges` | Public frontend client ID |

Only public browser configuration belongs in `VITE_*` variables. Never place client secrets or other private credentials in frontend environment files.

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
