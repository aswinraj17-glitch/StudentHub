-- ============================================================
-- StudentHub Campus Placement & Job Portal Database Schema
-- Compatible with MySQL 8.0+ & MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS studenthub;
USE studenthub;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS candidate_round_results;
DROP TABLE IF EXISTS job_rounds;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS officer_profiles;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Table: users (Authentication & Role credentials)
-- ------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED', -- APPROVED, PENDING, REJECTED
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: student_profiles (Detailed student profile info)
-- ------------------------------------------------------------
CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    photo_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    dob VARCHAR(50),
    gender VARCHAR(20),
    location VARCHAR(255),
    college VARCHAR(255),
    university VARCHAR(255),
    degree VARCHAR(255),
    department VARCHAR(255),
    batch VARCHAR(100),
    graduation_year INT,
    current_semester VARCHAR(50),
    cgpa DOUBLE DEFAULT 0.0,
    backlogs INT DEFAULT 0,
    skills TEXT,
    projects_json TEXT,
    certifications_json TEXT,
    resume_url VARCHAR(500),
    completion_percentage INT DEFAULT 10,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: officer_profiles (Placement officer profile info)
-- ------------------------------------------------------------
CREATE TABLE officer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255),
    official_email VARCHAR(255),
    phone VARCHAR(50),
    college VARCHAR(255),
    department VARCHAR(255),
    designation VARCHAR(255),
    office_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: jobs (Job & Placement Drive postings)
-- ------------------------------------------------------------
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(100),
    experience VARCHAR(100),
    qualification VARCHAR(255),
    skills TEXT,
    salary_min DOUBLE,
    salary_max DOUBLE,
    openings INT DEFAULT 1,
    application_start_date DATE,
    deadline DATE,
    interview_date DATE,
    description TEXT,
    eligible_degree VARCHAR(255) DEFAULT 'All Degrees',
    eligible_department VARCHAR(255) DEFAULT 'All Departments',
    min_cgpa DOUBLE DEFAULT 0.0,
    max_backlogs INT DEFAULT 0,
    eligible_grad_year INT DEFAULT 2026,
    is_placement_drive BOOLEAN DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    approved BOOLEAN NOT NULL DEFAULT TRUE,
    recruiter_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: applications (Job applications with Data Snapshot)
-- ------------------------------------------------------------
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status VARCHAR(100) DEFAULT 'APPLIED', -- APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Candidate Snapshot Fields
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    student_phone VARCHAR(50),
    student_college VARCHAR(255),
    student_university VARCHAR(255),
    student_degree VARCHAR(255),
    student_department VARCHAR(255),
    student_grad_year INT,
    student_cgpa DOUBLE,
    student_backlogs INT DEFAULT 0,
    student_skills TEXT,
    student_resume_url VARCHAR(500),
    eligibility_status VARCHAR(50) DEFAULT 'ELIGIBLE', -- ELIGIBLE, NOT_ELIGIBLE
    eligibility_reasons TEXT,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: saved_jobs (Saved/bookmarked jobs)
-- ------------------------------------------------------------
CREATE TABLE saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: interviews (Scheduled interviews)
-- ------------------------------------------------------------
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interview_at DATETIME NOT NULL,
    mode VARCHAR(100) DEFAULT 'Online', -- Online, Offline, Phone
    meeting_link VARCHAR(500),
    notes TEXT,
    status VARCHAR(100) DEFAULT 'SCHEDULED',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: notifications (System notifications)
-- ------------------------------------------------------------
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    read_flag BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: announcements (Campus placement announcements)
-- ------------------------------------------------------------
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal', -- Normal, Important, Urgent
    author_name VARCHAR(255) DEFAULT 'Placement Cell',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: job_rounds (Recruitment / Selection process rounds per job)
-- ------------------------------------------------------------
CREATE TABLE job_rounds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    round_order INT NOT NULL,
    round_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: candidate_round_results (Candidate status per recruitment round)
-- ------------------------------------------------------------
CREATE TABLE candidate_round_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    job_round_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, UPCOMING, IN_PROGRESS, SHORTLISTED, NOT_SHORTLISTED
    remarks TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (job_round_id) REFERENCES job_rounds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA FOR TESTING
-- ============================================================

INSERT INTO users (id, name, email, password, phone, role, status, active) VALUES
(1, 'Aswin Raj', 'student@studenthub.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.1K6vBq/F9t8r.n9sC', '9876543210', 'STUDENT', 'APPROVED', 1),
(2, 'Dr. Robert Placement', 'officer@studenthub.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.1K6vBq/F9t8r.n9sC', '9876543211', 'OFFICER', 'APPROVED', 1),
(3, 'Prof. Sarah Pending', 'pending_officer@studenthub.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.1K6vBq/F9t8r.n9sC', '9876543212', 'OFFICER', 'PENDING', 1),
(4, 'System Admin', 'admin@studenthub.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVym5p.1K6vBq/F9t8r.n9sC', '9876543213', 'ADMIN', 'APPROVED', 1);

