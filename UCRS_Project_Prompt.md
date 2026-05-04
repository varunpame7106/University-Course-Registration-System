# University Course Registration System (UCRS)
## Full-Stack Project Prompt — Complete Specification

---

## 1. Project Overview

Build a full-stack **University Course Registration System** with three separate role-based dashboards:
- **Administrator** — system-wide control panel
- **Faculty** — course and student management
- **Student** — course registration and profile management

All data changes must reflect **dynamically** across the system in real time (optimistic UI + server re-validation). There must be **zero hardcoded mock data** — every screen pulls from the MySQL database.

---

## 2. Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (for forms, tables, modals, badges)
- **Icons**: Lucide React
- **State Management**: Zustand (global auth/session state)
- **Data Fetching**: TanStack Query (React Query v5) — for caching, background refetch, optimistic updates
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Charts/Reports** (Admin): Recharts

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **ORM**: Prisma (with MySQL adapter)
- **Authentication**: JWT (access token + refresh token pattern)
- **Password Hashing**: bcryptjs
- **Validation**: Zod (shared schema between frontend and backend)
- **Middleware**: CORS, helmet, morgan (logging), express-rate-limit
- **File Uploads** (optional, for profile photos): multer

### Database
- **Engine**: MySQL (local server — user provides credentials via `.env`)
- **Schema management**: Prisma Migrate

### Dev Tooling
- **Monorepo**: Turborepo (or separate `/frontend` and `/backend` folders with a root `package.json`)
- **Environment**: `.env.local` (frontend), `.env` (backend)
- **API Testing**: Postman collection (export alongside code)

---

## 3. Database Schema (MySQL via Prisma)

### ER Diagram Reference
Taken from the hand-drawn ER diagram provided:

```
Administrator ──(creates 1:N)──► Course
Administrator ──(monitors 1:N)──► Faculty
Course ──(takes M:N)──► Student  [junction: enrolment]
Department ──(belongs 1:N)──► Faculty
Department ──(enrolls N:1)──► Student
Course ──(has)──► Location
Location ──(has)──► Online | Offline
```

### Tables

#### `administrators`
| Column     | Type         | Notes              |
|------------|--------------|--------------------|
| admin_id   | INT PK AI    |                    |
| user_id    | VARCHAR(50)  | Unique login ID    |
| password   | VARCHAR(255) | bcrypt hash        |
| created_at | DATETIME     |                    |

#### `departments`
| Column      | Type         | Notes |
|-------------|--------------|-------|
| dept_id     | INT PK AI    |       |
| dept_name   | VARCHAR(100) |       |

#### `faculties`
| Column        | Type         | Notes                         |
|---------------|--------------|-------------------------------|
| faculty_id    | INT PK AI    |                               |
| user_id       | VARCHAR(50)  | Unique login ID               |
| password      | VARCHAR(255) | bcrypt hash                   |
| first_name    | VARCHAR(50)  |                               |
| last_name     | VARCHAR(50)  |                               |
| dob           | DATE         |                               |
| gender        | ENUM         | Male / Female / Other         |
| address       | TEXT         |                               |
| domain        | VARCHAR(100) | Subject expertise area        |
| designation   | VARCHAR(100) | e.g. Professor, Asst. Prof    |
| contact_no    | VARCHAR(15)  |                               |
| dept_id       | INT FK       | → departments.dept_id         |
| created_at    | DATETIME     |                               |

#### `students`
| Column        | Type         | Notes                         |
|---------------|--------------|-------------------------------|
| student_id    | INT PK AI    |                               |
| user_id       | VARCHAR(50)  | PRN No (unique login ID)      |
| password      | VARCHAR(255) | bcrypt hash                   |
| first_name    | VARCHAR(50)  |                               |
| last_name     | VARCHAR(50)  |                               |
| dob           | DATE         |                               |
| gender        | ENUM         | Male / Female / Other         |
| phone_no      | VARCHAR(15)  |                               |
| city          | VARCHAR(80)  |                               |
| state         | VARCHAR(80)  |                               |
| pincode       | VARCHAR(10)  |                               |
| year_enrolled | YEAR         |                               |
| dept_id       | INT FK       | → departments.dept_id         |
| created_at    | DATETIME     |                               |

#### `courses`
| Column      | Type         | Notes                         |
|-------------|--------------|-------------------------------|
| course_id   | INT PK AI    |                               |
| course_name | VARCHAR(150) |                               |
| dept_id     | INT FK       | → departments.dept_id         |
| duration    | VARCHAR(50)  | e.g. "45 hrs / semester"      |
| mode        | ENUM         | Online / Offline              |
| platform    | VARCHAR(100) | e.g. Zoom (if Online)         |
| college_name| VARCHAR(150) | if Offline                    |
| timing      | VARCHAR(100) | Schedule string               |
| created_by  | INT FK       | → administrators.admin_id     |
| created_at  | DATETIME     |                               |

