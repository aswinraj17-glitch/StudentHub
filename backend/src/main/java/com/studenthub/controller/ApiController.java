package com.studenthub.controller;

import com.studenthub.model.Entities.*;
import com.studenthub.model.Entities.Role;
import com.studenthub.repo.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final Users users;
    private final Jobs jobs;
    private final Apps apps;
    private final Saved saved;
    private final Interviews interviews;
    private final Notifications notifications;
    private final Profiles profiles;
    private final OfficerProfiles officerProfiles;
    private final Announcements announcements;
    private final PasswordEncoder encoder;

    public ApiController(
            Users users,
            Jobs jobs,
            Apps apps,
            Saved saved,
            Interviews interviews,
            Notifications notifications,
            Profiles profiles,
            OfficerProfiles officerProfiles,
            Announcements announcements,
            PasswordEncoder encoder
    ) {
        this.users = users;
        this.jobs = jobs;
        this.apps = apps;
        this.saved = saved;
        this.interviews = interviews;
        this.notifications = notifications;
        this.profiles = profiles;
        this.officerProfiles = officerProfiles;
        this.announcements = announcements;
        this.encoder = encoder;
    }

    // ============================================================
    // INPUT VALIDATION HELPERS
    // ============================================================

    private String validateName(String name) {
        if (name == null || name.trim().length() < 3) return "Name must be at least 3 characters long.";
        if (!name.matches("^[a-zA-Z\\s.'-]+$")) return "Name can only contain alphabetic letters and spaces.";
        return null;
    }

    private String validateStudentEmail(String email) {
        if (email == null || !email.trim().toLowerCase().matches("^[eE]\\d{2}[a-zA-Z]{2,5}\\d{3,4}@shanmugha\\.edu\\.in$")) {
            return "Registration is restricted to students of Sri Shanmugha College of Engineering and Technology. Please use your valid college student email ID.";
        }
        return null;
    }

    private String validateGeneralEmail(String email) {
        if (email == null || !email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
            return "Please enter a valid email address.";
        }
        return null;
    }

    private String validatePhone(String phone) {
        if (phone == null || !phone.matches("^[0-9]{10,15}$")) {
            return "Please enter a valid 10-digit numeric phone number.";
        }
        return null;
    }

    private String validateCgpa(Double cgpa) {
        if (cgpa == null || cgpa < 0.0 || cgpa > 10.0) {
            return "CGPA must be between 0.0 and 10.0.";
        }
        return null;
    }

    // ============================================================
    // STUDENT AUTHENTICATION & PROFILE WIZARD
    // ============================================================

    @PostMapping("/auth/student/register")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String phone = (String) body.get("phone");

        String nameErr = validateName(name);
        if (nameErr != null) return ResponseEntity.badRequest().body(Map.of("message", nameErr));

        String studentEmailErr = validateStudentEmail(email);
        if (studentEmailErr != null) return ResponseEntity.badRequest().body(Map.of("message", studentEmailErr));

        String phoneErr = validatePhone(phone);
        if (phoneErr != null) return ResponseEntity.badRequest().body(Map.of("message", phoneErr));

        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters long."));
        }

        if (users.findByEmail(email.trim()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "This student email is already registered."));
        }

        User user = new User();
        user.name = name.trim();
        user.email = email.trim().toLowerCase();
        user.password = encoder.encode(password);
        user.phone = phone.trim();
        user.role = Role.STUDENT;
        user.status = "APPROVED";
        User savedUser = users.save(user);

        StudentProfile profile = new StudentProfile();
        profile.user = savedUser;
        profile.email = email.trim().toLowerCase();
        profile.phone = phone;
        String collegeInput = (String) body.getOrDefault("college", "");
        if (collegeInput == null || collegeInput.isBlank()) {
            collegeInput = "Sri Shanmugha College of Engineering and Technology";
        }
        profile.college = collegeInput;
        profile.department = (String) body.getOrDefault("department", "CSE");
        profile.degree = (String) body.getOrDefault("degree", "B.E.");
        if (body.get("graduationYear") != null) {
            try {
                profile.graduationYear = Integer.parseInt(body.get("graduationYear").toString());
            } catch (Exception ignored) {}
        }
        profile.completionPercentage = calculateProfileCompletion(profile);
        profiles.save(profile);

        return ResponseEntity.ok(Map.of(
                "id", savedUser.id,
                "name", savedUser.name,
                "email", savedUser.email,
                "role", savedUser.role,
                "message", "Student account created successfully."
        ));
    }

    @PostMapping("/auth/student/login")
    public ResponseEntity<?> loginStudent(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = users.findByEmail(email);
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (user.role != Role.STUDENT) {
            return ResponseEntity.status(403).body(Map.of("message", "Please login using your designated portal."));
        }

        StudentProfile profile = profiles.findByUserId(user.id).orElseGet(() -> {
            StudentProfile p = new StudentProfile();
            p.user = user;
            p.email = user.email;
            p.completionPercentage = 15;
            return profiles.save(p);
        });

        return ResponseEntity.ok(Map.of(
                "id", user.id,
                "name", user.name,
                "email", user.email,
                "role", user.role,
                "profileCompletion", profile.completionPercentage != null ? profile.completionPercentage : 15
        ));
    }

    @GetMapping("/students/{id}/profile-wizard")
    public ResponseEntity<?> getStudentProfileWizard(@PathVariable Long id) {
        StudentProfile profile = profiles.findByUserId(id).orElseGet(() -> {
            User user = users.findById(id).orElseThrow();
            StudentProfile p = new StudentProfile();
            p.user = user;
            p.email = user.email;
            p.phone = user.phone;
            p.completionPercentage = 15;
            return profiles.save(p);
        });

        profile.completionPercentage = calculateProfileCompletion(profile);
        profiles.save(profile);

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/students/{id}/profile-wizard")
    public ResponseEntity<?> updateStudentProfileWizard(@PathVariable Long id, @RequestBody StudentProfile input) {
        User user = users.findById(id).orElseThrow();
        StudentProfile profile = profiles.findByUserId(id).orElseGet(() -> {
            StudentProfile p = new StudentProfile();
            p.user = user;
            return p;
        });

        if (input.cgpa != null) {
            String cgpaErr = validateCgpa(input.cgpa);
            if (cgpaErr != null) return ResponseEntity.badRequest().body(Map.of("message", cgpaErr));
        }
        if (input.tenthPercentage != null && (input.tenthPercentage < 0.0 || input.tenthPercentage > 100.0)) {
            return ResponseEntity.badRequest().body(Map.of("message", "10th Percentage must be between 0.0 and 100.0"));
        }
        if (input.twelfthPercentage != null && (input.twelfthPercentage < 0.0 || input.twelfthPercentage > 100.0)) {
            return ResponseEntity.badRequest().body(Map.of("message", "12th Percentage must be between 0.0 and 100.0"));
        }

        profile.photoUrl = input.photoUrl;
        profile.email = input.email != null ? input.email : user.email;
        profile.phone = input.phone != null ? input.phone : user.phone;
        profile.dob = input.dob;
        profile.gender = input.gender;
        profile.location = input.location;

        profile.college = input.college;
        profile.university = input.university;
        profile.degree = input.degree;
        profile.department = input.department;
        profile.batch = input.batch;
        profile.graduationYear = input.graduationYear;
        profile.currentSemester = input.currentSemester;
        profile.cgpa = input.cgpa != null ? input.cgpa : 0.0;
        profile.backlogs = input.backlogs != null ? input.backlogs : 0;
        profile.tenthPercentage = input.tenthPercentage != null ? input.tenthPercentage : 0.0;
        profile.twelfthPercentage = input.twelfthPercentage != null ? input.twelfthPercentage : 0.0;

        profile.skills = input.skills;
        profile.projectsJson = input.projectsJson;
        profile.certificationsJson = input.certificationsJson;
        profile.resumeUrl = input.resumeUrl;

        profile.completionPercentage = calculateProfileCompletion(profile);
        StudentProfile savedProfile = profiles.save(profile);

        return ResponseEntity.ok(savedProfile);
    }

    private int calculateProfileCompletion(StudentProfile p) {
        int percentage = 0;

        // 1. Personal Information (15%)
        boolean personalDone = p.email != null && !p.email.isBlank() &&
                p.phone != null && !p.phone.isBlank() &&
                p.dob != null && !p.dob.isBlank() &&
                p.gender != null && !p.gender.isBlank() &&
                p.location != null && !p.location.isBlank();
        if (personalDone) percentage += 15;
        else {
            if (p.email != null && !p.email.isBlank()) percentage += 5;
            if (p.phone != null && !p.phone.isBlank()) percentage += 5;
            if (p.dob != null || p.location != null) percentage += 5;
        }

        // 2. College Information (20%)
        boolean collegeDone = p.college != null && !p.college.isBlank() &&
                p.university != null && !p.university.isBlank() &&
                p.degree != null && !p.degree.isBlank() &&
                p.department != null && !p.department.isBlank() &&
                p.graduationYear != null && p.graduationYear > 2000;
        if (collegeDone) percentage += 20;
        else {
            if (p.college != null && !p.college.isBlank()) percentage += 10;
            if (p.degree != null && p.department != null) percentage += 10;
        }

        // 3. Academic/Education Information (15%)
        boolean eduDone = p.cgpa != null && p.cgpa > 0.0 &&
                p.tenthPercentage != null && p.tenthPercentage > 0.0 &&
                p.twelfthPercentage != null && p.twelfthPercentage > 0.0;
        if (eduDone) percentage += 15;
        else {
            if (p.cgpa != null && p.cgpa > 0.0) percentage += 7;
            if (p.tenthPercentage != null && p.tenthPercentage > 0.0) percentage += 4;
            if (p.twelfthPercentage != null && p.twelfthPercentage > 0.0) percentage += 4;
        }

        // 4. Skills (15%)
        if (p.skills != null && !p.skills.trim().isEmpty()) percentage += 15;

        // 5. Projects (15%)
        if (p.projectsJson != null && p.projectsJson.length() > 10) percentage += 15;

        // 6. Certifications (10%)
        if (p.certificationsJson != null && p.certificationsJson.length() > 10) percentage += 10;

        // 7. Resume (10%)
        if (p.resumeUrl != null && !p.resumeUrl.isBlank()) percentage += 10;

        return Math.min(percentage, 100);
    }

    // ============================================================
    // PLACEMENT OFFICER AUTHENTICATION & PORTAL
    // ============================================================

    @PostMapping("/auth/officer/register")
    public ResponseEntity<?> registerOfficer(@RequestBody Map<String, String> body) {
        String email = body.get("officialEmail");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String phone = body.get("phone");

        String nameErr = validateName(fullName);
        if (nameErr != null) return ResponseEntity.badRequest().body(Map.of("message", nameErr));

        String emailErr = validateGeneralEmail(email);
        if (emailErr != null) return ResponseEntity.badRequest().body(Map.of("message", emailErr));

        String phoneErr = validatePhone(phone);
        if (phoneErr != null) return ResponseEntity.badRequest().body(Map.of("message", phoneErr));

        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Official Email already registered"));
        }

        User user = new User();
        user.name = fullName;
        user.email = email;
        user.password = encoder.encode(password);
        user.phone = phone;
        user.role = Role.OFFICER;
        user.status = "PENDING";
        User savedUser = users.save(user);

        OfficerProfile profile = new OfficerProfile();
        profile.user = savedUser;
        profile.fullName = fullName;
        profile.officialEmail = email;
        profile.phone = phone;
        profile.college = body.getOrDefault("college", "");
        profile.department = body.getOrDefault("department", "");
        profile.designation = body.getOrDefault("designation", "");
        profile.status = "PENDING";
        officerProfiles.save(profile);

        return ResponseEntity.ok(Map.of(
                "message", "Registration submitted successfully. Account awaiting administrator approval.",
                "status", "PENDING"
        ));
    }

    @PostMapping("/auth/officer/login")
    public ResponseEntity<?> loginOfficer(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = users.findByEmail(email);
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid official email or password"));
        }

        User user = userOpt.get();
        if (user.role != Role.OFFICER) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. Only placement officers can log in here."));
        }

        if ("PENDING".equalsIgnoreCase(user.status)) {
            return ResponseEntity.status(403).body(Map.of(
                    "message", "Your account is awaiting admin approval.",
                    "status", "PENDING"
            ));
        }

        if ("REJECTED".equalsIgnoreCase(user.status)) {
            return ResponseEntity.status(403).body(Map.of(
                    "message", "Your account has been rejected. Please contact administrator.",
                    "status", "REJECTED"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.id,
                "name", user.name,
                "email", user.email,
                "role", user.role,
                "status", user.status
        ));
    }

    @GetMapping("/officer/students")
    public List<StudentProfile> getAllStudentsForOfficer() {
        List<StudentProfile> allProfiles = profiles.findAll();
        List<User> studentUsers = users.findAll().stream().filter(u -> u.role == Role.STUDENT).toList();
        for (User u : studentUsers) {
            boolean exists = allProfiles.stream().anyMatch(p -> p.user != null && p.user.id.equals(u.id));
            if (!exists) {
                StudentProfile sp = new StudentProfile();
                sp.user = u;
                sp.email = u.email;
                sp.phone = u.phone;
                sp.college = "Sri Shanmugha College of Engineering and Technology";
                sp.completionPercentage = calculateProfileCompletion(sp);
                allProfiles.add(profiles.save(sp));
            }
        }
        return allProfiles;
    }

    // ============================================================
    // ADMIN AUTHENTICATION & MANAGEMENT
    // ============================================================

    @PostMapping("/auth/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        boolean isValidUsername = "Aswinadmin@17".equalsIgnoreCase(username) || "admin@studenthub.com".equalsIgnoreCase(username);
        boolean isValidPassword = "aswin_admin@1974".equals(password) || "password".equals(password);

        if (!isValidUsername || !isValidPassword) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid Admin username or password"));
        }

        return ResponseEntity.ok(Map.of(
                "id", 999999L,
                "name", "System Administrator",
                "email", "admin@studenthub.com",
                "role", "ADMIN",
                "status", "APPROVED"
        ));
    }

    @GetMapping("/admin/officers")
    public List<OfficerProfile> getOfficerProfiles() {
        return officerProfiles.findAll();
    }

    @PutMapping("/admin/officers/{id}/approve")
    public ResponseEntity<?> approveOfficer(@PathVariable Long id) {
        OfficerProfile profile = officerProfiles.findById(id).orElseThrow();
        profile.status = "APPROVED";
        if (profile.user != null) {
            profile.user.status = "APPROVED";
            users.save(profile.user);
        }
        officerProfiles.save(profile);

        Notification n = new Notification();
        n.user = profile.user;
        n.message = "Your Placement Officer account has been APPROVED by Administrator.";
        notifications.save(n);

        return ResponseEntity.ok(Map.of("message", "Placement Officer account approved successfully."));
    }

    @PutMapping("/admin/officers/{id}/reject")
    public ResponseEntity<?> rejectOfficer(@PathVariable Long id) {
        OfficerProfile profile = officerProfiles.findById(id).orElseThrow();
        profile.status = "REJECTED";
        if (profile.user != null) {
            profile.user.status = "REJECTED";
            users.save(profile.user);
        }
        officerProfiles.save(profile);

        return ResponseEntity.ok(Map.of("message", "Placement Officer account rejected."));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats() {
        long totalStudents = users.findAll().stream().filter(u -> u.role == Role.STUDENT).count();
        long totalOfficers = officerProfiles.count();
        long pendingOfficers = officerProfiles.findAll().stream().filter(o -> "PENDING".equalsIgnoreCase(o.status)).count();
        long totalDrives = jobs.count();
        long totalApplications = apps.count();
        long selectedStudents = apps.findAll().stream().filter(a -> "SELECTED".equalsIgnoreCase(a.status)).count();

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "totalOfficers", totalOfficers,
                "pendingOfficers", pendingOfficers,
                "totalDrives", totalDrives,
                "totalApplications", totalApplications,
                "selectedStudents", selectedStudents
        ));
    }

    // ============================================================
    // PLACEMENT DRIVES & ELIGIBILITY ENFORCEMENT
    // ============================================================

    @GetMapping("/jobs")
    public List<Job> getJobs(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String location
    ) {
        return jobs.search(keyword, location);
    }

    @GetMapping("/jobs/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobs.findById(id).orElseThrow();
    }

    @PostMapping("/jobs")
    public Job createJob(@RequestBody Job job, @RequestParam(required = false) Long recruiterId) {
        if (recruiterId != null) {
            job.recruiter = users.findById(recruiterId).orElse(null);
        }
        job.isPlacementDrive = true;
        if (job.applicationStartDate == null) job.applicationStartDate = LocalDate.now();
        Job savedJob = jobs.save(job);

        Announcement announcement = new Announcement();
        announcement.title = "New Placement Drive: " + job.company + " - " + job.title;
        announcement.description = "New drive announced for " + job.eligibleDegree + " (" + job.eligibleDepartment + "). Minimum CGPA: " + job.minCgpa;
        announcement.priority = "Important";
        announcements.save(announcement);

        return savedJob;
    }

    @GetMapping("/jobs/{id}/eligibility")
    public ResponseEntity<?> checkEligibility(@PathVariable Long id, @RequestParam Long studentId) {
        Job job = jobs.findById(id).orElseThrow();
        Optional<StudentProfile> profileOpt = profiles.findByUserId(studentId);

        if (profileOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reasons", List.of("Please complete your student profile before checking eligibility.")
            ));
        }

        StudentProfile sp = profileOpt.get();
        List<String> reasons = new ArrayList<>();

        // 1. Min CGPA Check
        if (job.minCgpa != null && job.minCgpa > 0) {
            double studentCgpa = sp.cgpa != null ? sp.cgpa : 0.0;
            if (studentCgpa < job.minCgpa) {
                reasons.add("Minimum CGPA required: " + job.minCgpa + " (Your CGPA: " + studentCgpa + ")");
            }
        }

        // 2. Max Backlogs Check
        if (job.maxBacklogs != null) {
            int studentBacklogs = sp.backlogs != null ? sp.backlogs : 0;
            if (studentBacklogs > job.maxBacklogs) {
                reasons.add("Maximum backlogs allowed: " + job.maxBacklogs + " (Your Backlogs: " + studentBacklogs + ")");
            }
        }

        // 3. Eligible Degree Check
        if (job.eligibleDegree != null && !job.eligibleDegree.equalsIgnoreCase("All Degrees")) {
            if (sp.degree == null || !sp.degree.toLowerCase().contains(job.eligibleDegree.toLowerCase())) {
                reasons.add("Eligible Degree: " + job.eligibleDegree + " (Your Degree: " + (sp.degree != null ? sp.degree : "N/A") + ")");
            }
        }

        // 4. Eligible Department Check
        if (job.eligibleDepartment != null && !job.eligibleDepartment.equalsIgnoreCase("All Departments")) {
            if (sp.department == null || !sp.department.toLowerCase().contains(job.eligibleDepartment.toLowerCase())) {
                reasons.add("Eligible Department: " + job.eligibleDepartment + " (Your Department: " + (sp.department != null ? sp.department : "N/A") + ")");
            }
        }

        // 5. Graduation Year Check
        if (job.eligibleGradYear != null && job.eligibleGradYear > 0) {
            if (sp.graduationYear != null && !sp.graduationYear.equals(job.eligibleGradYear)) {
                reasons.add("Eligible Graduation Year: " + job.eligibleGradYear + " (Your Year: " + sp.graduationYear + ")");
            }
        }

        boolean isEligible = reasons.isEmpty();
        return ResponseEntity.ok(Map.of(
                "eligible", isEligible,
                "reasons", reasons
        ));
    }

    // ============================================================
    // APPLICATIONS WITH DEADLINE ENFORCEMENT & SNAPSHOT
    // ============================================================

    @PostMapping("/applications")
    public ResponseEntity<?> applyJob(@RequestParam Long studentId, @RequestParam Long jobId) {
        Job job = jobs.findById(jobId).orElseThrow();
        User student = users.findById(studentId).orElseThrow();
        StudentProfile profile = profiles.findByUserId(studentId).orElseGet(() -> {
            StudentProfile p = new StudentProfile();
            p.user = student;
            return p;
        });

        // 1. Check Deadline Enforcement on Server
        if (job.deadline != null && LocalDate.now().isAfter(job.deadline)) {
            return ResponseEntity.status(400).body(Map.of("message", "This placement drive is now closed. Application deadline passed."));
        }

        // 2. Prevent Duplicate Application
        if (apps.existsByStudentIdAndJobId(studentId, jobId)) {
            return ResponseEntity.status(409).body(Map.of("message", "You have already applied for this placement drive."));
        }

        // 3. Backend Eligibility Check Enforcement
        List<String> reasons = new ArrayList<>();
        if (job.minCgpa != null && job.minCgpa > 0) {
            double studentCgpa = profile.cgpa != null ? profile.cgpa : 0.0;
            if (studentCgpa < job.minCgpa) {
                reasons.add("Minimum CGPA required: " + job.minCgpa + " (Your CGPA: " + studentCgpa + ")");
            }
        }
        if (job.maxBacklogs != null && profile.backlogs != null && profile.backlogs > job.maxBacklogs) {
            reasons.add("Maximum backlogs allowed: " + job.maxBacklogs + " (Your Backlogs: " + profile.backlogs + ")");
        }
        if (job.eligibleDegree != null && !job.eligibleDegree.equalsIgnoreCase("All Degrees")) {
            if (profile.degree == null || !profile.degree.toLowerCase().contains(job.eligibleDegree.toLowerCase())) {
                reasons.add("Eligible Degree: " + job.eligibleDegree);
            }
        }

        boolean isEligible = reasons.isEmpty();

        // 4. Save Complete Application with Candidate Snapshot Data
        Application app = new Application();
        app.student = student;
        app.job = job;
        app.status = "APPLIED";

        // Snapshot details
        app.studentName = student.name;
        app.studentEmail = student.email;
        app.studentPhone = student.phone;
        app.studentCollege = profile.college != null ? profile.college : "N/A";
        app.studentUniversity = profile.university != null ? profile.university : "N/A";
        app.studentDegree = profile.degree != null ? profile.degree : "N/A";
        app.studentDepartment = profile.department != null ? profile.department : "N/A";
        app.studentGradYear = profile.graduationYear != null ? profile.graduationYear : 2026;
        app.studentCgpa = profile.cgpa != null ? profile.cgpa : 0.0;
        app.studentBacklogs = profile.backlogs != null ? profile.backlogs : 0;
        app.studentSkills = profile.skills != null ? profile.skills : "";
        app.studentResumeUrl = profile.resumeUrl != null ? profile.resumeUrl : "";

        app.eligibilityStatus = isEligible ? "ELIGIBLE" : "NOT_ELIGIBLE";
        app.eligibilityReasons = String.join("; ", reasons);

        Application savedApp = apps.save(app);

        Notification n = new Notification();
        n.user = student;
        n.message = "Application submitted for " + job.title + " at " + job.company + ". Status: " + app.eligibilityStatus;
        notifications.save(n);

        return ResponseEntity.ok(savedApp);
    }

    @GetMapping("/applications/student/{id}")
    public List<Application> getStudentApplications(@PathVariable Long id) {
        return apps.findByStudentId(id);
    }

    @GetMapping("/applications/job/{id}")
    public List<Application> getJobApplications(@PathVariable Long id) {
        return apps.findByJobId(id);
    }

    @PutMapping("/applications/{id}/status")
    public Application updateApplicationStatus(@PathVariable Long id, @RequestParam String value) {
        Application application = apps.findById(id).orElseThrow();
        application.status = value;
        Application savedApp = apps.save(application);

        Notification n = new Notification();
        n.user = application.student;
        n.message = "Your application status for " + application.job.title + " at " + application.job.company + " updated to: " + value;
        notifications.save(n);

        return savedApp;
    }

    // ============================================================
    // PLACEMENT OFFICER EXCEL APPLICATION SPREADSHEET EXPORT
    // ============================================================

    @GetMapping("/placement-drives/{id}/export-excel")
    public ResponseEntity<byte[]> exportApplicationsExcel(@PathVariable Long id) {
        Job job = jobs.findById(id).orElseThrow();
        List<Application> applicationList = apps.findByJobId(id);

        StringBuilder csv = new StringBuilder();
        // CSV Headers (No password or sensitive credentials included)
        csv.append("Application ID,Applied Date,Student Name,Student Email,Phone,College,University,Degree,Department,Graduation Year,CGPA,Backlogs,Skills,Eligibility Status,Application Status,Resume URL\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (Application a : applicationList) {
            String appliedDate = a.appliedAt != null ? a.appliedAt.format(dtf) : "N/A";
            String name = cleanCsv(a.studentName != null ? a.studentName : (a.student != null ? a.student.name : ""));
            String email = cleanCsv(a.studentEmail != null ? a.studentEmail : (a.student != null ? a.student.email : ""));
            String phone = cleanCsv(a.studentPhone != null ? a.studentPhone : (a.student != null ? a.student.phone : ""));
            String college = cleanCsv(a.studentCollege);
            String uni = cleanCsv(a.studentUniversity);
            String degree = cleanCsv(a.studentDegree);
            String dept = cleanCsv(a.studentDepartment);
            String gradYear = a.studentGradYear != null ? a.studentGradYear.toString() : "2026";
            String cgpa = a.studentCgpa != null ? a.studentCgpa.toString() : "0.0";
            String backlogs = a.studentBacklogs != null ? a.studentBacklogs.toString() : "0";
            String skills = cleanCsv(a.studentSkills);
            String eligStatus = cleanCsv(a.eligibilityStatus);
            String appStatus = cleanCsv(a.status);
            String resume = cleanCsv(a.studentResumeUrl);

            csv.append(String.format("APP%04d,%s,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%s,\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    a.id, appliedDate, name, email, phone, college, uni, degree, dept, gradYear, cgpa, backlogs, skills, eligStatus, appStatus, resume));
        }

        byte[] csvBytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        String safeFileName = (job.company + "_" + job.title + "_Applications.csv").replaceAll("[^a-zA-Z0-9._-]", "_");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", safeFileName);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    private String cleanCsv(String input) {
        if (input == null) return "";
        return input.replace("\"", "\"\"");
    }

    // ============================================================
    // INTERVIEWS, SAVED JOBS, ANNOUNCEMENTS & NOTIFICATIONS
    // ============================================================

    @PostMapping("/interviews")
    public Interview scheduleInterview(@RequestBody Interview interview) {
        Interview savedInterview = interviews.save(interview);
        if (savedInterview.application != null && savedInterview.application.student != null) {
            Notification n = new Notification();
            n.user = savedInterview.application.student;
            n.message = "Interview scheduled for " + savedInterview.application.job.title + " on " + savedInterview.interviewAt.toString().replace("T", " ") + " (" + savedInterview.mode + ").";
            notifications.save(n);
        }
        return savedInterview;
    }

    @GetMapping("/interviews/student/{id}")
    public List<Interview> getStudentInterviews(@PathVariable Long id) {
        return interviews.findByApplicationStudentId(id);
    }

    @PostMapping("/saved-jobs")
    public SavedJob saveJob(@RequestParam Long studentId, @RequestParam Long jobId) {
        SavedJob savedJob = new SavedJob();
        savedJob.student = users.findById(studentId).orElseThrow();
        savedJob.job = jobs.findById(jobId).orElseThrow();
        return saved.save(savedJob);
    }

    @GetMapping("/saved-jobs/student/{id}")
    public List<SavedJob> getSavedJobs(@PathVariable Long id) {
        return saved.findByStudentId(id);
    }

    @DeleteMapping("/saved-jobs/{id}")
    public void unsaveJob(@PathVariable Long id) {
        saved.deleteById(id);
    }

    @GetMapping("/notifications/user/{id}")
    public List<Notification> getUserNotifications(@PathVariable Long id) {
        return notifications.findByUserIdOrderByCreatedAtDesc(id);
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markNotificationAsRead(@PathVariable Long id) {
        Notification notification = notifications.findById(id).orElseThrow();
        notification.readFlag = true;
        return notifications.save(notification);
    }

    @GetMapping("/announcements")
    public List<Announcement> getAnnouncements() {
        return announcements.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/announcements")
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        return announcements.save(announcement);
    }
}