# GlassFund – Transparent Money Flow System

## 📌 Overview
GlassFund is a web-based system designed to **enable transparent financial flow tracking** in institutions.  
It provides dashboards for administrators, fund-flow visualization for auditors, and simplified views for the public.  

Built with **HTML, CSS, and JavaScript** (no backend required for demo).

---

## 🚀 Features
- 🎥 Video background homepage  
- 🔒 Login system with role-based access  
- 📊 Dashboard for administrators to manage budgets and transactions  
- 🔍 GlassFund view for auditors and the public (read-only transparency)  
- 📱 Responsive design with simple navigation  

---

## 📂 Project Structure
/project-root
│
├── index.html # Homepage (GlassFund landing page)<br>
├── login.html # Sign-in page<br>
├── dashboard.html # Admin dashboard page<br>
├── GlassFund.html # Auditor & Public fund tracking page<br>
├── styles.css # (Optional) Shared CSS file<br>
├── 0913.mp4 # Background video for homepage<br>
└── README.md # Documentation

---

## 🔑 Login Credentials (Demo)
Use the following test credentials for role-based redirection:

| Role          | Username/Email         | Password   | Redirects To      |
|---------------|------------------------|------------|-------------------|
| Administrator | `admin` or `admin@trueflow.com` | `admin123` | `dashboard.html` |
| Auditor       | `auditor` or `auditor@trueflow.com` | `audit123` | `GlassFund.html` |
| Public Viewer | `viewer` or `viewer@trueflow.com` | `view123`  | `GlassFund.html` |

---

## 📖 Pages Overview
### 🏠 Homepage (`index.html`)
- Hero section with tagline  
- Navigation bar with links to:
  - Home
  - Features
  - Sign-In / Sign-Up
  - Dashboard  
- Button: **Start Tracking** → links to `dashboard.html`  

### 🔐 Login Page (`login.html`)
- Clean login form with email + password fields  
- Supports role-based redirection after login  
- Error handling with "shake" animation for invalid inputs  

### 📊 Dashboard (`dashboard.html`)
- Allows admins to:
  - Create and manage budgets  
  - Track total, spent, and remaining funds  
  - Add transactions with date, department/project/vendor  
  - Visualize fund flow distribution  

### 🔎 GlassFund Page (`GlassFund.html`)
- Read-only fund distribution view for auditors and the public  
- Ensures transparency and traceability  

---

## ⚡ How to Run
1. Clone or download the project folder.  
2. Open `index.html` in your browser.  
3. Navigate using the navbar or login to access role-specific pages.  

---

## 📬 Support
For queries, reach out to: **GlassFund@gmail.com**  

---

## 🛠️ Future Improvements
- Backend integration with database (MySQL / MongoDB)  
- Real-time transaction logging  
- Secure authentication system  
- Graphical fund distribution visualization (charts)  
