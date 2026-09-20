package com.studenthub.config;

import com.studenthub.model.Entities.*;
import com.studenthub.model.Entities.Role;
import com.studenthub.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class Seed {

    @Bean
    public CommandLineRunner run(
            Users users,
            Jobs jobs,
            Profiles profiles,
            OfficerProfiles officerProfiles,
            Announcements announcements,
            Notifications notifications,
            Apps apps,
            Saved saved,
            PasswordEncoder encoder
    ) {
        return args -> {
            User student = users.findByEmail("e23cs010@shanmugha.edu.in").orElseGet(() -> {
                User u = new User();
                u.name = "Aswin Raj";
                u.email = "e23cs010@shanmugha.edu.in";
                u.password = encoder.encode("password");
                u.phone = "9876543210";
                u.role = Role.STUDENT;
                u.status = "APPROVED";
                return users.save(u);
            });

            if (profiles.findByUserId(student.id).isEmpty()) {
                StudentProfile sp = new StudentProfile();
                sp.user = student;
                sp.email = student.email;
                sp.phone = student.phone;
                sp.college = "Sri Shanmugha College of Engineering and Technology";
                sp.university = "Anna University";
                sp.degree = "B.E.";
                sp.department = "CSE";
                sp.batch = "2023-2027";
                sp.graduationYear = 2027;
                sp.currentSemester = "Semester 5";
                sp.cgpa = 8.5;
                sp.backlogs = 0;
                sp.skills = "Java, Spring Boot, React, SQL";
                sp.projectsJson = "[{\"name\":\"StudentHub Portal\",\"description\":\"Campus placement job portal\",\"tech\":\"Java, React, SQL\",\"github\":\"https://github.com/example/studenthub\",\"demo\":\"https://studenthub.example.com\"}]";
                sp.certificationsJson = "[{\"name\":\"NPTEL Cloud Computing\",\"org\":\"NPTEL\",\"date\":\"2025\",\"url\":\"https://nptel.ac.in\"}]";
                sp.resumeUrl = "https://example.com/resumes/aswin_resume.pdf";
                sp.completionPercentage = 100;
                profiles.save(sp);
            }

            User officer = users.findByEmail("officer@shanmugha.edu.in").orElseGet(() -> {
                User u = new User();
                u.name = "Dr. Robert Placement";
                u.email = "officer@shanmugha.edu.in";
                u.password = encoder.encode("password");
                u.phone = "9876543211";
                u.role = Role.OFFICER;
                u.status = "APPROVED";
                return users.save(u);
            });

            if (officerProfiles.findByUserId(officer.id).isEmpty()) {
                OfficerProfile op = new OfficerProfile();
                op.user = officer;
                op.fullName = officer.name;
                op.officialEmail = officer.email;
                op.phone = officer.phone;
                op.college = "Sri Shanmugha College of Engineering and Technology";
                op.department = "Training & Placement";
                op.designation = "Head Placement Officer";
                op.officeLocation = "Block A - Room 102";
                op.status = "APPROVED";
                officerProfiles.save(op);
            }

            User pendingOfficer = users.findByEmail("pending_officer@shanmugha.edu.in").orElseGet(() -> {
                User u = new User();
                u.name = "Prof. Sarah Pending";
                u.email = "pending_officer@shanmugha.edu.in";
                u.password = encoder.encode("password");
                u.phone = "9876543212";
                u.role = Role.OFFICER;
                u.status = "PENDING";
                return users.save(u);
            });

            if (officerProfiles.findByUserId(pendingOfficer.id).isEmpty()) {
                OfficerProfile op = new OfficerProfile();
                op.user = pendingOfficer;
                op.fullName = pendingOfficer.name;
                op.officialEmail = pendingOfficer.email;
                op.phone = pendingOfficer.phone;
                op.college = "Sri Shanmugha College of Engineering and Technology";
                op.department = "Information Technology";
                op.designation = "Assistant Placement Officer";
                op.officeLocation = "Block B - Room 204";
                op.status = "PENDING";
                officerProfiles.save(op);
            }

            User admin = users.findByEmail("admin@studenthub.com").orElseGet(() -> {
                User u = new User();
                u.name = "System Admin";
                u.email = "admin@studenthub.com";
                u.password = encoder.encode("password");
                u.phone = "9876543213";
                u.role = Role.ADMIN;
                u.status = "APPROVED";
                return users.save(u);
            });

            if (jobs.count() == 0) {
                Job drive1 = new Job();
                drive1.title = "Java Full Stack Developer";
                drive1.company = "TechNova Solutions";
                drive1.location = "Chennai";
                drive1.jobType = "Full Time";
                drive1.experience = "Fresher";
                drive1.qualification = "B.E. / B.Tech";
                drive1.skills = "Java, Spring Boot, SQL, React";
                drive1.salaryMin = 5.0;
                drive1.salaryMax = 7.5;
                drive1.openings = 8;
                drive1.applicationStartDate = LocalDate.now();
                drive1.deadline = LocalDate.now().plusDays(25);
                drive1.interviewDate = LocalDate.now().plusDays(30);
                drive1.description = "Recruiting fresh graduates for our core product engineering team.";
                drive1.eligibleDegree = "B.E.";
                drive1.eligibleDepartment = "CSE";
                drive1.minCgpa = 7.0;
                drive1.maxBacklogs = 0;
                drive1.eligibleGradYear = 2026;
                drive1.isPlacementDrive = true;
                drive1.recruiter = officer;
                jobs.save(drive1);

                Job drive2 = new Job();
                drive2.title = "Frontend Developer Intern";
                drive2.company = "CodeCraft Technologies";
                drive2.location = "Bangalore";
                drive2.jobType = "Internship";
                drive2.experience = "Fresher";
                drive2.qualification = "B.E. / B.Tech / B.Sc";
                drive2.skills = "React, JavaScript, HTML, CSS";
                drive2.salaryMin = 20000.0;
                drive2.salaryMax = 25000.0;
                drive2.openings = 5;
                drive2.applicationStartDate = LocalDate.now();
                drive2.deadline = LocalDate.now().plusDays(15);
                drive2.interviewDate = LocalDate.now().plusDays(20);
                drive2.description = "Work alongside senior engineers building scalable frontend apps.";
                drive2.eligibleDegree = "B.E.";
                drive2.eligibleDepartment = "CSE";
                drive2.minCgpa = 6.5;
                drive2.maxBacklogs = 0;
                drive2.eligibleGradYear = 2026;
                drive2.isPlacementDrive = true;
                drive2.recruiter = officer;
                jobs.save(drive2);
            }

            if (announcements.count() == 0) {
                Announcement a1 = new Announcement();
                a1.title = "TechNova Placement Drive Announced";
                a1.description = "TechNova Solutions campus recruitment drive is scheduled. Check eligibility and apply before deadline.";
                a1.priority = "Urgent";
                a1.authorName = "Training & Placement Cell";
                announcements.save(a1);
            }
        };
    }
}