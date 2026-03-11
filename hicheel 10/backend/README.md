# Database Performance Optimization Lab (Node.js + MySQL + Redis)

This folder contains a minimal API and scripts to reproduce all tasks in the assignment.

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

Example:

```
DATABASE_URL="mysql://root:yourpassword@127.0.0.1:3306/school_management_redis_db"
REDIS_URL="redis://127.0.0.1:6379"
PORT=3000
```

3. Create tables

```bash
npm run setup
```

4. Seed 100,000 students (plus grades, courses, announcements)

```bash
npm run seed
```

Optional seed controls:

```
SEED_STUDENTS=100000
SEED_BATCH=1000
SEED_RESET=1
```

5. Start API

```bash
npm run start
```

## TASK 1: Slow Query Detection

1. Slow query

```sql
SELECT *
FROM students
WHERE email = "s100@mail.com";
```

2. Explain

```sql
EXPLAIN SELECT *
FROM students
WHERE email = "s100@mail.com";
```

Explain fields to discuss:
- `type`
- `rows`
- `key`

3. Add index and repeat

```sql
CREATE INDEX idx_email ON students(email);
EXPLAIN SELECT *
FROM students
WHERE email = "s100@mail.com";
```

## TASK 2: Query Optimization

Bad query (function on column):

```sql
EXPLAIN SELECT *
FROM students
WHERE YEAR(created_at) = 2024;
```

Rewrite (index friendly):

```sql
EXPLAIN SELECT *
FROM students
WHERE created_at >= "2024-01-01"
AND created_at < "2025-01-01";
```

## TASK 3: Connection Pool Test

Endpoints:
- Pool: `GET /students`
- No pool: `GET /students-nopool`

Load test:

```bash
npx autocannon http://localhost:3000/students
npx autocannon http://localhost:3000/students-nopool
```

Compare latency and RPS.

## TASK 4: N+1 Problem

Endpoints:
- N+1: `GET /students/with-grades/nplus1?limit=1000`
- JOIN: `GET /students/with-grades/join?limit=1000`

Compare `queryCount` in responses.

Equivalent JOIN:

```sql
SELECT students.name, grades.score
FROM students
JOIN grades ON students.id = grades.student_id;
```

## TASK 5: Redis Cache Implementation

Endpoint:
- `GET /courses`

First request should show `cache: false`, next request `cache: true`.

## TASK 6: Cache Invalidation

Endpoint:
- `POST /courses`

This inserts a course and deletes the `courses` cache key.

## TASK 7: Rate Limiting (Redis)

Endpoint:
- `POST /login`

Calls above `LOGIN_RATE_LIMIT_MAX` within `LOGIN_RATE_LIMIT_WINDOW` seconds return `429`.

## BONUS: Dashboard Cache

Endpoint:
- `GET /dashboard`

Notes:
- `GET /students/by-year` defaults to `limit=1000` to avoid huge responses. Override with `limit=...` as needed.

Returns cached counts for `students`, `courses`, `grades`, `announcements`.

## Performance Report (Final Task)

Suggested metrics to capture:
- Index optimization: before/after execution time
- Connection pool: RPS + latency from autocannon
- Redis cache: DB query reduction per request
- N+1 fix: query count difference
