package com.studenthub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Entities {

    public enum Role {
        STUDENT,
        RECRUITER,
        OFFICER,
        ADMIN
    }

    @Entity(name = "User")
    @Table(name = "users")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @Column(unique = true, nullable = false)
        public String email;

        public String password;
        public String name;
        public String phone;

        @Enumerated(EnumType.STRING)
        public Role role;

        public String status = "APPROVED"; // APPROVED, PENDING, REJECTED
        public boolean active = true;
        public LocalDateTime createdAt = LocalDateTime.now();
    }

    @Entity(name = "StudentProfile")
    @Table(name = "student_profiles")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class StudentProfile {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @OneToOne
        public User user;

        public String photoUrl;
        public String email;
        public String phone;
        public String dob;
        public String gender;
        public String location;
        public String college;
        public String university;
        public String degree;
        public String department;
        public String batch;
        public Integer graduationYear;
        public String currentSemester;
        public Double cgpa = 0.0;
        public Integer backlogs = 0;
        public Double tenthPercentage = 0.0;
        public Double twelfthPercentage = 0.0;

        @Column(columnDefinition = "TEXT")
        public String skills;

        @Column(columnDefinition = "LONGTEXT")
        public String projectsJson;

        @Column(columnDefinition = "LONGTEXT")
        public String certificationsJson;

        public String resumeUrl;
        public Integer completionPercentage = 10;
    }

    @Entity(name = "OfficerProfile")
    @Table(name = "officer_profiles")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class OfficerProfile {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @OneToOne
        public User user;

        public String fullName;
        public String officialEmail;
        public String phone;
        public String college;
        public String department;
        public String designation;
        public String officeLocation;
        public String status = "PENDING"; // PENDING, APPROVED, REJECTED
    }

    @Entity(name = "Job")
    @Table(name = "jobs")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Job {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        public String title;
        public String company;
        public String location;
        public String jobType;
        public String experience;
        public String qualification;

        @Column(columnDefinition = "TEXT")
        public String skills;

        public Double salaryMin;
        public Double salaryMax;
        public Integer openings;
        public LocalDate applicationStartDate = LocalDate.now();
        public LocalDate deadline;
        public LocalDate interviewDate;

        @Column(columnDefinition = "LONGTEXT")
        public String description;

        public String eligibleDegree = "All Degrees";
        public String eligibleDepartment = "All Departments";
        public Double minCgpa = 0.0;
        public Integer maxBacklogs = 0;
        public Integer eligibleGradYear = 2026;
        public boolean isPlacementDrive = true;

        public boolean active = true;
        public boolean approved = true;

        @ManyToOne
        public User recruiter;
        public LocalDateTime createdAt = LocalDateTime.now();
    }

    @Entity(name = "Application")
    @Table(name = "applications")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Application {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne
        public User student;

        @ManyToOne
        public Job job;

        public String status = "APPLIED"; // APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
        public LocalDateTime appliedAt = LocalDateTime.now();

        // Data Snapshot Fields
        public String studentName;
        public String studentEmail;
        public String studentPhone;
        public String studentCollege;
        public String studentUniversity;
        public String studentDegree;
        public String studentDepartment;
        public Integer studentGradYear;
        public Double studentCgpa;
        public Integer studentBacklogs = 0;

        @Column(columnDefinition = "TEXT")
        public String studentSkills;

        public String studentResumeUrl;

        public String eligibilityStatus = "ELIGIBLE"; // ELIGIBLE, NOT_ELIGIBLE

        @Column(columnDefinition = "TEXT")
        public String eligibilityReasons;
    }

    @Entity(name = "SavedJob")
    @Table(name = "saved_jobs")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SavedJob {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne
        public User student;

        @ManyToOne
        public Job job;

        public LocalDateTime createdAt = LocalDateTime.now();
    }

    @Entity(name = "Interview")
    @Table(name = "interviews")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Interview {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne
        public Application application;

        public LocalDateTime interviewAt;
        public String mode = "Online";
        public String meetingLink;
        public String notes;
        public String status = "SCHEDULED";
    }

    @Entity(name = "Notification")
    @Table(name = "notifications")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Notification {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        @ManyToOne
        public User user;

        @Column(columnDefinition = "TEXT")
        public String message;

        public boolean readFlag = false;
        public LocalDateTime createdAt = LocalDateTime.now();
    }

    @Entity(name = "Announcement")
    @Table(name = "announcements")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class Announcement {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        public Long id;

        public String title;

        @Column(columnDefinition = "LONGTEXT")
        public String description;

        public String priority = "Normal"; // Normal, Important, Urgent
        public String authorName = "Placement Cell";
        public LocalDateTime createdAt = LocalDateTime.now();
    }
}