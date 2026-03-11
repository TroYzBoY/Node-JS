-- TASK 1: Slow Query Detection
SELECT *
FROM students
WHERE email = "s100@mail.com";

EXPLAIN SELECT *
FROM students
WHERE email = "s100@mail.com";

CREATE INDEX idx_email ON students(email);

EXPLAIN SELECT *
FROM students
WHERE email = "s100@mail.com";

-- TASK 2: Query Optimization
EXPLAIN SELECT *
FROM students
WHERE YEAR(created_at) = 2024;

EXPLAIN SELECT *
FROM students
WHERE created_at >= "2024-01-01"
AND created_at < "2025-01-01";
