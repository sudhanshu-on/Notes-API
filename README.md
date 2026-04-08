# Notes API

Backend API for managing notes.

Features
- JWT authentication
- bcrypt password hashing
- CRUD notes
- Pagination
- Input validation
- Rate limiting
- Centralized error handling

Tech Stack
- Node.js
- Express
- MongoDB
- React + Vite

Environment
- `TRUST_PROXY` (optional): Express trust proxy setting used for accurate client IP detection behind proxies/load balancers.
- Default behavior in this project: `false` in development, `1` in production.
- Override examples: `TRUST_PROXY=1`, `TRUST_PROXY=true`, `TRUST_PROXY=loopback`.