#### `course_faculty` (assignment junction)
| Column     | Type   | Notes                     |
|------------|--------|---------------------------|
| id         | INT PK |                           |
| course_id  | INT FK | → courses.course_id       |
| faculty_id | INT FK | → faculties.faculty_id    |

#### `enrolments` (student ↔ course, M:N)
| Column      | Type     | Notes                           |
|-------------|----------|---------------------------------|
| enrolment_id| INT PK   |                                 |
| student_id  | INT FK   | → students.student_id           |
| course_id   | INT FK   | → courses.course_id             |
| status      | ENUM     | Pending / Approved / Dropped    |
| enrolled_at | DATETIME |                                 |

---

## 4. Backend Architecture

### Folder Structure
```
/backend
  /src
    /config         → db.js (Prisma client), env.js
    /middleware     → auth.js (JWT verify), role.js (RBAC), errorHandler.js
    /modules
      /auth         → auth.routes.js, auth.controller.js, auth.service.js
      /admin        → admin.routes.js, admin.controller.js, admin.service.js
      /faculty      → faculty.routes.js, faculty.controller.js, faculty.service.js
      /student      → student.routes.js, student.controller.js, student.service.js
      /course       → course.routes.js, course.controller.js, course.service.js
      /department   → department.routes.js, department.controller.js
      /enrolment    → enrolment.routes.js, enrolment.controller.js, enrolment.service.js
      /report       → report.routes.js, report.controller.js
    /utils          → apiResponse.js, asyncWrapper.js, validators/
  app.js
  server.js
/prisma
  schema.prisma
  migrations/
.env
```

### Authentication Flow
- `POST /api/auth/login` — accepts `{ user_id, password, role }` → returns `{ accessToken, refreshToken, user }`
- `POST /api/auth/refresh` — rotates refresh token
- `POST /api/auth/logout` — invalidates token (server-side blacklist or cookie clear)
- All protected routes require `Authorization: Bearer <accessToken>` header
- Role guard middleware: `requireRole('admin' | 'faculty' | 'student')`

### API Endpoint Map

#### Admin Routes (`/api/admin/*` — role: admin)
```
GET    /dashboard/stats          → total students, faculty, courses, departments
GET    /students                 → paginated list with filters
POST   /students                 → create student
PUT    /students/:id             → update student
DELETE /students/:id             → delete student

GET    /faculties                → paginated list
POST   /faculties                → create faculty
PUT    /faculties/:id            → update faculty
DELETE /faculties/:id            → delete faculty

GET    /courses                  → all courses
POST   /courses                  → create course
PUT    /courses/:id              → update course
DELETE /courses/:id              → delete course

GET    /departments              → all departments
POST   /departments              → create department
PUT    /departments/:id          → update department
DELETE /departments/:id          → delete department

POST   /courses/:id/assign-faculty   → assign faculty to course
GET    /enrolments               → all enrolments with status filter
PUT    /enrolments/:id/approve   → approve a pending enrolment
PUT    /enrolments/:id/reject    → reject a pending enrolment
GET    /reports/summary          → generate summary report data
```

#### Faculty Routes (`/api/faculty/*` — role: faculty)
```
GET    /profile                  → faculty profile
PUT    /profile                  → update own profile
GET    /courses                  → courses assigned to this faculty
GET    /courses/:id/students     → students enrolled in a course
PUT    /courses/:id              → update course details (within assigned scope)
GET    /schedule                 → timing info for assigned courses
```

#### Student Routes (`/api/student/*` — role: student)
```
GET    /profile                  → student profile
PUT    /profile                  → update own profile
GET    /courses/available        → all approved courses student hasn't enrolled in
GET    /courses/enrolled         → student's current enrolments
POST   /courses/:id/enrol        → register for a course (status: Pending)
DELETE /enrolments/:id           → drop a course
GET    /timetable                → enrolled course schedule
```

### Scalability Considerations
- Use **Prisma connection pooling** (PgBouncer-style or built-in pool config)
- Apply `express-rate-limit` to auth routes (5 req/min per IP)
- Use `helmet` for security headers
- Paginate all list endpoints: `?page=1&limit=10&search=&filter=`
- All responses follow a standard envelope:
  ```json
  { "success": true, "data": {}, "message": "OK", "pagination": {} }
  ```
- Errors follow:
  ```json
  { "success": false, "error": "Validation failed", "details": [] }
  ```

---