INSERT INTO student_profiles (id, user_id, email, phone, college, university, degree, department, batch, graduation_year, current_semester, cgpa, backlogs, skills, projects_json, certifications_json, resume_url, completion_percentage) VALUES
(1, 1, 'student@studenthub.com', '9876543210', 'Anna University', 'Anna University', 'B.E.', 'CSE', '2022-2026', 2026, 'Semester 7', 8.5, 0, 'Java, Spring Boot, React, SQL', '[{"name":"StudentHub Portal","description":"Placement portal built with Spring Boot & React","tech":"Java, React, SQL","github":"https://github.com/example/studenthub","demo":"https://studenthub.example.com"}]', '[{"name":"NPTEL Cloud Computing","org":"NPTEL","date":"2025","url":"https://nptel.ac.in"}]', 'https://example.com/resumes/aswin_resume.pdf', 100);

INSERT INTO officer_profiles (id, user_id, full_name, official_email, phone, college, department, designation, office_location, status) VALUES
(1, 2, 'Dr. Robert Placement', 'officer@studenthub.com', '9876543211', 'Anna University', 'Training & Placement', 'Head Placement Officer', 'Block A - Room 102', 'APPROVED'),
(2, 3, 'Prof. Sarah Pending', 'pending_officer@studenthub.com', '9876543212', 'Anna University', 'Information Technology', 'Assistant Officer', 'Block B - Room 204', 'PENDING');

INSERT INTO jobs (id, title, company, location, job_type, experience, qualification, skills, salary_min, salary_max, openings, application_start_date, deadline, interview_date, description, eligible_degree, eligible_department, min_cgpa, max_backlogs, eligible_grad_year, is_placement_drive, active, approved, recruiter_id) VALUES
(1, 'Java Full Stack Developer', 'TechNova Solutions', 'Chennai', 'Full Time', 'Fresher', 'B.E. / B.Tech', 'Java, Spring Boot, SQL, React', 5.0, 7.5, 8, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 'Recruiting fresh graduates for our core product engineering team.', 'B.E.', 'CSE', 7.0, 0, 2026, TRUE, TRUE, TRUE, 2),
(2, 'Frontend Developer Intern', 'CodeCraft Technologies', 'Bangalore', 'Internship', 'Fresher', 'B.E. / B.Tech / B.Sc', 'React, JavaScript, HTML, CSS', 20000.0, 25000.0, 5, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'Work alongside senior engineers building scalable frontend apps.', 'B.E.', 'CSE', 6.5, 0, 2026, TRUE, TRUE, TRUE, 2);

INSERT INTO job_rounds (id, job_id, round_order, round_name, description) VALUES
(1, 1, 1, 'Aptitude Test', 'Online aptitude assessment covering quantitative aptitude, logical reasoning, and verbal skills.'),
(2, 1, 2, 'Technical Interview', 'In-depth technical interview focusing on Java, Data Structures, SQL, and OOP concepts.'),
(3, 1, 3, 'HR Interview', 'Final round to discuss candidate background, communication skills, and compensation offer.');

INSERT INTO applications (id, student_id, job_id, status, applied_at, student_name, student_email, student_phone, student_college, student_degree, student_department, student_grad_year, student_cgpa, student_backlogs, student_skills, student_resume_url, eligibility_status, eligibility_reasons) VALUES
(1, 1, 1, 'SHORTLISTED', NOW(), 'Aswin Raj', 'student@studenthub.com', '9876543210', 'Anna University', 'B.E.', 'CSE', 2026, 8.5, 0, 'Java, Spring Boot, React, SQL', 'https://example.com/resumes/aswin_resume.pdf', 'ELIGIBLE', '');

INSERT INTO candidate_round_results (id, application_id, job_round_id, status, remarks) VALUES
(1, 1, 1, 'SHORTLISTED', 'Cleared online test with 92% score.'),
(2, 1, 2, 'UPCOMING', 'Scheduled for technical interview.'),
(3, 1, 3, 'NOT_STARTED', '');

INSERT INTO saved_jobs (id, student_id, job_id) VALUES
(1, 1, 2);

INSERT INTO interviews (id, application_id, interview_at, mode, meeting_link, notes, status) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 'Online', 'https://meet.google.com/abc-defg-hij', 'Technical round 1 focusing on Data Structures & Java Core.', 'SCHEDULED');

INSERT INTO notifications (id, user_id, message, read_flag, created_at) VALUES
(1, 1, 'Congratulations! Your application for Java Full Stack Developer at TechNova Solutions was SHORTLISTED.', 0, NOW());

INSERT INTO announcements (id, title, description, priority, author_name, created_at) VALUES
(1, 'TechNova Placement Drive Announced', 'TechNova Solutions campus recruitment drive is scheduled. Check eligibility and apply before deadline.', 'Urgent', 'Placement Cell', NOW());
