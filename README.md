# 🎓 University Course Registration System (UCRS)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-blue?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)

A comprehensive, full-stack web application designed to streamline the university course registration process. Featuring three distinct, role-based dashboards tailored for Administrators, Faculty, and Students.

---

## 🚀 Key Features

### 🛠️ Admin Dashboard
- **System Overview**: Real-time statistics on students, faculty, courses, and departments.
- **Entity Management**: Full CRUD operations for managing the university's academic structure.
- **Enrolment Control**: Centralized interface to approve or reject student registration requests.
- **Advanced Reporting**: Dynamic data visualization (Bar/Pie charts) and CSV export for institutional analytics.

### 👨‍🏫 Faculty Dashboard
- **Course Management**: View and manage assigned courses with ease.
- **Dynamic Updates**: Modify course details such as names, timings, and durations on the fly.
- **Student Insights**: Access detailed lists of students enrolled in each course.
- **Academic Schedule**: A clear overview of the teaching timetable.

### 🎓 Student Dashboard
- **Personalized Profile**: Manage student information and academic preferences.
- **Course Discovery**: Browse through available courses and register with a single click.
- **Real-time Tracking**: Monitor the status of enrolments (Pending, Approved, Dropped).
- **Personal Timetable**: Automatically generated schedule based on approved registrations.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, React Query v5, Zustand |
| **Backend** | Node.js, Express.js, Prisma ORM, JWT Authentication |
| **Database** | MySQL |
| **UI/UX** | shadcn/ui, Lucide React, Recharts, Framer Motion |

---

## 📂 Project Structure

```bash
University Course Registration System/
├── frontend/         # Next.js 14 Application (Tailwind + shadcn)
├── backend/          # Express.js Server (Prisma + JWT)
├── prisma/           # Database Schema and Seeding Scripts
│   ├── schema.prisma # Database Model
│   └── seed.js       # Initial Data Population
└── package.json      # Root Workspace Configuration
```

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** (v20 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (or yarn/pnpm)

### 1. Clone & Configure
```bash
git clone https://github.com/shivammane2007/University-Course-Registration-System.git
cd "University Course Registration System"
```

### 2. Environment Setup
**Backend** (`backend/.env`):
```env
DATABASE_URL="mysql://root:<YOUR_PASSWORD>@localhost:3306/ucrs_db"
JWT_SECRET="your_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Initialize Database
Create the database in MySQL:
```sql
CREATE DATABASE ucrs_db;
```

### 4. Install & Migrate
```bash
# Install root dependencies
npm install

# Run migration and generate client
cd backend
npx prisma migrate dev --name init --schema=../prisma/schema.prisma
npx prisma generate --schema=../prisma/schema.prisma

# Seed the database
node ../prisma/seed.js
```

### 5. Start Development
From the root directory:
```bash
npm run dev
```
Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials

| Role | User ID | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Faculty** | `FAC001` | `faculty123` |
| **Student** | `PRN2024001` | `student123` |

---

## 🛣️ API Endpoints

| Module | Base Path | Required Role |
|---|---|---|
| **Auth** | `/api/auth` | Public |
| **Admin** | `/api/admin` | Admin |
| **Faculty** | `/api/faculty` | Faculty |
| **Student** | `/api/student` | Student |

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