## 5. Frontend Architecture

### Folder Structure
```
/frontend
  /app
    /login                        → shared login page (role selector)
    /(admin)
      /dashboard                  → overview stats
      /students                   → list + add/edit/delete
      /faculties                  → list + add/edit/delete
      /courses                    → list + add/edit/delete
      /departments                → list + add/edit/delete
      /enrolments                 → approval queue
      /reports                    → summary charts
    /(faculty)
      /dashboard                  → assigned courses + student list
      /courses/[id]               → course detail + edit
      /schedule                   → timing view
    /(student)
      /dashboard                  → profile + enrolled courses
      /courses                    → available course browser
      /timetable                  → schedule view
  /components
    /ui                           → shadcn components
    /shared                       → Navbar, Sidebar, StatCard, DataTable, Modal
    /admin                        → AdminSidebar, UserForm, CourseForm, ReportChart
    /faculty                      → FacultySidebar, CourseCard, StudentTable
    /student                      → StudentSidebar, CourseCard, EnrolmentBadge
  /hooks                          → useAuth, useCourses, useStudents, useFaculty
  /store                          → authStore.js (Zustand)
  /lib                            → axios.js (instance + interceptors), queryClient.js
  /schemas                        → zod schemas (shared with backend where possible)
  /utils                          → formatDate, formatName, roleGuard
  middleware.js                   → Next.js middleware for route protection
```

### Design System — Light Theme, Professional
**Color palette** (no navy blue, no AI-gen defaults):
```
Primary:       #1A1A2E  → dark charcoal (text, sidebar active)
Accent:        #4F46E5  → indigo (CTAs, highlights — not navy)
Surface:       #FFFFFF  → card backgrounds
Background:    #F5F5F7  → page background (Apple-grey feel)
Border:        #E4E4E7  → subtle dividers
Text primary:  #111827
Text muted:    #6B7280
Success:       #16A34A
Warning:       #D97706
Danger:        #DC2626
Admin accent:  #4F46E5  → indigo
Faculty accent:#0D9488  → teal
Student accent:#2563EB  → clear blue (not navy)
```

**Typography**: Inter (Google Fonts) — clean, modern, professional  
**Radius**: 8px cards, 6px buttons, 4px inputs  
**Shadows**: `shadow-sm` only — no heavy drop shadows  
**Sidebar**: Fixed left sidebar (240px), collapsible on mobile  
**Tables**: Striped rows, sticky header, column sorting, search bar above  
**Modals**: Centered overlay for add/edit/delete confirmation  
**Responsive**: Mobile-first, sidebar collapses to hamburger below 768px  

### Route Protection (Next.js Middleware)
```js
// middleware.js
// If no token → redirect to /login
// If token role !== route namespace → redirect to own dashboard
// Applies to /(admin)/*, /(faculty)/*, /(student)/*
```

---

## 6. Dashboard Specifications

### 6A. Administrator Dashboard

**Sidebar links**: Dashboard · Students · Faculty · Courses · Departments · Enrolments · Reports · Logout

#### `/admin/dashboard`
- **4 stat cards** (dynamic from DB):
  - Total Students | Total Faculty | Total Courses | Total Departments
- **Recent enrolments** table (last 10, with Approve / Reject inline action)
- **Quick actions**: + Add Student · + Add Faculty · + Add Course

#### `/admin/students`
- Searchable, paginated DataTable: First Name · Last Name · PRN · Dept · Year Enrolled · Actions
- Actions: Edit (modal form) · Delete (confirmation modal)
- Add Student button → modal form with fields:
  - First Name, Last Name, Date of Birth, Gender, PRN No, Phone No, Address (City, State, Pin Code), Year Enrolled, Department (dropdown), Password

#### `/admin/faculties`
- Searchable, paginated DataTable: Name · Dept · Domain · Designation · Contact · Actions
- Add/Edit Faculty modal fields:
  - First Name, Last Name, DOB, Gender, Domain, Designation, Contact No, Address, Department (dropdown), Password

#### `/admin/courses`
- DataTable: Course Name · Dept · Duration · Mode · Assigned Faculty · Actions
- Add/Edit Course modal fields:
  - Course Name, Department (dropdown), Duration, Mode (Online/Offline toggle):
    - If Online: Platform (text), Timing
    - If Offline: College Name, Timing
  - Assign Faculty (multi-select dropdown from faculty list)

#### `/admin/departments`
- Simple table: Dept ID · Dept Name · Actions (Edit / Delete)
- Add/Edit via inline modal

#### `/admin/enrolments`
- Table: Student Name · Course · Enrolled At · Status (badge: Pending/Approved/Dropped)
- Filter by status
- Approve / Reject buttons per row (status updates dynamically)

