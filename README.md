<!--
  Student Management System - README
  Interactive, visually rich, and content-detailed documentation.
-->

<p align="center">
  <img src="https://em-content.zobj.net/source/microsoft-teams/363/student_1f9d1-200d-1f393.png" width="90" alt="Student Management Logo"/>
</p>

<h1 align="center">🎓 Student Management System</h1>
<p align="center">
  <b>Modern, modular platform for managing students, courses, enrollments, attendance, and more</b><br/>
  <i>Built with Next.js, React, MySQL, and RESTful APIs</i>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#system-architecture">System Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#core-modules--flows">Core Modules & Flows</a> •
  <a href="#file-structure">File Structure</a> •
  <a href="#faq">FAQ</a> •
  <a href="#contributing">Contributing</a>
</p>

---

<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-blue?logo=next.js" />
<img src="https://img.shields.io/badge/React-18-blue?logo=react" />
<img src="https://img.shields.io/badge/MySQL-Backend-success?logo=mysql" />
<img src="https://img.shields.io/badge/RESTful%20API-OpenAPI-brightgreen" />
<img src="https://img.shields.io/badge/License-MIT-success" />

</div>

---

## ✨ Features

<div align="center">

| 🧑‍🎓 Student CRUD | 📚 Course Management | 📝 Enrollment & Attendance | 💸 Fee Tracking | 🚀 Modern UI/UX |
|------------------|---------------------|---------------------------|----------------|----------------|
| Add, update, delete, search students | Create, update, assign courses | Record, view, and update attendance | Bill, track, and update fee status | Responsive, mobile-ready, and easy to use |

</div>

- **Student Records:**  
  - Add, edit, delete, and view student profiles (name, email, phone, address, courses, etc.)
  - List and search all students in an interactive table

- **Course Management:**  
  - Create, edit, and delete course details (name, code, credits, department)
  - Assign students to courses

- **Enrollment Management:**  
  - Enroll students in courses and track their enrollment status
  - View course rosters and student lists

- **Attendance Tracking:**  
  - Record daily attendance per course and student (Present, Absent, Late)
  - Unique attendance records per day/student/course

- **Fee Management:**  
  - Add and update fee records, mark as Paid/Unpaid/Partial
  - Due dates, payment tracking, and status monitoring

- **Sample Data & Easy DB Setup:**  
  - Includes scripts to auto-create tables and demo records for instant testing

- **Modern UI/UX:**  
  - Built with Next.js App Router, TypeScript, and React components
  - Clean, interactive forms, tables, and cards

---

## 🏗 System Architecture

- **User/Admin**: Uses any browser to access the system.
- **Next.js App**: Unified frontend and backend (App Router). Renders React UI and exposes serverless API endpoints for all CRUD operations.
- **API Routes**: Each resource (students, courses, enrollments, attendance, fees) is mapped to an API route under `/app/api/`. These handle validation, business logic, and call the database.
- **MySQL Database**: Relational storage for all persistent data. Tables: students, courses, enrollments, attendance, and fees.

---

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **MySQL** (running locally or remote)

### Local Installation

```sh
# 1. Clone the repository
git clone https://github.com/the-abhishekroy/Student-Management-System.git
cd Student-Management-System

# 2. Install dependencies
npm install

# 3. Configure your database (MySQL).
# - Set environment variables in .env.local:
#   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (defaults provided)
# - Optionally run db-setup.js to auto-create tables and demo data:
node db-setup.js

# 4. Run the development server
npm run dev

# 5. Visit the app
# Open http://localhost:3000 in your browser
```

---

## 🧩 Core Modules & Flows

### 🧑‍🎓 Student Management

- **List all students:** View, search, and sort students in a table.
- **Add/Edit a student:** Form for details (name, email, course, phone, address).
- **Delete student:** Remove student record.

### 📚 Course Management

- **List courses:** See all courses, details, and related students.
- **Create/Edit/Delete course:** Manage academic offerings.

### 📝 Enrollment & Attendance

- **Enroll students:** Assign students to courses, manage roster.
- **Attendance:** Mark attendance by course/date/student. Status: Present, Absent, Late.

### 💸 Fee Tracking

- **Add fee records:** Set amount, due date, and status.
- **Update payments:** Track paid, unpaid, or partial payments.

### 🗄️ Database Schema (Simplified)

- **students:** id, name, email, phone, address, timestamps
- **courses:** course_id, course_name, code, credits, department, timestamps
- **enrollments:** enrollment_id, student_id, course_id, enrollment_date, grade, status
- **attendance:** attendance_id, student_id, course_id, date, status
- **fees:** fee_id, student_id, amount, due_date, status, payment_date

---

## 📂 File Structure

```text
Student-Management-System/
│
├─ app/
│   ├─ students/                 # Student management page (UI, forms, list)
│   ├─ api/
│   │   ├─ students/             # Student CRUD API
│   │   ├─ courses/              # Course CRUD API
│   │   ├─ attendance/           # Attendance endpoints
│   │   └─ ...                   # Additional APIs (fees, enrollments, etc.)
│   └─ ...
├─ components/                   # UI components (student-list, forms, etc.)
├─ db-setup.js                   # Database setup & seed script
├─ .env.local                    # Database configuration (not committed)
├─ package.json
└─ README.md
```

---

## ❓ FAQ

**Q: How do I change the database settings?**  
A: Set the DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in `.env.local`. Defaults are used if not set.

**Q: Is there a sample database?**  
A: Yes! Run `node db-setup.js` to automatically create tables and insert demo students, courses, etc.

**Q: Can I add more modules (teachers, grading, etc.)?**  
A: Absolutely! The API and frontend are modular and easily extendable.

**Q: Is authentication included?**  
A: Not by default. The project is structured for easy integration of user authentication (e.g., NextAuth.js).

**Q: How do I deploy this project?**  
A: Deploy using Vercel, or any Node.js-compatible platform. Make sure your MySQL DB is accessible.

---

## 🤝 Contributing

We welcome contributions of all kinds!
- Fork the repository 🍴
- Create a branch (`git checkout -b feature-branch`) 🌿
- Commit your changes (`git commit -m "Describe your feature"`) ✅
- Push and open a Pull Request 🚀

---

## 📜 License

MIT License

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9C%A8%20for%20Educators%20%26%20Schools-blue" />
  <br/><b>Student Management System © 2025 by Abhishek Roy</b>
</p>
