# Capstone E-Commerce Backend

Node.js + Express + Prisma based backend for an e-commerce platform.

## Features
- REST API (`/api/v1/...`)
- JWT authentication + Google OAuth2
- RBAC (`ADMIN`, `SELLER`, `CUSTOMER`)
- HTTPS/TLS with self-signed certificate
- OWASP focused hardening: helmet, input sanitization (XSS), Prisma parameterized queries, rate limiting
- Swagger API docs (`/api-docs`)
- Logging and monitoring (Morgan + Winston, `/api/v1/metrics`)

## Quick Start
1. Install dependencies
```bash
npm install
```
2. Prepare env
```bash
copy .env.example .env
```
3. Push schema and seed
```bash
npm run db:push
npm run db:seed
```
4. Start server
```bash
npm start
```

## Important URLs
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5443`
- Swagger: `http://localhost:5000/api-docs`
- REST health: `http://localhost:5000/api/v1/health`
- Metrics: `http://localhost:5000/api/v1/metrics`

## Security Notes
- SQL Injection: Prisma ORM uses parameterized queries by default.
- XSS: all input is sanitized in middleware before route logic.
- CSRF: this API uses Bearer JWT (no cookie session by default), so CSRF impact is lower. If cookie auth is added later, add CSRF token middleware.
- Brute-force protection: auth endpoints are limited to 5 requests / 15 minutes.

## REST Endpoints (Core)
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET /auth/google`, `GET /auth/google/callback`
- Products: `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
- Categories: `GET /categories`, `POST /categories`
- Cart: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`
- Orders: `POST /orders`, `GET /orders`, `GET /orders/:id`
- Admin: `GET /admin/users`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`

## Project Docs
- Swagger: `/api-docs`
- Postman collection: `docs/Capstone.postman_collection.json`

## Deliverables Status
- Source code: done
- Prisma schema: done
- REST API: done
- Swagger docs: done
- Postman collection: done
- README: done
- HTTPS config: done
- `.env.example`: done