#### `/admin/reports`
- Bar chart: Enrolments per Department (Recharts)
- Pie chart: Online vs Offline course distribution
- Table: Top 5 most enrolled courses
- Export button (CSV download via API)

---

### 6B. Faculty Dashboard

**Sidebar links**: Dashboard · My Courses · Schedule · Logout

**Faculty Profile** displayed in sidebar header: Name · Designation · Domain

#### `/faculty/dashboard`
- Cards: Total Assigned Courses · Total Enrolled Students (across all courses)
- List of assigned courses with student count per course

#### `/faculty/courses`
- Grid of assigned course cards showing:
  - Course Name · Mode (badge) · Department · Duration · Timing
  - "View Students" button → opens student list for that course
  - "Edit Course" button → inline editable fields (Course Name, Timing, Duration — scope limited)

#### `/faculty/courses/[id]` (course detail)
- Course info header
- Enrolled students table: PRN · Full Name · Year Enrolled · Status
- Search students

#### `/faculty/schedule`
- Weekly view or list view of assigned course timings
- Shows: Course · Mode · Timing · Platform/Location

---

### 6C. Student Dashboard

**Sidebar links**: Dashboard · Available Courses · Enrolled Courses · Timetable · Logout

**Student Profile** in sidebar: Name · PRN · Department · Year Enrolled

#### `/student/dashboard`
- Profile card: Full Name · PRN · DOB · Gender · Phone · Address · Year Enrolled
- Edit Profile button → modal to update personal details
- Summary: Total enrolled courses · Pending approvals

#### `/student/courses` (Available Courses browser)
- Grid/list of all courses the student has NOT enrolled in
- Each card shows: Course Name · Dept · Mode (badge: Online/Offline) · Platform or College · Duration · Timing · Assigned Faculty
- **Multi-select supported**: Checkbox on each card or "Register" per card
- Register button → POST enrolment (status: Pending) → toast notification → card moves out of available list

#### `/student/courses/enrolled` (Enrolled Courses)
- List of enrolled courses with status badge (Pending / Approved / Dropped)
- "Drop Course" button → confirmation modal → DELETE enrolment → course returns to available list

#### `/student/timetable`
- Table or card grid of approved enrolled courses with: Course · Timing · Mode · Platform/Location

---

## 7. Auth & Session Management

- **Login page** (`/login`): Single page with role selector (Admin / Faculty / Student), user_id field, password field
- On success: store `{ accessToken, role, userId, name }` in Zustand + persist to `localStorage`
- Axios interceptor: attach `Authorization: Bearer <token>` to every request
- On 401: auto-call refresh endpoint → on fail → redirect to `/login`
- Logout: clear Zustand store + localStorage + call logout API

---

## 8. Environment Variables

### Backend `.env`
```
DATABASE_URL="mysql://root:<password>@localhost:3306/ucrs_db"
JWT_SECRET="your_jwt_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 9. Dynamic Behaviour Requirements

- All tables must **update without page reload** after add/edit/delete (React Query invalidation)
- Enrolment status changes on Admin side must reflect on Student side on next fetch
- Course assignment to faculty must appear in Faculty dashboard immediately
- All forms must show **inline field-level validation errors** (Zod + React Hook Form)
- Loading states: skeleton loaders on tables and stat cards
- Error states: friendly error message components (not raw JSON)
- Empty states: illustrated empty state component for tables/grids with zero records

---

## 10. Build & Run Instructions (include in README)

```bash
# 1. Clone and install
git clone <repo>
cd backend && npm install
cd ../frontend && npm install

# 2. Setup DB
cd backend
npx prisma migrate dev --name init
npx prisma generate

# 3. Seed (optional — create one admin user)
node prisma/seed.js

# 4. Start backend
npm run dev   # runs on :5000

# 5. Start frontend
cd ../frontend
npm run dev   # runs on :3000
```

---

## 11. Constraints & Rules

- No mock data anywhere — all screens must be driven by the MySQL DB
- No navy blue in UI — use indigo (#4F46E5) as primary accent
- Light theme only — clean, minimal, professional (not dark)
- Student must be able to enrol in **multiple courses** (M:N via enrolments table)
- All list endpoints must support pagination (`?page&limit`), searching, and filtering
- Backend must be modular — each entity (admin, faculty, student, course, dept, enrolment) has its own routes/controller/service files
- Use Prisma migrations — do not alter the DB schema manually
- JWT must be role-scoped — a student token cannot hit admin routes (enforced server-side)
- Sensitive fields (password) must never be returned in API responses

---

*End of specification. Reference the ER diagram images provided for entity relationships.*
