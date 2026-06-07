# CardAggregator

A full-stack financial dashboard that aggregates credit card transactions across multiple accounts using the Plaid API. Users can securely link bank accounts, view spending by category, and get a complete summary of their finances in one place.


## Tech Stack

**Backend**
- Java 17, Spring Boot 3.5
- Spring Security with JWT authentication
- PostgreSQL (via Docker)
- Plaid Java SDK (v40.2.0) — sandbox environment
- JUnit 5 + Mockito — unit testing
- GitHub Actions — CI/CD

**Frontend**
- React 18 with TypeScript
- Vite
- Axios
- Recharts — data visualization
- React Router DOM
- Plaid Link React

## Architecture

## Features

- JWT authentication — secure register and login with BCrypt password hashing
- Multi-account linking — connect multiple bank accounts via Plaid Link
- Transaction aggregation — fetch and store transactions from all linked accounts
- Spending insights — pie chart by category, bar chart by day, summary cards
- Summary API — total spent, transaction count, highest spending category, spending by card
- CI pipeline — GitHub Actions runs 9 unit tests on every push to main

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker Desktop
- Node.js 18+
- Plaid sandbox account (free at dashboard.plaid.com)

### Backend Setup

1. Clone the repo
```bash
git clone https://github.com/Juwonaman/cardsync
cd cardaggregator/backend
```

2. Set environment variables
```bash
export PLAID_CLIENT_ID=your_client_id
export PLAID_SECRET=your_sandbox_secret
```

3. Start PostgreSQL
```bash
docker compose up -d
```

4. Run the backend
```bash
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Test Credentials (Plaid Sandbox)
- Username: `user_good`
- Password: `pass_good`
- Bank: First Platypus Bank

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get JWT | No |
| POST | /api/plaid/link-token | Get Plaid link token | Yes |
| POST | /api/plaid/exchange-token | Exchange public token | Yes |
| POST | /api/transactions/sync | Sync transactions from Plaid | Yes |
| GET | /api/transactions | Get all stored transactions | Yes |
| GET | /api/summary | Get spending summary | Yes |

## Running Tests

```bash
cd backend
mvn test
```

9 unit tests covering auth service and summary service.

## CI/CD

GitHub Actions automatically runs all tests on every push to main.
