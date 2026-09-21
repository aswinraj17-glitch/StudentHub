# 🎓 StudentHub – Modern College Placement Management System

<div align="center">

![StudentHub Banner](https://img.shields.io/badge/StudentHub-Placement%20Portal-4f46e5?style=for-the-badge&logo=education&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<p align="center">
  <b>A centralized, feature-rich campus recruitment platform connecting Students, Placement Officers, and Recruiters.</b>
  <br />
  Designed exclusively for <b>Sri Shanmugha College of Engineering and Technology</b>.
</p>

[Key Features](#-key-features) •
[Tech Stack](#%EF%B8%8F-tech-stack) •
[Installation & Setup](#-installation--setup) •
[API Reference](#-api-reference) •
[Database Schema](#%EF%B8%8F-database-schema)

</div>

---

## 🌟 Overview

**StudentHub** is an end-to-end full-stack campus placement and recruitment portal built to automate drive announcements, student profile verification, selection round shortlisting, multi-department eligibility checks, and individual company Excel reporting.

Whether managing high-volume placement drives or tracking individual candidate progress through complex recruitment rounds, StudentHub offers an intuitive interface and reliable backend engine.

---

## ✨ Key Features

### 🎯 1. Placement Round & Shortlist Management
* **Custom Recruitment Process Definition**: Placement officers can configure multi-stage selection processes (e.g. *Round 1: Aptitude Test*, *Round 2: Technical Interview*, *Round 3: HR Interview*).
* **Stage-by-Stage Shortlisting**: Evaluate candidates per round with `✓ Shortlist`, `🔵 Progress`, and `%E2%9D%8C Eliminate` controls.
* **Automated Candidate Progression**: Shortlisting a student in Round $N$ automatically advances them to Round $N+1$.
* **🎉 Final Selection & Email Notice**: Clearing the final round updates the candidate's status to **Selected** and triggers a celebratory notice informing the student that HR will contact them via email.

### 📥 2. Individual Company Excel Export
* **Company-Specific Reports**: Export individual `.csv` spreadsheets per placement drive containing company summary details, total applicant metrics, roll numbers, full names, official emails, departments, CGPA, backlogs, and round statuses.
* **Native Excel Encoding**: Includes UTF-8 Byte Order Mark (`\uFEFF`) for seamless column alignment and character rendering in Microsoft Excel.

### 🗑️ 3. Drive Lifecycle & Deletion Control
* **Safe Drive Deletion**: Placement officers can delete posted drives directly from the Dashboard or Placement Round panel.
* **Transactional Cascading Cleanup**: Deletes associated candidate round results, application snapshots, interview schedules, and saved job bookmarks safely without database integrity errors.

### 🎓 4. Sri Shanmugha Email & Eligibility Enforcement
* **Official Student Email Regex**: Restricts registration strictly to valid college student emails (`eXXdeptXXX@shanmugha.edu.in`).
* **Multi-Select Degree & Department Filtering**: Placement officers can toggle multi-select pill tags (`B.E.`, `B.Tech`, `M.E.`, `CSE`, `IT`, `ECE`, `AI & DS`, etc.) for job postings.
* **Automatic Server-Side Eligibility Checks**: Evaluates CGPA thresholds, backlog limits, degree lists, department lists, and application deadlines.

### 👤 5. Student Profile Wizard & Placement Progress Timeline
* **Live Completion Meter**: Auto-calculates profile completion percentage ($10\%$ to $100\%$).
* **Visual Progress Timeline**: Interactive vertical step timeline showing real-time status across selection rounds (`✅ Shortlisted`, `⏳ Upcoming`, `🔵 In Progress`, `❌ Eliminated`).

---

## 🛠️ Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Frontend Framework** | React.js (Vite) |
| **Icons & UI Utilities** | React Icons (`fi`), Modern CSS Design System |
| **Backend Framework** | Java 17 + Spring Boot 3 |
| **Persistence / ORM** | Spring Data JPA / Hibernate |
| **Security & Auth** | Spring Security + BCrypt Password Encoder |
| **Database** | MySQL 8.0 |
| **Build System** | Apache Maven |

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    React.js Frontend                    │
│           (Vite Server @ http://localhost:5173)         │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API (JSON / CSV)
┌───────────────────────────▼─────────────────────────────┐
│                 Spring Boot Backend API                 │
│         (REST Controller @ http://localhost:8080/api)   │
├─────────────────────────────────────────────────────────┤
│  • Security & Auth   • Eligibility Engine               │
│  • Round Shortlist   • CSV Generator (@Transactional)   │
└───────────────────────────┬─────────────────────────────┘
                            │ JPA / Hibernate
┌───────────────────────────▼─────────────────────────────┐
│                      MySQL Database                     │
│    (users, student_profiles, jobs, job_rounds, etc.)    │
└───────────────────────────┬─────────────────────────────┘
```

---

## 💻 Installation & Setup

### Prerequisites
* **Java Development Kit (JDK 17+)**
* **Node.js (v18+) & npm**
* **MySQL Server (v8.0+)**
* **Apache Maven**

---

### 1. Database Setup
Create a MySQL database named `studenthub`:

```sql
CREATE DATABASE studenthub;
```

*(Note: Table schemas and initial seed data are automatically generated by Spring Data JPA and Seed.java).*

---

### 2. Backend Setup & Launch

Navigate to the `backend` directory:

```bash
cd backend
```

Configure your database credentials in `src/main/resources/application.properties` if needed:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studenthub?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Compile and run the Spring Boot application:

```bash
mvn clean compile
mvn spring-boot:run
```

Backend REST API will be live at: **`http://localhost:8080/api`**

---

### 3. Frontend Setup & Launch

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

Frontend application will be live at: **`http://localhost:5173`**

---

## 🔗 Key API Endpoints

### 👥 Authentication & Profiles
* `POST /api/auth/student/register` – Register new student (verifies `@shanmugha.edu.in`)
* `POST /api/auth/student/login` – Student authentication
* `POST /api/auth/officer/login` – Placement officer authentication
* `GET /api/students/{id}/profile-wizard` – Fetch student profile wizard data

### 🏢 Placement Drives & Deletion
* `GET /api/jobs` – List all active placement drives (with search filtering)
* `POST /api/jobs` – Post new placement drive
* `DELETE /api/jobs/{id}` – Delete placement drive & all associated round records
* `GET /api/jobs/{id}/eligibility` – Check candidate eligibility for a drive

### 🎯 Round & Shortlist Management
* `GET /api/jobs/{id}/rounds` – Fetch recruitment selection process rounds
* `POST /api/jobs/{id}/rounds` – Save/configure drive selection rounds
* `GET /api/jobs/{jobId}/rounds/results` – Fetch all candidate round evaluation statuses
* `POST /api/jobs/{jobId}/rounds/{roundId}/bulk-status` – Update candidate round status

### 📥 Excel Reports
* `GET /api/placement-drives/{id}/export-excel` – Download individual company Excel (`.csv`) applicant spreadsheet

---

## 📁 Project Directory Structure

```text
StudentHub
├── backend/
│   ├── src/main/java/com/studenthub/
│   │   ├── config/          # Security, CORS, Seed Data Configuration
│   │   ├── controller/      # REST API Controllers (ApiController)
│   │   ├── model/           # JPA Entities (User, Job, JobRound, CandidateRoundResult, etc.)
│   │   └── repo/            # Spring Data JPA Repositories
│   └── pom.xml              # Maven Project Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Primary React UI Components & Routing
│   │   ├── api.js           # Axios API Client Configuration
│   │   └── style.css        # Vanilla Design System & Animations
│   └── package.json         # React Frontend Dependencies
│
└── database/
    └── schema.sql           # SQL Relational Schema Backup
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the repository issues or submit pull requests.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for Sri Shanmugha College of Engineering and Technology.</sub>
</div>
