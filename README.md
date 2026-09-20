# StudentHub - Campus Placement & Job Portal
Sri Shanmugha College of Engineering and Technology

Modern student job portal built with React, Spring Boot, and MySQL.

## Registration & Authentication
- Student registration is strictly restricted to students of Sri Shanmugha College of Engineering and Technology.
- Student email IDs must follow the official student ID pattern: `e{batch}{dept}{student_number}@shanmugha.edu.in` (e.g. `e23cs010@shanmugha.edu.in`).

## Run
1. Create database with database/schema.sql.
2. Update backend/src/main/resources/application.properties with your MySQL password.
3. Run backend: `mvn spring-boot:run`.
4. Run frontend: `npm install && npm run dev`.

Core modules: authentication, student profiles, jobs, search, applications, saved jobs, interviews, notifications, placement officer directory, and admin console.