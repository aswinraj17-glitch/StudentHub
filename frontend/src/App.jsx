import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiSearch, FiMapPin, FiBookmark, FiArrowRight, FiCheckCircle, FiXCircle, FiBell, FiUser, FiBriefcase, FiCalendar, FiFileText, FiAward, FiCode, FiLogOut, FiPlus, FiTrash2, FiEdit, FiCheck, FiX, FiShield, FiAlertTriangle, FiDownload, FiFilter, FiClock } from 'react-icons/fi';
import { api, user } from './api';

// ============================================================
// CONSTANT DROPDOWNS & VALIDATION OPTIONS
// ============================================================
const DEGREES = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'MBA', 'Other'];
const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'AI & DS', 'AI & ML', 'Cyber Security', 'Other'];
const PREDEFINED_SKILLS = ['Java', 'Spring Boot', 'React', 'JavaScript', 'Python', 'C', 'C++', 'SQL', 'HTML', 'CSS', 'Git', 'GitHub', 'REST API', 'MySQL', 'Data Analysis'];

export const isValidStudentEmail = (email) => {
  if (!email) return false;
  return /^[eE]\d{2}[a-zA-Z]{2,5}\d{3,4}@shanmugha\.edu\.in$/i.test(email.trim());
};

// ============================================================
// TOAST NOTIFICATION CONTAINER
// ============================================================
let toastTrigger = null;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastTrigger = (message, type = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
  }, []);

  return (
    <div className="toastContainer">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export const showToast = (message, type = 'success') => {
  if (toastTrigger) toastTrigger(message, type);
};

// ============================================================
// NAVBAR WITH ROLE & NOTIFICATIONS DROPDOWN
// ============================================================
const Layout = ({ children }) => {
  const u = user();
  const nav = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (u?.id) {
      api.get(`/notifications/user/${u.id}`).then((r) => setNotifications(r.data)).catch(() => {});
    }
  }, [u?.id]);

  const unreadCount = notifications.filter((n) => !n.readFlag).length;

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n)));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('studenthubUser');
    showToast('Logged out successfully');
    nav('/');
  };

  return (
    <>
      <header>
        <Link className="logo" to="/">
          Student<span>Hub</span>
        </Link>

        <nav>
          {u?.role === 'STUDENT' && (
            <>
              <Link to="/student/dashboard" className={location.pathname === '/student/dashboard' ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/student/placement-drives" className={location.pathname === '/student/placement-drives' ? 'active' : ''}>
                Placement Drives
              </Link>
              <Link to="/student/applications" className={location.pathname === '/student/applications' ? 'active' : ''}>
                My Applications
              </Link>
              <Link to="/student/profile" className={location.pathname === '/student/profile' ? 'active' : ''}>
                Profile
              </Link>
            </>
          )}

          {u?.role === 'OFFICER' && (
            <>
              <Link to="/officer/dashboard" className={location.pathname === '/officer/dashboard' ? 'active' : ''}>
                Officer Dashboard
              </Link>
            </>
          )}

          {u?.role === 'ADMIN' && (
            <>
              <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                Admin Console
              </Link>
            </>
          )}
        </nav>

        <div className="navRight">
          {u ? (
            <>
              <div className="notifWrapper">
                <button className="notifBell" onClick={() => setShowNotif(!showNotif)}>
                  <FiBell />
                  {unreadCount > 0 && <span className="notifBadge">{unreadCount}</span>}
                </button>
                {showNotif && (
                  <div className="notifDropdown">
                    <b style={{ display: 'block', marginBottom: '10px' }}>Notifications</b>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="notifItem" onClick={() => markRead(n.id)}>
                          <p style={{ margin: 0, fontWeight: n.readFlag ? '400' : '700' }}>{n.message}</p>
                          <small style={{ color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <span style={{ fontWeight: '700', fontSize: '14px' }}>Hi, {u.name?.split(' ')[0]}</span>

              <button className="link" onClick={handleLogout} title="Logout">
                <FiLogOut />
              </button>
            </>
          ) : (
            <Link className="btn sm" to="/">
              Role Selection
            </Link>
          )}
        </div>
      </header>

      {children}
      <ToastContainer />

      <footer>
        <b>
          Student<span>Hub</span>
        </b>
        <p>Modern College Placement & Recruitment Management Portal</p>
      </footer>
    </>
  );
};

// ============================================================
// 1. ROLE SELECTION LANDING PAGE
// ============================================================
function RoleSelection() {
  const nav = useNavigate();
  const u = user();

  useEffect(() => {
    if (u?.role === 'STUDENT') nav('/student/dashboard');
    else if (u?.role === 'OFFICER') nav('/officer/dashboard');
    else if (u?.role === 'ADMIN') nav('/admin/dashboard');
  }, [u, nav]);

  return (
    <Layout>
      <section className="landingHero">
        <small>CAMPUS RECRUITMENT PORTAL</small>
        <h1>
          Your Gateway to <span>Campus Opportunities</span>
        </h1>
        <p>Connect students, placement officers, and top recruiters on a single unified platform.</p>

        <div className="roleCards">
          <div className="roleCard">
            <div className="roleIcon">🎓</div>
            <h2>STUDENT</h2>
            <p>Discover internships, campus placement drives, build your professional profile, and track job applications.</p>
            <button className="btn wide" onClick={() => nav('/student/login')}>
              Continue as Student →
            </button>
            <p style={{ fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
              Need an account?{' '}
              <Link to="/student/register" style={{ color: 'var(--p)', fontWeight: '700' }}>
                Student Signup
              </Link>
            </p>
          </div>

          <div className="roleCard">
            <div className="roleIcon">🏢</div>
            <h2>PLACEMENT OFFICER</h2>
            <p>Manage campus recruitment, post placement drives, view eligible candidates, export applications to Excel, and schedule interviews.</p>
            <button className="btn wide" onClick={() => nav('/officer/login')}>
              Continue as Placement Officer →
            </button>
            <p style={{ fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
              New Officer?{' '}
              <Link to="/officer/register" style={{ color: 'var(--p)', fontWeight: '700' }}>
                Officer Register
              </Link>
            </p>
          </div>

          <div className="roleCard">
            <div className="roleIcon">🔐</div>
            <h2>ADMIN</h2>
            <p>Manage the StudentHub platform, approve placement officer registrations, monitor statistics, and manage users.</p>
            <button className="btn wide secondary" onClick={() => nav('/admin/login')}>
              Admin Login →
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// ============================================================
// 2. STUDENT AUTHENTICATION (LOGIN & SIGNUP WITH STRICT VALIDATION)
// ============================================================
function StudentLogin() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/student/login', { email: email.trim(), password: pass });
      localStorage.setItem('studenthubUser', JSON.stringify(r.data));
      showToast('Welcome back, ' + r.data.name + '!');
      nav('/student/dashboard');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <Layout>
      <div className="auth">
        <div className="panel authCard">
          <div className="authIcon">🎓</div>
          <h1>Student Login</h1>
          <p className="muted">Sign in to access your placement dashboard and job applications.</p>

          <form onSubmit={handleLogin}>
            <label>
              College Student Email Address
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e23cs010@shanmugha.edu.in" />
            </label>
            <label>
              Password
              <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            </label>

            {msg && <div className="notice" style={{ background: '#fef2f2', color: '#991b1b' }}>{msg}</div>}

            <button className="btn wide">Sign In as Student</button>
          </form>

          <p className="demo">
            New Student? <Link to="/student/register" style={{ color: 'var(--p)', fontWeight: '700' }}>Create Student Account</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

function StudentRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: 'Sri Shanmugha College of Engineering and Technology',
    department: 'CSE',
    degree: 'B.E.',
    graduationYear: 2026
  });
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict Input Validation
    if (!/^[a-zA-Z\s.'-]+$/.test(form.name) || form.name.trim().length < 3) {
      return setMsg('Full Name must contain at least 3 alphabetic letters (no numbers or symbols).');
    }
    if (!isValidStudentEmail(form.email)) {
      return setMsg('Registration is restricted to students of Sri Shanmugha College of Engineering and Technology. Please use your valid college student email ID.');
    }
    if (!/^[0-9]{10,15}$/.test(form.phone)) {
      return setMsg('Phone Number must be a valid 10-digit numeric phone number.');
    }
    if (form.password.length < 8) {
      return setMsg('Password must be at least 8 characters long.');
    }
    if (form.password !== form.confirmPassword) {
      return setMsg('Passwords do not match.');
    }

    try {
      await api.post('/auth/student/register', form);
      showToast('Student account created successfully! Please log in.');
      nav('/student/login');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <Layout>
      <div className="auth">
        <div className="panel authCard" style={{ width: 'min(580px, 100%)' }}>
          <div className="authIcon">🎓</div>
          <h1>Student Signup</h1>
          <p className="muted">Create your StudentHub account with your official college student email ID.</p>

          <form onSubmit={handleSubmit}>
            <div className="formGrid">
              <label className="formGroup full">
                Full Name *
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aswin Raj" />
              </label>

              <label className="formGroup full">
                College Student Email ID (e.g. e23cs010@shanmugha.edu.in) *
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e23cs010@shanmugha.edu.in" />
              </label>

              <label className="formGroup">
                Phone Number (10 Digits) *
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
              </label>

              <label className="formGroup">
                Password (Min 8 Chars) *
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </label>

              <label className="formGroup">
                Confirm Password *
                <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" />
              </label>

              <label className="formGroup full">
                College Name *
                <input required value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Sri Shanmugha College of Engineering and Technology" />
              </label>

              <label className="formGroup">
                Degree *
                <select value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })}>
                  {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <label className="formGroup">
                Department *
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <label className="formGroup full">
                Graduation Year *
                <input type="number" required value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) })} placeholder="2026" />
              </label>
            </div>

            {msg && <div className="notice" style={{ background: '#fef2f2', color: '#991b1b', marginTop: '15px' }}>{msg}</div>}

            <button className="btn wide" style={{ marginTop: '20px' }}>Register Student Account</button>
          </form>

          <p className="demo">
            Already registered? <Link to="/student/login" style={{ color: 'var(--p)', fontWeight: '700' }}>Student Login</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// 3. STUDENT PROFILE WIZARD & DYNAMIC COMPLETION CALCULATOR
// ============================================================
function StudentProfileWizard() {
  const u = user();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    fullName: u?.name || '',
    photoUrl: '',
    email: u?.email || '',
    phone: u?.phone || '',
    dob: '',
    gender: 'Male',
    location: '',
    college: '',
    university: '',
    degree: 'B.E.',
    department: 'CSE',
    batch: '2022-2026',
    graduationYear: 2026,
    currentSemester: 'Semester 7',
    cgpa: 8.0,
    backlogs: 0,
    tenthPercentage: 90.0,
    twelfthPercentage: 88.0,
    skills: 'Java, Spring Boot, React, SQL',
    projectsJson: '[]',
    certificationsJson: '[]',
    resumeUrl: ''
  });

  const [skillsList, setSkillsList] = useState(['Java', 'Spring Boot', 'React', 'SQL']);
  const [selectedSkill, setSelectedSkill] = useState('Java');
  const [customSkill, setCustomSkill] = useState('');

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', tech: '', github: '' });

  const [certs, setCerts] = useState([]);
  const [certForm, setCertForm] = useState({ name: '', org: '', date: '', url: '' });

  useEffect(() => {
    if (u?.id) {
      api.get(`/students/${u.id}/profile-wizard`).then((r) => {
        const d = r.data;
        setProfile({
          ...d,
          fullName: d.fullName || d.user?.name || u?.name || '',
          email: d.email || u?.email || '',
          phone: d.phone || u?.phone || '',
          tenthPercentage: d.tenthPercentage !== undefined && d.tenthPercentage !== null ? d.tenthPercentage : 90.0,
          twelfthPercentage: d.twelfthPercentage !== undefined && d.twelfthPercentage !== null ? d.twelfthPercentage : 88.0
        });
        if (d.skills) setSkillsList(d.skills.split(',').map((s) => s.trim()).filter(Boolean));
        if (d.projectsJson) {
          try { setProjects(JSON.parse(d.projectsJson)); } catch (e) {}
        }
        if (d.certificationsJson) {
          try { setCerts(JSON.parse(d.certificationsJson)); } catch (e) {}
        }
        if (d.completionPercentage === 100) {
          setIsCompleted(true);
        }
      });
    }
  }, [u?.id]);

  const validateStep = (s) => {
    let errs = {};
    if (s === 1) {
      if (!profile.fullName?.trim()) errs.fullName = 'Full Name is required.';
      if (!profile.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Valid Email Address is required.';
      if (!profile.phone?.trim() || !/^[0-9]{10,15}$/.test(profile.phone)) errs.phone = 'Valid 10-digit Phone Number is required.';
      if (!profile.dob?.trim()) errs.dob = 'Date of Birth is required.';
      if (!profile.gender?.trim()) errs.gender = 'Gender selection is required.';
      if (!profile.location?.trim()) errs.location = 'Current Location is required.';
      if (!profile.photoUrl?.trim()) errs.photoUrl = 'Profile Photo URL is required.';
    } else if (s === 2) {
      if (!profile.college?.trim()) errs.college = 'College Name is required.';
      if (!profile.university?.trim()) errs.university = 'University Name is required.';
      if (!profile.degree?.trim()) errs.degree = 'Degree selection is required.';
      if (!profile.department?.trim()) errs.department = 'Department selection is required.';
      if (!profile.graduationYear || profile.graduationYear < 2000 || profile.graduationYear > 2035) errs.graduationYear = 'Valid Graduation Year is required.';
      if (!profile.currentSemester?.trim()) errs.currentSemester = 'Current Semester is required.';
    } else if (s === 3) {
      if (profile.cgpa === '' || profile.cgpa === null || isNaN(profile.cgpa) || profile.cgpa < 0.0 || profile.cgpa > 10.0) {
        errs.cgpa = 'CGPA must be between 0 and 10.';
      }
      if (profile.backlogs === '' || profile.backlogs === null || isNaN(profile.backlogs) || profile.backlogs < 0) {
        errs.backlogs = 'Backlogs count cannot be negative.';
      }
      if (profile.tenthPercentage === '' || profile.tenthPercentage === null || isNaN(profile.tenthPercentage) || profile.tenthPercentage <= 0.0 || profile.tenthPercentage > 100.0) {
        errs.tenthPercentage = '10th Percentage must be between 0 and 100.';
      }
      if (profile.twelfthPercentage === '' || profile.twelfthPercentage === null || isNaN(profile.twelfthPercentage) || profile.twelfthPercentage <= 0.0 || profile.twelfthPercentage > 100.0) {
        errs.twelfthPercentage = '12th Percentage must be between 0 and 100.';
      }
    } else if (s === 4) {
      if (!skillsList || skillsList.length === 0) errs.skills = 'At least one skill is mandatory.';
    } else if (s === 5) {
      if (!projects || projects.length === 0) errs.projects = 'At least one complete project is mandatory.';
    } else if (s === 6) {
      if (!certs || certs.length === 0) errs.certs = 'At least one certification is mandatory.';
    } else if (s === 7) {
      if (!profile.resumeUrl?.trim()) {
        errs.resumeUrl = 'Resume file URL is required.';
      } else if (!profile.resumeUrl.toLowerCase().endsWith('.pdf') && !profile.resumeUrl.toLowerCase().includes('pdf')) {
        errs.resumeUrl = 'Only PDF files/links are accepted for Resume.';
      }
    }
    return errs;
  };

  const saveStepData = async () => {
    try {
      const payload = {
        ...profile,
        skills: skillsList.join(', '),
        projectsJson: JSON.stringify(projects),
        certificationsJson: JSON.stringify(certs)
      };
      const res = await api.put(`/students/${u.id}/profile-wizard`, payload);
      setProfile(res.data);
      showToast('Step progress saved to database!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not save profile step', 'error');
    }
  };

  const handleNext = async () => {
    const stepErrs = validateStep(step);
    setErrors(stepErrs);
    if (Object.keys(stepErrs).length > 0) {
      showToast('Please complete all required fields correctly before continuing.', 'error');
      return;
    }

    await saveStepData();

    if (step < 8) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const addSkill = () => {
    const sk = customSkill.trim() || selectedSkill;
    if (sk && !skillsList.includes(sk)) {
      setSkillsList([...skillsList, sk]);
      setCustomSkill('');
      setErrors((prev) => ({ ...prev, skills: null }));
    }
  };

  const removeSkill = (sk) => {
    const updated = skillsList.filter((s) => s !== sk);
    setSkillsList(updated);
    if (updated.length === 0) {
      setErrors((prev) => ({ ...prev, skills: 'At least one skill is mandatory.' }));
    }
  };

  const addProject = () => {
    if (!projectForm.name.trim()) return showToast('Project Name is required', 'error');
    if (!projectForm.description.trim()) return showToast('Project Description is required', 'error');
    if (!projectForm.tech.trim()) return showToast('Technologies Used is required', 'error');
    if (!projectForm.github.trim()) return showToast('GitHub Link is required', 'error');

    const updated = [...projects, projectForm];
    setProjects(updated);
    setProjectForm({ name: '', description: '', tech: '', github: '' });
    setErrors((prev) => ({ ...prev, projects: null }));
    showToast('Project added!');
  };

  const removeProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    if (updated.length === 0) {
      setErrors((prev) => ({ ...prev, projects: 'At least one complete project is mandatory.' }));
    }
  };

  const addCert = () => {
    if (!certForm.name.trim()) return showToast('Certificate Name is required', 'error');
    if (!certForm.org.trim()) return showToast('Issuing Organization is required', 'error');
    if (!certForm.date.trim()) return showToast('Issue Date is required', 'error');
    if (!certForm.url.trim()) return showToast('Credential Link is required', 'error');

    const updated = [...certs, certForm];
    setCerts(updated);
    setCertForm({ name: '', org: '', date: '', url: '' });
    setErrors((prev) => ({ ...prev, certs: null }));
    showToast('Certification added!');
  };

  const removeCert = (index) => {
    const updated = certs.filter((_, i) => i !== index);
    setCerts(updated);
    if (updated.length === 0) {
      setErrors((prev) => ({ ...prev, certs: 'At least one certification is mandatory.' }));
    }
  };

  const handleFinalSubmit = async () => {
    if (!isConfirmed) {
      return showToast('Please check the confirmation box before final submission.', 'error');
    }

    // Final validation across all 7 steps
    for (let s = 1; s <= 7; s++) {
      const errs = validateStep(s);
      if (Object.keys(errs).length > 0) {
        setStep(s);
        setErrors(errs);
        return showToast(`Please complete all required fields in Step ${s} before submitting.`, 'error');
      }
    }

    try {
      const payload = {
        ...profile,
        skills: skillsList.join(', '),
        projectsJson: JSON.stringify(projects),
        certificationsJson: JSON.stringify(certs)
      };
      const res = await api.put(`/students/${u.id}/profile-wizard`, payload);
      setProfile({ ...res.data, completionPercentage: 100 });
      setIsCompleted(true);
      showToast('🎉 Student Profile completed successfully!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not complete profile submission', 'error');
    }
  };

  const stepsList = [
    { num: 1, name: 'Personal' },
    { num: 2, name: 'College' },
    { num: 3, name: 'Education' },
    { num: 4, name: 'Skills' },
    { num: 5, name: 'Projects' },
    { num: 6, name: 'Certifications' },
    { num: 7, name: 'Resume' },
    { num: 8, name: 'Review & Submit' }
  ];

  if (isCompleted) {
    return (
      <Layout>
        <div className="wizardContainer">
          <div className="wizardCard" style={{ maxWidth: '650px', margin: '40px auto', padding: '50px 35px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h1 style={{ font: '800 30px "Plus Jakarta Sans"', color: 'var(--ink)' }}>Profile Completed Successfully!</h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: '15px 0 25px' }}>
              Your StudentHub profile is ready and 100% verified. You can now apply for all eligible campus placement drives.
            </p>

            <div className="progressBarContainer" style={{ height: '14px', marginBottom: '20px' }}>
              <div className="progressBarFill" style={{ width: '100%' }} />
            </div>

            <p style={{ font: '800 18px "Plus Jakarta Sans"', color: '#10b981', marginBottom: '30px' }}>
              Profile Completion: 100%
            </p>

            <button className="btn wide" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => nav('/student/dashboard')}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="wizardContainer">
        <div className="wizardHeader">
          <small style={{ fontWeight: '700', color: 'var(--p)' }}>STUDENT PROFILE CREATION WIZARD</small>
          <h1>Create Your Student Profile</h1>
          <p className="muted" style={{ margin: 0 }}>Every field marked with <span style={{ color: '#dc2626', fontWeight: 'bold' }}>*</span> is mandatory for 100% completion.</p>
        </div>

        {/* Dynamic Completion Banner */}
        <div className="completionBanner">
          <div>
            <h3>Profile Completion: {profile.completionPercentage || 15}%</h3>
            <p style={{ fontSize: '13px' }}>* Required field — All profile fields must be completed correctly to apply for drives.</p>
          </div>
          <div style={{ width: '220px' }}>
            <div className="progressBarContainer">
              <div className="progressBarFill" style={{ width: `${profile.completionPercentage || 15}%` }} />
            </div>
          </div>
        </div>

        <div className="wizardLayoutGrid">
          {/* Desktop Step Indicator Sidebar */}
          <div className="wizardSidebar">
            <div className="sidebarTitle">
              <FiCheckCircle /> Profile Steps
            </div>
            <div className="sidebarStepList">
              {stepsList.map((st) => {
                const isDone = step > st.num;
                const isCurr = step === st.num;
                return (
                  <button
                    key={st.num}
                    className={`sidebarStepItem ${isCurr ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                    onClick={() => {
                      if (st.num < step) setStep(st.num);
                    }}
                  >
                    <div className="sidebarStepIcon">
                      {isDone ? '✓' : isCurr ? '●' : '○'}
                    </div>
                    <span>Step {st.num} — {st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Card */}
          <div className="wizardCard">
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 1 — Personal Information</h2>
                <p className="muted" style={{ marginBottom: '25px', fontSize: '14px' }}>Enter your full identity and contact details.</p>

                <div className="formGrid">
                  <div className="formGroup full">
                    <label>
                      Full Name <span style={{ color: '#dc2626' }}>*</span>
                      {profile.fullName?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.fullName || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, fullName: e.target.value });
                        setErrors((prev) => ({ ...prev, fullName: null }));
                      }}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <div className="fieldErrorText">⚠ {errors.fullName}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Email Address <span style={{ color: '#dc2626' }}>*</span>
                      {profile.email?.trim() && !errors.email && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, email: e.target.value });
                        setErrors((prev) => ({ ...prev, email: null }));
                      }}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <div className="fieldErrorText">⚠ {errors.email}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Phone Number <span style={{ color: '#dc2626' }}>*</span>
                      {profile.phone?.trim() && !errors.phone && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.phone || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, phone: e.target.value });
                        setErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      placeholder="Enter 10-digit phone number"
                    />
                    {errors.phone && <div className="fieldErrorText">⚠ {errors.phone}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Date of Birth <span style={{ color: '#dc2626' }}>*</span>
                      {profile.dob?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="date"
                      value={profile.dob || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, dob: e.target.value });
                        setErrors((prev) => ({ ...prev, dob: null }));
                      }}
                    />
                    {errors.dob && <div className="fieldErrorText">⚠ {errors.dob}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Gender <span style={{ color: '#dc2626' }}>*</span>
                      {profile.gender && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <select
                      value={profile.gender || 'Male'}
                      onChange={(e) => {
                        setProfile({ ...profile, gender: e.target.value });
                        setErrors((prev) => ({ ...prev, gender: null }));
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <div className="fieldErrorText">⚠ {errors.gender}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Current Location <span style={{ color: '#dc2626' }}>*</span>
                      {profile.location?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.location || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, location: e.target.value });
                        setErrors((prev) => ({ ...prev, location: null }));
                      }}
                      placeholder="e.g. Chennai, Tamil Nadu"
                    />
                    {errors.location && <div className="fieldErrorText">⚠ {errors.location}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Profile Photo URL <span style={{ color: '#dc2626' }}>*</span>
                      {profile.photoUrl?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.photoUrl || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, photoUrl: e.target.value });
                        setErrors((prev) => ({ ...prev, photoUrl: null }));
                      }}
                      placeholder="https://example.com/photo.jpg"
                    />
                    {errors.photoUrl && <div className="fieldErrorText">⚠ {errors.photoUrl}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COLLEGE INFORMATION */}
            {step === 2 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 2 — College Information</h2>
                <p className="muted" style={{ marginBottom: '25px', fontSize: '14px' }}>Specify your institution and graduation details.</p>

                <div className="formGrid">
                  <div className="formGroup full">
                    <label>
                      College Name <span style={{ color: '#dc2626' }}>*</span>
                      {profile.college?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.college || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, college: e.target.value });
                        setErrors((prev) => ({ ...prev, college: null }));
                      }}
                      placeholder="e.g. Anna University Campus"
                    />
                    {errors.college && <div className="fieldErrorText">⚠ {errors.college}</div>}
                  </div>

                  <div className="formGroup full">
                    <label>
                      University <span style={{ color: '#dc2626' }}>*</span>
                      {profile.university?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.university || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, university: e.target.value });
                        setErrors((prev) => ({ ...prev, university: null }));
                      }}
                      placeholder="e.g. Anna University"
                    />
                    {errors.university && <div className="fieldErrorText">⚠ {errors.university}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Degree <span style={{ color: '#dc2626' }}>*</span>
                      {profile.degree && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <select
                      value={profile.degree || 'B.E.'}
                      onChange={(e) => {
                        setProfile({ ...profile, degree: e.target.value });
                        setErrors((prev) => ({ ...prev, degree: null }));
                      }}
                    >
                      {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.degree && <div className="fieldErrorText">⚠ {errors.degree}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Department <span style={{ color: '#dc2626' }}>*</span>
                      {profile.department && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <select
                      value={profile.department || 'CSE'}
                      onChange={(e) => {
                        setProfile({ ...profile, department: e.target.value });
                        setErrors((prev) => ({ ...prev, department: null }));
                      }}
                    >
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.department && <div className="fieldErrorText">⚠ {errors.department}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Graduation Year <span style={{ color: '#dc2626' }}>*</span>
                      {profile.graduationYear && !errors.graduationYear && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="number"
                      value={profile.graduationYear || 2026}
                      onChange={(e) => {
                        setProfile({ ...profile, graduationYear: parseInt(e.target.value) || '' });
                        setErrors((prev) => ({ ...prev, graduationYear: null }));
                      }}
                      placeholder="2026"
                    />
                    {errors.graduationYear && <div className="fieldErrorText">⚠ {errors.graduationYear}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Current Semester <span style={{ color: '#dc2626' }}>*</span>
                      {profile.currentSemester?.trim() && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      value={profile.currentSemester || ''}
                      onChange={(e) => {
                        setProfile({ ...profile, currentSemester: e.target.value });
                        setErrors((prev) => ({ ...prev, currentSemester: null }));
                      }}
                      placeholder="e.g. Semester 7"
                    />
                    {errors.currentSemester && <div className="fieldErrorText">⚠ {errors.currentSemester}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EDUCATION INFORMATION */}
            {step === 3 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 3 — Academic / Education Information</h2>
                <p className="muted" style={{ marginBottom: '25px', fontSize: '14px' }}>Provide your academic performance scores.</p>

                <div className="formGrid">
                  <div className="formGroup">
                    <label>
                      CGPA (0.0 to 10.0) <span style={{ color: '#dc2626' }}>*</span>
                      {profile.cgpa >= 0 && profile.cgpa <= 10 && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.cgpa !== undefined && profile.cgpa !== null ? profile.cgpa : ''}
                      onChange={(e) => {
                        setProfile({ ...profile, cgpa: parseFloat(e.target.value) });
                        setErrors((prev) => ({ ...prev, cgpa: null }));
                      }}
                      placeholder="e.g. 8.5"
                    />
                    {errors.cgpa && <div className="fieldErrorText">⚠ {errors.cgpa}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      Number of Backlogs <span style={{ color: '#dc2626' }}>*</span>
                      {profile.backlogs >= 0 && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="number"
                      value={profile.backlogs !== undefined && profile.backlogs !== null ? profile.backlogs : 0}
                      onChange={(e) => {
                        setProfile({ ...profile, backlogs: parseInt(e.target.value) });
                        setErrors((prev) => ({ ...prev, backlogs: null }));
                      }}
                      placeholder="0"
                    />
                    {errors.backlogs && <div className="fieldErrorText">⚠ {errors.backlogs}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      10th Percentage <span style={{ color: '#dc2626' }}>*</span>
                      {profile.tenthPercentage > 0 && profile.tenthPercentage <= 100 && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.tenthPercentage !== undefined && profile.tenthPercentage !== null ? profile.tenthPercentage : ''}
                      onChange={(e) => {
                        setProfile({ ...profile, tenthPercentage: parseFloat(e.target.value) });
                        setErrors((prev) => ({ ...prev, tenthPercentage: null }));
                      }}
                      placeholder="e.g. 92.5"
                    />
                    {errors.tenthPercentage && <div className="fieldErrorText">⚠ {errors.tenthPercentage}</div>}
                  </div>

                  <div className="formGroup">
                    <label>
                      12th Percentage <span style={{ color: '#dc2626' }}>*</span>
                      {profile.twelfthPercentage > 0 && profile.twelfthPercentage <= 100 && <span className="fieldValidCheck">✓</span>}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.twelfthPercentage !== undefined && profile.twelfthPercentage !== null ? profile.twelfthPercentage : ''}
                      onChange={(e) => {
                        setProfile({ ...profile, twelfthPercentage: parseFloat(e.target.value) });
                        setErrors((prev) => ({ ...prev, twelfthPercentage: null }));
                      }}
                      placeholder="e.g. 88.0"
                    />
                    {errors.twelfthPercentage && <div className="fieldErrorText">⚠ {errors.twelfthPercentage}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SKILLS */}
            {step === 4 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 4 — Skills <span style={{ color: '#dc2626' }}>*</span></h2>
                <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>At least one technical skill is mandatory. Select or type skills to add.</p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <select
                    style={{ flex: 1, minWidth: '180px', padding: '12px', border: '1px solid var(--line)', borderRadius: '10px', font: 'inherit' }}
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    {PREDEFINED_SKILLS.map((sk) => <option key={sk} value={sk}>{sk}</option>)}
                  </select>
                  <input
                    style={{ flex: 1, minWidth: '180px', padding: '12px', border: '1px solid var(--line)', borderRadius: '10px', font: 'inherit' }}
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Or type custom skill..."
                  />
                  <button className="btn" onClick={addSkill}>
                    <FiPlus /> Add Skill
                  </button>
                </div>

                <div className="skillTags" style={{ minHeight: '60px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {skillsList.map((sk) => (
                    <span key={sk} className="skillTag">
                      {sk}
                      <button onClick={() => removeSkill(sk)}>×</button>
                    </span>
                  ))}
                  {skillsList.length === 0 && (
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>No skills added yet. Please add at least one skill.</span>
                  )}
                </div>

                {errors.skills && <div className="fieldErrorText" style={{ marginTop: '12px' }}>⚠ {errors.skills}</div>}
              </div>
            )}

            {/* STEP 5: PROJECTS */}
            {step === 5 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 5 — Projects <span style={{ color: '#dc2626' }}>*</span></h2>
                <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>At least one complete project is mandatory.</p>

                <div className="formGrid" style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                  <div className="formGroup full">
                    <label>Project Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      placeholder="e.g. StudentHub Placement Portal"
                    />
                  </div>

                  <div className="formGroup full">
                    <label>Technologies Used <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={projectForm.tech}
                      onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                      placeholder="e.g. React • Spring Boot • MySQL"
                    />
                  </div>

                  <div className="formGroup full">
                    <label>Project Description <span style={{ color: '#dc2626' }}>*</span></label>
                    <textarea
                      rows={2}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Summary of system architecture and features..."
                    />
                  </div>

                  <div className="formGroup full">
                    <label>GitHub Link <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={projectForm.github}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <button className="btn full" onClick={addProject} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <FiPlus /> Save Project Card
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {projects.map((p, idx) => (
                    <div key={idx} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px' }}>
                      <div>
                        <h4 style={{ margin: 0, font: '700 16px "Plus Jakarta Sans"' }}>{p.name}</h4>
                        <p style={{ margin: '4px 0', color: 'var(--p)', fontSize: '13px', fontWeight: '700' }}>{p.tech}</p>
                        <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--muted)' }}>{p.description}</p>
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--p)', fontWeight: '600' }}>
                            🔗 {p.github}
                          </a>
                        )}
                      </div>
                      <button className="btn danger sm" onClick={() => removeProject(idx)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '14px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                      No projects added yet. Please fill out the form above to add a project.
                    </div>
                  )}
                </div>

                {errors.projects && <div className="fieldErrorText" style={{ marginTop: '15px' }}>⚠ {errors.projects}</div>}
              </div>
            )}

            {/* STEP 6: CERTIFICATIONS */}
            {step === 6 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 6 — Certifications <span style={{ color: '#dc2626' }}>*</span></h2>
                <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>At least one certification is mandatory.</p>

                <div className="formGrid" style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                  <div className="formGroup">
                    <label>Certificate Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Issuing Organization <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={certForm.org}
                      onChange={(e) => setCertForm({ ...certForm, org: e.target.value })}
                      placeholder="e.g. Amazon Web Services / NPTEL"
                    />
                  </div>

                  <div className="formGroup">
                    <label>Issue Date <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="date"
                      value={certForm.date}
                      onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                    />
                  </div>

                  <div className="formGroup">
                    <label>Credential Link <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      value={certForm.url}
                      onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
                      placeholder="https://credential-link.com/verify"
                    />
                  </div>

                  <button className="btn" onClick={addCert} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <FiPlus /> Save Certification Card
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                  {certs.map((c, idx) => (
                    <div key={idx} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                      <div>
                        <h4 style={{ margin: 0, font: '700 16px "Plus Jakarta Sans"' }}>{c.name}</h4>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: 'var(--muted)' }}>{c.org} {c.date ? `• Issued ${c.date}` : ''}</p>
                        {c.url && (
                          <a href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--p)', fontWeight: '600' }}>
                            🔗 Credential Link
                          </a>
                        )}
                      </div>
                      <button className="btn danger sm" onClick={() => removeCert(idx)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  {certs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '14px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                      No certifications added yet. Please fill out the form above.
                    </div>
                  )}
                </div>

                {errors.certs && <div className="fieldErrorText" style={{ marginTop: '15px' }}>⚠ {errors.certs}</div>}
              </div>
            )}

            {/* STEP 7: RESUME */}
            {step === 7 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '8px' }}>Step 7 — Resume <span style={{ color: '#dc2626' }}>*</span></h2>
                <p className="muted" style={{ marginBottom: '20px', fontSize: '14px' }}>Attach your PDF resume URL. Only PDF files/links are accepted.</p>

                <div className="formGroup full">
                  <label>
                    Resume File URL (PDF format only) <span style={{ color: '#dc2626' }}>*</span>
                    {profile.resumeUrl?.trim() && !errors.resumeUrl && <span className="fieldValidCheck">✓</span>}
                  </label>
                  <input
                    value={profile.resumeUrl || ''}
                    onChange={(e) => {
                      setProfile({ ...profile, resumeUrl: e.target.value });
                      setErrors((prev) => ({ ...prev, resumeUrl: null }));
                    }}
                    placeholder="https://example.com/resumes/my_resume.pdf"
                  />
                  {errors.resumeUrl && <div className="fieldErrorText">⚠ {errors.resumeUrl}</div>}
                </div>

                {profile.resumeUrl && !errors.resumeUrl && (
                  <div className="panel" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FiFileText style={{ fontSize: '24px', color: '#10b981' }} />
                      <div>
                        <b style={{ color: '#065f46' }}>Resume Attached (PDF)</b>
                        <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>{profile.resumeUrl}</p>
                      </div>
                    </div>
                    <a className="btn sm" href={profile.resumeUrl} target="_blank" rel="noreferrer">
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* STEP 8: REVIEW & SUBMIT */}
            {step === 8 && (
              <div>
                <h2 style={{ font: '800 22px "Plus Jakarta Sans"', marginBottom: '6px' }}>Step 8 — Review & Submit Profile</h2>
                <p className="muted" style={{ marginBottom: '25px', fontSize: '14px' }}>Please review all sections carefully before final submission.</p>

                {/* Section 1 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Personal Information</h3>
                    <button className="btn sm secondary" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><b>Full Name:</b> {profile.fullName || '—'}</div>
                    <div><b>Email:</b> {profile.email || '—'}</div>
                    <div><b>Phone:</b> {profile.phone || '—'}</div>
                    <div><b>DOB:</b> {profile.dob || '—'}</div>
                    <div><b>Gender:</b> {profile.gender || '—'}</div>
                    <div><b>Location:</b> {profile.location || '—'}</div>
                  </div>
                </div>

                {/* Section 2 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>College Information</h3>
                    <button className="btn sm secondary" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><b>College:</b> {profile.college || '—'}</div>
                    <div><b>University:</b> {profile.university || '—'}</div>
                    <div><b>Degree:</b> {profile.degree || '—'}</div>
                    <div><b>Department:</b> {profile.department || '—'}</div>
                    <div><b>Graduation Year:</b> {profile.graduationYear || '—'}</div>
                    <div><b>Current Semester:</b> {profile.currentSemester || '—'}</div>
                  </div>
                </div>

                {/* Section 3 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Academic & Education Information</h3>
                    <button className="btn sm secondary" onClick={() => setStep(3)}>Edit</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><b>CGPA:</b> {profile.cgpa}</div>
                    <div><b>Backlogs:</b> {profile.backlogs}</div>
                    <div><b>10th Percentage:</b> {profile.tenthPercentage}%</div>
                    <div><b>12th Percentage:</b> {profile.twelfthPercentage}%</div>
                  </div>
                </div>

                {/* Section 4 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Skills</h3>
                    <button className="btn sm secondary" onClick={() => setStep(4)}>Edit</button>
                  </div>
                  <div className="skillTags">
                    {skillsList.map((s) => <span key={s} className="skillTag">{s}</span>)}
                  </div>
                </div>

                {/* Section 5 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Projects</h3>
                    <button className="btn sm secondary" onClick={() => setStep(5)}>Edit</button>
                  </div>
                  {projects.map((p, i) => (
                    <div key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <b>• {p.name}</b> ({p.tech}) — <span className="muted">{p.description}</span>
                    </div>
                  ))}
                </div>

                {/* Section 6 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Certifications</h3>
                    <button className="btn sm secondary" onClick={() => setStep(6)}>Edit</button>
                  </div>
                  {certs.map((c, i) => (
                    <div key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <b>• {c.name}</b> ({c.org}) {c.date ? `- ${c.date}` : ''}
                    </div>
                  ))}
                </div>

                {/* Section 7 Review */}
                <div className="reviewSectionCard">
                  <div className="reviewSectionHeader">
                    <h3>Resume</h3>
                    <button className="btn sm secondary" onClick={() => setStep(7)}>Edit</button>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <b>PDF Resume:</b> {profile.resumeUrl}
                  </div>
                </div>

                {/* Mandatory Confirmation Checkbox */}
                <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '16px', borderRadius: '14px', margin: '25px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                    />
                    ☑ I confirm that all the profile information provided above is correct and accurate.
                  </label>
                </div>
              </div>
            )}

            {/* Wizard Actions */}
            <div className="wizardActions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
              <button className="btn secondary" onClick={handlePrev} disabled={step === 1}>
                ← Back
              </button>

              {step < 8 ? (
                <button className="btn" onClick={handleNext}>
                  Save & Continue →
                </button>
              ) : (
                <button className="btn" onClick={handleFinalSubmit} disabled={!isConfirmed} style={{ background: isConfirmed ? '#10b981' : '#94a3b8' }}>
                  Complete Profile 🎉
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// 4. STUDENT DASHBOARD & PLACEMENT DRIVES (WITH DEADLINE & ELIGIBILITY)
// ============================================================
function StudentDashboard() {
  const u = user();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [apps, setApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (u?.id) {
      api.get(`/students/${u.id}/profile-wizard`).then((r) => setProfile(r.data));
      api.get(`/applications/student/${u.id}`).then((r) => setApps(r.data));
      api.get(`/saved-jobs/student/${u.id}`).then((r) => setSavedJobs(r.data));
      api.get(`/interviews/student/${u.id}`).then((r) => setInterviews(r.data));
      api.get('/announcements').then((r) => setAnnouncements(r.data));
    }
  }, [u?.id]);

  if (!u) return <Layout><StudentLogin /></Layout>;

  const completionPct = profile?.completionPercentage || 20;

  return (
    <Layout>
      <main className="page">
        <small>STUDENT DASHBOARD</small>

        <div className="dashHead">
          <div>
            <h1 style={{ margin: '5px 0' }}>Good to see you, {u.name?.split(' ')[0]} 👋</h1>
            <p className="muted">Here is a real-time summary of your campus recruitment activity.</p>
          </div>
          <Link className="btn" to="/student/placement-drives">
            Explore Placement Drives →
          </Link>
        </div>

        {completionPct < 100 ? (
          <div className="completionBanner">
            <div>
              <h3>Welcome to StudentHub, {u.name}!</h3>
              <p>Your profile is currently <b>{completionPct}% complete</b>. Complete all required fields before applying.</p>
            </div>
            <button className="btn" onClick={() => nav('/student/profile-wizard')}>
              Complete My Profile
            </button>
          </div>
        ) : (
          <div className="notice" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCheckCircle style={{ color: '#10b981', fontSize: '20px' }} />
            <span>Your profile is 100% complete and fully verified! 🎉</span>
          </div>
        )}

        <div className="dashCards">
          <div className="dashCard">
            <span>Applications</span>
            <b>{apps.length}</b>
            <small className="muted">Submitted applications</small>
          </div>

          <div className="dashCard">
            <span>Saved Jobs</span>
            <b>{savedJobs.length}</b>
            <small className="muted">Saved opportunities</small>
          </div>

          <div className="dashCard">
            <span>Upcoming Interviews</span>
            <b>{interviews.length}</b>
            <small className="muted">Scheduled rounds</small>
          </div>

          <div className="dashCard">
            <span>Profile Completion</span>
            <b style={{ color: completionPct === 100 ? '#10b981' : 'var(--p)' }}>{completionPct}%</b>
            <small className="muted">{completionPct === 100 ? 'Verified Profile' : 'Action Required'}</small>
          </div>
        </div>

        <div className="two">
          <section className="panel">
            <h2>Recent Applications</h2>
            {apps.length === 0 ? (
              <div className="emptyState">
                <p>You haven't applied to any opportunities yet.</p>
                <Link className="btn sm" to="/student/placement-drives">Explore Drives</Link>
              </div>
            ) : (
              apps.map((a) => (
                <div key={a.id} className="app">
                  <div>
                    <b style={{ fontSize: '15px' }}>{a.job?.title}</b>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>{a.job?.company}</p>
                  </div>
                  <span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span>
                </div>
              ))
            )}
          </section>

          <section className="panel">
            <h2>Recommended Jobs</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ font: '700 15px "Plus Jakarta Sans"' }}>Java Developer</b>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: 'var(--muted)' }}>TechCorp Solutions • ₹8.5 LPA</p>
                  <small style={{ color: 'var(--p)', fontWeight: '600' }}>Java • Spring Boot • SQL</small>
                </div>
                <Link className="btn sm" to="/student/placement-drives">Apply →</Link>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ font: '700 15px "Plus Jakarta Sans"' }}>React Developer</b>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: 'var(--muted)' }}>WebFront Digital • ₹7.2 LPA</p>
                  <small style={{ color: 'var(--p)', fontWeight: '600' }}>React • JavaScript • CSS</small>
                </div>
                <Link className="btn sm" to="/student/placement-drives">Apply →</Link>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ font: '700 15px "Plus Jakarta Sans"' }}>Software Engineer</b>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: 'var(--muted)' }}>Innovate Cloud • ₹10.0 LPA</p>
                  <small style={{ color: 'var(--p)', fontWeight: '600' }}>Java • Python • Data Structures</small>
                </div>
                <Link className="btn sm" to="/student/placement-drives">Apply →</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

// Student Placement Drives Page with Eligibility Criteria & Deadline Checks
function StudentPlacementDrives() {
  const u = user();
  const [drives, setDrives] = useState([]);
  const [q, setQ] = useState('');
  const [eligibilityMap, setEligibilityMap] = useState({});
  const [selectedIneligible, setSelectedIneligible] = useState(null);

  useEffect(() => {
    api.get('/jobs', { params: { keyword: q } }).then(async (r) => {
      setDrives(r.data);
      if (u?.id) {
        const map = {};
        for (const d of r.data) {
          try {
            const res = await api.get(`/jobs/${d.id}/eligibility`, { params: { studentId: u.id } });
            map[d.id] = res.data;
          } catch (e) {}
        }
        setEligibilityMap(map);
      }
    });
  }, [q, u?.id]);

  const applyDrive = async (driveId) => {
    if (!u) return showToast('Please log in as student', 'error');
    try {
      await api.post('/applications', null, { params: { studentId: u.id, jobId: driveId } });
      showToast('Application submitted successfully!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not apply', 'error');
    }
  };

  return (
    <Layout>
      <main className="page">
        <small>CAMPUS RECRUITMENT DRIVES</small>
        <h1>Placement Drives & Opportunities</h1>
        <p className="muted">Browse placement drives with automatic eligibility verification and deadline checks.</p>

        <div className="search" style={{ margin: '25px 0' }}>
          <FiSearch style={{ margin: '0 10px', color: 'var(--muted)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drive title, company, or skills (e.g. Java, React)..." />
        </div>

        <div className="grid">
          {drives.map((d) => {
            const elig = eligibilityMap[d.id];
            const isEligible = elig?.eligible !== false;
            const isClosed = d.deadline && new Date(d.deadline) < new Date();

            return (
              <div key={d.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="avatar">{d.company?.slice(0, 2).toUpperCase()}</span>
                  {isClosed ? (
                    <span className="badge danger">Applications Closed</span>
                  ) : elig ? (
                    <span className={`badge ${isEligible ? 'eligible' : 'ineligible'}`}>
                      {isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                    </span>
                  ) : null}
                </div>

                <h3 style={{ margin: '15px 0 5px' }}>{d.title}</h3>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--muted)' }}>{d.company}</p>

                {/* ELIGIBILITY CRITERIA BLOCK */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px', margin: '15px 0', fontSize: '12px' }}>
                  <b style={{ color: 'var(--p)', display: 'block', marginBottom: '6px' }}>ELIGIBILITY CRITERIA:</b>
                  <div>• Min CGPA: <b>{d.minCgpa || '0.0'}</b> | Max Backlogs: <b>{d.maxBacklogs || 0}</b></div>
                  <div>• Degree: <b>{d.eligibleDegree}</b> | Dept: <b>{d.eligibleDepartment}</b></div>
                  <div>• Grad Year: <b>{d.eligibleGradYear}</b></div>
                </div>

                <div className="meta" style={{ margin: '10px 0', fontSize: '12px' }}>
                  <span><FiMapPin /> {d.location}</span>
                  <span><FiClock /> Deadline: {d.deadline || 'N/A'}</span>
                </div>

                <div className="tags">
                  {(d.skills || '').split(',').map((sk) => (
                    <i key={sk}>{sk.trim()}</i>
                  ))}
                </div>

                <div className="bottom">
                  <b>₹{d.salaryMin}–{d.salaryMax} LPA</b>
                  {isClosed ? (
                    <button className="btn sm secondary" disabled>
                      Closed
                    </button>
                  ) : isEligible ? (
                    <button className="btn sm" onClick={() => applyDrive(d.id)}>
                      Apply Now →
                    </button>
                  ) : (
                    <button className="btn sm secondary" onClick={() => setSelectedIneligible(elig)}>
                      View Reasons
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Eligibility Modal */}
        {selectedIneligible && (
          <div className="modalOverlay">
            <div className="modalCard">
              <div className="modalHeader">
                <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiAlertTriangle /> Eligibility Criteria Unmet
                </h2>
                <button className="closeBtn" onClick={() => setSelectedIneligible(null)}>×</button>
              </div>

              <p className="muted">You do not meet the minimum eligibility requirements for this placement drive:</p>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '15px', borderRadius: '12px', margin: '15px 0' }}>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b' }}>
                  {selectedIneligible.reasons?.map((r, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{r}</li>
                  ))}
                </ul>
              </div>

              <button className="btn wide" onClick={() => setSelectedIneligible(null)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

// Student Profile View Page
function StudentProfileView() {
  const u = user();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (u?.id) {
      api.get(`/students/${u.id}/profile-wizard`).then((r) => setProfile(r.data));
    }
  }, [u?.id]);

  if (!profile) return <Layout><div className="loading">Loading Profile...</div></Layout>;

  return (
    <Layout>
      <main className="page" style={{ maxWidth: '900px' }}>
        <div className="panel" style={{ padding: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '25px', marginBottom: '25px' }}>
            <div>
              <h1 style={{ margin: 0, font: '800 32px "Plus Jakarta Sans"' }}>{u.name}</h1>
              <p style={{ margin: '5px 0', fontSize: '16px', color: 'var(--p)', fontWeight: '700' }}>
                {profile.degree} {profile.department} • {profile.college}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
                {profile.email} • {profile.phone} • {profile.location}
              </p>
            </div>

            <Link className="btn" to="/student/profile-wizard">
              <FiEdit /> Edit Profile
            </Link>
          </div>

          <h3>Academic Summary</h3>
          <p className="muted">
            University: <b>{profile.university}</b> | Batch: <b>{profile.batch}</b> | CGPA: <b>{profile.cgpa}</b> | Active Backlogs: <b>{profile.backlogs}</b>
          </p>

          <h3 style={{ marginTop: '25px' }}>Technical Skills</h3>
          <div className="skillTags">
            {(profile.skills || '').split(',').map((s) => (
              <span key={s} className="skillTag">{s.trim()}</span>
            ))}
          </div>

          <h3 style={{ marginTop: '25px' }}>Resume PDF</h3>
          {profile.resumeUrl ? (
            <a className="btn sm" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              <FiFileText /> View PDF Resume
            </a>
          ) : (
            <p className="muted">No resume uploaded yet.</p>
          )}
        </div>
      </main>
    </Layout>
  );
}

// Student Applications View
function StudentApplicationsView() {
  const u = user();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (u?.id) {
      api.get(`/applications/student/${u.id}`).then((r) => setApps(r.data));
    }
  }, [u?.id]);

  return (
    <Layout>
      <main className="page">
        <small>TRACKING</small>
        <h1>My Applications</h1>

        <div className="panel" style={{ marginTop: '25px' }}>
          {apps.length === 0 ? (
            <div className="emptyState"><p>No applications submitted yet.</p></div>
          ) : (
            apps.map((a) => (
              <div key={a.id} className="app" style={{ padding: '20px 0' }}>
                <div>
                  <b style={{ fontSize: '16px' }}>{a.job?.title}</b>
                  <p style={{ margin: '4px 0', color: 'var(--muted)' }}>{a.job?.company} • {a.job?.location}</p>
                  <small style={{ color: 'var(--muted)' }}>Applied on: {new Date(a.appliedAt).toLocaleDateString()}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: a.eligibilityStatus === 'ELIGIBLE' ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                    {a.eligibilityStatus === 'ELIGIBLE' ? '✓ Eligible' : '✗ Ineligible'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </Layout>
  );
}

// ============================================================
// 5. PLACEMENT OFFICER PORTAL (WITH APPLICANT TABLE & EXCEL EXPORT)
// ============================================================
function OfficerLogin() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/officer/login', { email, password: pass });
      localStorage.setItem('studenthubUser', JSON.stringify(r.data));
      showToast('Welcome Officer, ' + r.data.name + '!');
      nav('/officer/dashboard');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <Layout>
      <div className="auth">
        <div className="panel authCard">
          <div className="authIcon">🏢</div>
          <h1>Placement Officer Login</h1>
          <p className="muted">Sign in to manage campus recruitment drives and candidate applications.</p>

          <form onSubmit={handleLogin}>
            <label>
              Official Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="officer@shanmugha.edu.in" />
            </label>
            <label>
              Password
              <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            </label>

            {msg && <div className="notice" style={{ background: '#fef2f2', color: '#991b1b' }}>{msg}</div>}

            <button className="btn wide">Sign In as Officer</button>
          </form>

          <p className="demo">
            New Officer? <Link to="/officer/register" style={{ color: 'var(--p)', fontWeight: '700' }}>Officer Registration</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

function OfficerRegister() {
  const [form, setForm] = useState({
    fullName: '',
    officialEmail: '',
    phone: '',
    college: '',
    department: 'Training & Placement',
    designation: 'Head Placement Officer',
    password: '',
    confirmPassword: ''
  });
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[a-zA-Z\s.'-]+$/.test(form.fullName) || form.fullName.trim().length < 3) {
      return setMsg('Full Name must contain at least 3 alphabetic letters.');
    }
    if (!/^[0-9]{10,15}$/.test(form.phone)) {
      return setMsg('Phone Number must be a valid 10-digit numeric phone number.');
    }
    if (form.password !== form.confirmPassword) {
      return setMsg('Passwords do not match.');
    }

    try {
      await api.post('/auth/officer/register', form);
      showToast('Registration submitted! Account awaiting Admin approval.');
      nav('/officer/login');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <Layout>
      <div className="auth">
        <div className="panel authCard" style={{ width: 'min(580px, 100%)' }}>
          <div className="authIcon">🏢</div>
          <h1>Placement Officer Registration</h1>
          <p className="muted">Register your officer account. Administrator approval is required before gaining dashboard access.</p>

          <form onSubmit={handleSubmit}>
            <div className="formGrid">
              <label className="formGroup full">
                Full Name *
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Dr. Robert Placement" />
              </label>

              <label className="formGroup">
                Official Email *
                <input type="email" required value={form.officialEmail} onChange={(e) => setForm({ ...form, officialEmail: e.target.value })} placeholder="officer@college.edu" />
              </label>

              <label className="formGroup">
                Phone Number *
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543211" />
              </label>

              <label className="formGroup full">
                College / Institution Name *
                <input required value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Anna University" />
              </label>

              <label className="formGroup">
                Department *
                <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Training & Placement" />
              </label>

              <label className="formGroup">
                Designation *
                <input required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Head Placement Officer" />
              </label>

              <label className="formGroup">
                Password *
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </label>

              <label className="formGroup">
                Confirm Password *
                <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" />
              </label>
            </div>

            {msg && <div className="notice" style={{ background: '#fef2f2', color: '#991b1b', marginTop: '15px' }}>{msg}</div>}

            <button className="btn wide" style={{ marginTop: '20px' }}>Register Officer Account</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function OfficerDashboard() {
  const u = user();
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const [newDrive, setNewDrive] = useState({
    title: '', company: '', location: '', salaryMin: 5.0, salaryMax: 7.5,
    eligibleDegree: 'B.E.', eligibleDepartment: 'CSE', minCgpa: 7.0, maxBacklogs: 0,
    skills: 'Java, React, SQL', description: '', deadline: '2026-10-30'
  });

  useEffect(() => {
    api.get('/jobs').then((r) => {
      setDrives(r.data);
      if (r.data.length > 0) {
        setSelectedDrive(r.data[0]);
        loadDriveApps(r.data[0].id);
      }
    });
    api.get('/officer/students').then((r) => setStudentsList(r.data)).catch(() => {});
  }, []);

  const loadDriveApps = (driveId) => {
    api.get(`/applications/job/${driveId}`).then((r) => setApplications(r.data));
  };

  const handlePostDrive = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', newDrive, { params: { recruiterId: u.id } });
      showToast('Placement drive created & published!');
      setShowDriveModal(false);
      api.get('/jobs').then((r) => setDrives(r.data));
    } catch (e) {
      showToast('Failed to create drive', 'error');
    }
  };

  const handleStatusUpdate = (appId, newStatus) => {
    api.put(`/applications/${appId}/status`, null, { params: { value: newStatus } }).then(() => {
      showToast(`Status updated to ${newStatus}`);
      if (selectedDrive) loadDriveApps(selectedDrive.id);
    });
  };

  const downloadExcel = (driveId) => {
    window.open(`http://localhost:8080/api/placement-drives/${driveId}/export-excel`, '_blank');
    showToast('Exporting Applications Excel Spreadsheet...');
  };

  if (!u) return <Layout><OfficerLogin /></Layout>;

  return (
    <Layout>
      <main className="page">
        <small>OFFICER CONSOLE</small>
        <div className="dashHead">
          <div>
            <h1>Placement Officer Portal</h1>
            <p className="muted">Manage campus recruitment drives, view applicant snapshots, registered student directory, and export Excel reports.</p>
          </div>
          <button className="btn" onClick={() => setShowDriveModal(true)}>
            <FiPlus /> Post Placement Drive
          </button>
        </div>

        <div className="dashCards">
          <div className="dashCard"><span>Registered Students</span><b style={{ color: 'var(--p)' }}>{studentsList.length}</b></div>
          <div className="dashCard"><span>Active Drives</span><b>{drives.length}</b></div>
          <div className="dashCard"><span>Applicants Selected</span><b>{applications.length}</b></div>
          <div className="dashCard"><span>Shortlisted</span><b>{applications.filter((a) => a.status === 'SHORTLISTED').length}</b></div>
        </div>

        {/* Sri Shanmugha Registered Students Directory */}
        <section className="panel" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Sri Shanmugha Registered Students Directory ({studentsList.length})</h2>
          </div>

          {studentsList.length === 0 ? (
            <div className="emptyState"><p>No registered college students found.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--muted)' }}>
                    <th style={{ padding: '12px' }}>Student Name</th>
                    <th style={{ padding: '12px' }}>College Student Email</th>
                    <th style={{ padding: '12px' }}>Phone</th>
                    <th style={{ padding: '12px' }}>Degree & Dept</th>
                    <th style={{ padding: '12px' }}>Grad Year</th>
                    <th style={{ padding: '12px' }}>CGPA</th>
                    <th style={{ padding: '12px' }}>Skills</th>
                    <th style={{ padding: '12px' }}>Profile Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((sp) => (
                    <tr key={sp.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px' }}>
                        <b>{sp.user?.name || sp.email?.split('@')[0]}</b>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--p)', fontWeight: '600' }}>
                        {sp.email || sp.user?.email}
                      </td>
                      <td style={{ padding: '12px' }}>{sp.phone || sp.user?.phone || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{sp.degree || 'B.E.'} ({sp.department || 'CSE'})</td>
                      <td style={{ padding: '12px' }}>{sp.graduationYear || '2026'}</td>
                      <td style={{ padding: '12px' }}><b>{sp.cgpa != null ? sp.cgpa : 'N/A'}</b></td>
                      <td style={{ padding: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sp.skills || 'Not specified'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${sp.completionPercentage === 100 ? 'eligible' : 'ineligible'}`}>
                          {sp.completionPercentage != null ? `${sp.completionPercentage}% Completed` : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Drives Selector & Excel Export Header */}
        <section className="panel" style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Applicant Management</h2>
            {selectedDrive && (
              <button className="btn secondary" onClick={() => downloadExcel(selectedDrive.id)}>
                <FiDownload /> Download Applications Excel (.csv)
              </button>
            )}
          </div>

          {/* Drive Tabs */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
            {drives.map((d) => (
              <button
                key={d.id}
                className={`btn sm ${selectedDrive?.id === d.id ? '' : 'secondary'}`}
                onClick={() => {
                  setSelectedDrive(d);
                  loadDriveApps(d.id);
                }}
              >
                {d.company} - {d.title}
              </button>
            ))}
          </div>

          {/* Applicants Table */}
          {applications.length === 0 ? (
            <div className="emptyState"><p>No candidate applications for this placement drive yet.</p></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--muted)' }}>
                    <th style={{ padding: '12px' }}>App ID</th>
                    <th style={{ padding: '12px' }}>Student Name</th>
                    <th style={{ padding: '12px' }}>Degree / Dept</th>
                    <th style={{ padding: '12px' }}>CGPA</th>
                    <th style={{ padding: '12px' }}>Backlogs</th>
                    <th style={{ padding: '12px' }}>Eligibility</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px' }}>APP{a.id}</td>
                      <td style={{ padding: '12px' }}>
                        <b>{a.studentName || a.student?.name}</b>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.studentEmail || a.student?.email}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{a.studentDegree || 'B.E.'} ({a.studentDepartment || 'CSE'})</td>
                      <td style={{ padding: '12px' }}><b>{a.studentCgpa || 0.0}</b></td>
                      <td style={{ padding: '12px' }}>{a.studentBacklogs || 0}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${a.eligibilityStatus === 'ELIGIBLE' ? 'eligible' : 'ineligible'}`}>
                          {a.eligibilityStatus === 'ELIGIBLE' ? '✓ Eligible' : '✗ Ineligible'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span>
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                        <button className="btn sm" onClick={() => handleStatusUpdate(a.id, 'SHORTLISTED')}>
                          Shortlist
                        </button>
                        <button className="btn sm danger" onClick={() => handleStatusUpdate(a.id, 'REJECTED')}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Post Drive Modal */}
        {showDriveModal && (
          <div className="modalOverlay">
            <div className="modalCard" style={{ width: 'min(650px, 100%)' }}>
              <div className="modalHeader">
                <h2>Post New Placement Drive</h2>
                <button className="closeBtn" onClick={() => setShowDriveModal(false)}>×</button>
              </div>

              <form onSubmit={handlePostDrive} className="formGrid">
                <label className="formGroup">
                  Position Title *
                  <input required value={newDrive.title} onChange={(e) => setNewDrive({ ...newDrive, title: e.target.value })} placeholder="Java Full Stack Developer" />
                </label>

                <label className="formGroup">
                  Company Name *
                  <input required value={newDrive.company} onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })} placeholder="TechNova Solutions" />
                </label>

                <label className="formGroup">
                  Location *
                  <input required value={newDrive.location} onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })} placeholder="Chennai" />
                </label>

                <label className="formGroup">
                  Min Salary (LPA) *
                  <input type="number" step="0.1" value={newDrive.salaryMin} onChange={(e) => setNewDrive({ ...newDrive, salaryMin: parseFloat(e.target.value) })} />
                </label>

                <label className="formGroup">
                  Eligible Degree *
                  <select value={newDrive.eligibleDegree} onChange={(e) => setNewDrive({ ...newDrive, eligibleDegree: e.target.value })}>
                    {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                <label className="formGroup">
                  Eligible Department *
                  <select value={newDrive.eligibleDepartment} onChange={(e) => setNewDrive({ ...newDrive, eligibleDepartment: e.target.value })}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                <label className="formGroup">
                  Minimum CGPA *
                  <input type="number" step="0.1" value={newDrive.minCgpa} onChange={(e) => setNewDrive({ ...newDrive, minCgpa: parseFloat(e.target.value) })} placeholder="7.0" />
                </label>

                <label className="formGroup">
                  Max Allowed Backlogs *
                  <input type="number" value={newDrive.maxBacklogs} onChange={(e) => setNewDrive({ ...newDrive, maxBacklogs: parseInt(e.target.value) })} placeholder="0" />
                </label>

                <label className="formGroup">
                  Application Deadline *
                  <input type="date" required value={newDrive.deadline} onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })} />
                </label>

                <label className="formGroup">
                  Required Skills *
                  <input value={newDrive.skills} onChange={(e) => setNewDrive({ ...newDrive, skills: e.target.value })} placeholder="Java, React, SQL" />
                </label>

                <label className="formGroup full">
                  Drive Description *
                  <textarea rows={3} value={newDrive.description} onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })} placeholder="Enter detailed job roles & responsibilities..." />
                </label>

                <button className="btn wide" style={{ gridColumn: '1 / -1', marginTop: '15px' }}>Publish Placement Drive</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

// ============================================================
// 6. ADMIN AUTHENTICATION & CONSOLE
// ============================================================
function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/admin/login', { username, password });
      localStorage.setItem('studenthubUser', JSON.stringify(r.data));
      showToast('Authenticated as Administrator');
      nav('/admin/dashboard');
    } catch (err) {
      setMsg('Invalid Admin credentials.');
    }
  };

  return (
    <Layout>
      <div className="auth">
        <div className="panel authCard">
          <div className="authIcon" style={{ background: '#fef2f2', color: 'var(--danger)' }}>🔐</div>
          <h1>Admin Portal Login</h1>
          <p className="muted">Administrative access only. Credentials are authenticated securely on the server.</p>

          <form onSubmit={handleAdminLogin}>
            <label>
              Admin Username
              <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            </label>
            <label>
              Password
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>

            {msg && <div className="notice" style={{ background: '#fef2f2', color: '#991b1b' }}>{msg}</div>}

            <button className="btn wide danger">Admin Login</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function AdminDashboard() {
  const u = user();
  const [officers, setOfficers] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/officers').then((r) => setOfficers(r.data)).catch(() => {});
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const handleApprove = (id) => {
    api.put(`/admin/officers/${id}/approve`).then(() => {
      showToast('Officer account approved successfully!');
      api.get('/admin/officers').then((r) => setOfficers(r.data));
    });
  };

  const handleReject = (id) => {
    api.put(`/admin/officers/${id}/reject`).then(() => {
      showToast('Officer account rejected', 'error');
      api.get('/admin/officers').then((r) => setOfficers(r.data));
    });
  };

  if (!u) return <Layout><AdminLogin /></Layout>;

  const pendingOfficers = officers.filter((o) => o.status === 'PENDING');

  return (
    <Layout>
      <main className="page">
        <small>ADMINISTRATIVE CONSOLE</small>
        <h1>Platform Overview & Approvals</h1>

        <div className="dashCards">
          <div className="dashCard"><span>Total Students</span><b>{stats.totalStudents || 0}</b></div>
          <div className="dashCard"><span>Total Officers</span><b>{stats.totalOfficers || 0}</b></div>
          <div className="dashCard"><span style={{ color: 'var(--danger)' }}>Pending Officers</span><b style={{ color: 'var(--danger)' }}>{pendingOfficers.length}</b></div>
          <div className="dashCard"><span>Placement Drives</span><b>{stats.totalDrives || 0}</b></div>
        </div>

        <section className="panel" style={{ marginBottom: '30px' }}>
          <h2>Pending Placement Officer Approvals ({pendingOfficers.length})</h2>
          {pendingOfficers.length === 0 ? (
            <div className="emptyState"><p>No pending placement officer registrations.</p></div>
          ) : (
            pendingOfficers.map((o) => (
              <div key={o.id} style={{ padding: '18px 0', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ fontSize: '16px' }}>{o.fullName}</b>
                  <p style={{ margin: '4px 0', color: 'var(--muted)' }}>
                    {o.designation} • {o.department} • {o.college} ({o.officialEmail})
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn sm" onClick={() => handleApprove(o.id)}>
                    <FiCheck /> Approve
                  </button>
                  <button className="btn sm danger" onClick={() => handleReject(o.id)}>
                    <FiX /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </Layout>
  );
}

// ============================================================
// MAIN ROUTER
// ============================================================
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />

      {/* Student Routes */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/profile-wizard" element={<StudentProfileWizard />} />
      <Route path="/student/profile" element={<StudentProfileView />} />
      <Route path="/student/placement-drives" element={<StudentPlacementDrives />} />
      <Route path="/student/applications" element={<StudentApplicationsView />} />

      {/* Placement Officer Routes */}
      <Route path="/officer/login" element={<OfficerLogin />} />
      <Route path="/officer/register" element={<OfficerRegister />} />
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route path="*" element={<RoleSelection />} />
    </Routes>
  );
}