const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

// Student select fields (exclude password)
const studentSelect = {
  student_id: true, user_id: true, first_name: true, last_name: true,
  phone_no: true, city: true, state: true, pincode: true, dob: true,
  gender: true, year_enrolled: true, dept_id: true, created_at: true,
  department: { select: { dept_name: true } },
};

// Faculty select fields (exclude password)
const facultySelect = {
  faculty_id: true, user_id: true, first_name: true, last_name: true,
  contact_no: true, address: true, domain: true, dob: true,
  gender: true, dept_id: true, designation: true, created_at: true,
  department: { select: { dept_name: true } },
};

// ─── Dashboard Stats ──────────────────────────────────────────
const getDashboardStats = async () => {
  const [students, faculty, courses, departments, recentEnrolments] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.course.count(),
    prisma.department.count(),
    prisma.enrolment.findMany({
      take: 10,
      orderBy: { enrolled_at: 'desc' },
      include: {
        student: { select: { first_name: true, last_name: true, user_id: true } },
        course: { select: { course_name: true } },
      },
    }),
  ]);
  return { students, faculty, courses, departments, recentEnrolments };
};

// ─── Students ─────────────────────────────────────────────────
const getStudents = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { first_name: { contains: search } },
          { last_name: { contains: search } },
          { user_id: { contains: search } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
      select: studentSelect,
    }),
    prisma.student.count({ where }),
  ]);

  return { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
};

const createStudent = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.student.create({
    data: { ...data, password: hashed, year_enrolled: Number(data.year_enrolled), dept_id: Number(data.dept_id) },
    select: studentSelect,
  });
};

const updateStudent = async (id, data) => {
  const updateData = { ...data, dept_id: data.dept_id ? Number(data.dept_id) : undefined };
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  else delete updateData.password;
  return prisma.student.update({ where: { student_id: Number(id) }, data: updateData, select: studentSelect });
};

const deleteStudent = async (id) => {
  await prisma.enrolment.deleteMany({ where: { student_id: Number(id) } });
  return prisma.student.delete({ where: { student_id: Number(id) } });
};

// ─── Faculty ──────────────────────────────────────────────────
const getFaculties = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  const where = search
    ? { OR: [{ first_name: { contains: search } }, { last_name: { contains: search } }, { user_id: { contains: search } }] }
    : {};

  const [rawData, total] = await Promise.all([
    prisma.faculty.findMany({
      where, skip, take: Number(limit),
      orderBy: { created_at: 'desc' },
      include: {
        department: { select: { dept_name: true } },
        courseFaculty: {
          include: {
            course: {
              select: {
                course_name: true,
                timing: true,
              }
            }
          }
        }
      },
    }),
    prisma.faculty.count({ where }),
  ]);

  // Strip passwords and build Schedule Info string
  const data = rawData.map(({ password, ...f }) => {
    const scheduleStr = f.courseFaculty.length > 0
      ? f.courseFaculty.map(cf => `${cf.course.course_name}: ${cf.course.timing}`).join(' | ')
      : 'No courses assigned';
    return { ...f, 'Schedule Info': scheduleStr };
  });

  return { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
};

const createFaculty = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  return prisma.faculty.create({
    data: { ...data, password: hashed, dept_id: Number(data.dept_id), dob: new Date(data.dob) },
    select: facultySelect,
  });
};

const updateFaculty = async (id, data) => {
  const updateData = { ...data, dept_id: data.dept_id ? Number(data.dept_id) : undefined };
  if (data.dob) updateData.dob = new Date(data.dob);
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  else delete updateData.password;
  return prisma.faculty.update({ where: { faculty_id: Number(id) }, data: updateData, select: facultySelect });
};

const deleteFaculty = async (id) => {
  await prisma.courseFaculty.deleteMany({ where: { faculty_id: Number(id) } });
  return prisma.faculty.delete({ where: { faculty_id: Number(id) } });
};

// ─── Courses ──────────────────────────────────────────────────
const getCourses = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  const where = search ? { course_name: { contains: search } } : {};

  const [data, total] = await Promise.all([
    prisma.course.findMany({
      where, skip, take: Number(limit),
      orderBy: { created_at: 'desc' },
      include: {
        department: { select: { dept_name: true } },
        courseFaculty: { include: { faculty: { select: { first_name: true, last_name: true, faculty_id: true } } } },
        creatorFaculty: { select: { first_name: true, last_name: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
};

const createCourse = async (data) => {
  const { faculty_ids = [], ...courseData } = data;
  return prisma.course.create({
    data: {
      ...courseData,
      dept_id: Number(courseData.dept_id),
      created_by: Number(courseData.created_by),
      courseFaculty: { create: faculty_ids.map((fid) => ({ faculty_id: Number(fid) })) },
    },
    include: { department: { select: { dept_name: true } }, courseFaculty: { include: { faculty: { select: { first_name: true, last_name: true } } } } },
  });
};

const updateCourse = async (id, data) => {
  const { faculty_ids, ...courseData } = data;
  if (courseData.dept_id) courseData.dept_id = Number(courseData.dept_id);

  await prisma.course.update({ where: { course_id: Number(id) }, data: courseData });

  if (faculty_ids !== undefined) {
    await prisma.courseFaculty.deleteMany({ where: { course_id: Number(id) } });
    if (faculty_ids.length > 0) {
      await prisma.courseFaculty.createMany({
        data: faculty_ids.map((fid) => ({ course_id: Number(id), faculty_id: Number(fid) })),
      });
    }
  }

  return prisma.course.findUnique({
    where: { course_id: Number(id) },
    include: { department: { select: { dept_name: true } }, courseFaculty: { include: { faculty: { select: { first_name: true, last_name: true } } } } },
  });
};

const deleteCourse = async (id) => {
  await prisma.enrolment.deleteMany({ where: { course_id: Number(id) } });
  await prisma.courseFaculty.deleteMany({ where: { course_id: Number(id) } });
  return prisma.course.delete({ where: { course_id: Number(id) } });
};

const assignFaculty = async (courseId, faculty_ids) => {
  await prisma.courseFaculty.deleteMany({ where: { course_id: Number(courseId) } });
  return prisma.courseFaculty.createMany({
    data: faculty_ids.map((fid) => ({ course_id: Number(courseId), faculty_id: Number(fid) })),
  });
};

// ─── Departments ──────────────────────────────────────────────
const getDepartments = async () => {
  return prisma.department.findMany({ orderBy: { dept_id: 'asc' } });
};

const createDepartment = async (dept_name) => {
  const existing = await prisma.department.findFirst({ where: { dept_name } });
  if (existing) {
    const error = new Error('Department with this name already exists');
    error.statusCode = 400;
    throw error;
  }
  return prisma.department.create({ data: { dept_name } });
};

const updateDepartment = async (id, dept_name) => {
  const existing = await prisma.department.findFirst({
    where: { 
      dept_name,
      NOT: { dept_id: Number(id) }
    }
  });
  if (existing) {
    const error = new Error('Department with this name already exists');
    error.statusCode = 400;
    throw error;
  }
  return prisma.department.update({ where: { dept_id: Number(id) }, data: { dept_name } });
};

const deleteDepartment = async (id) => {
  return prisma.department.delete({ where: { dept_id: Number(id) } });
};

// ─── Enrolments ───────────────────────────────────────────────
const getEnrolments = async ({ page = 1, limit = 10, status = '' }) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [data, total] = await Promise.all([
    prisma.enrolment.findMany({
      where, skip, take: Number(limit),
      orderBy: { enrolled_at: 'desc' },
      include: {
        student: { select: { first_name: true, last_name: true, user_id: true } },
        course: { select: { course_name: true } },
      },
    }),
    prisma.enrolment.count({ where }),
  ]);

  return { data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
};

const approveEnrolment = async (id) => {
  return prisma.enrolment.update({ where: { enrolment_id: Number(id) }, data: { status: 'Approved' } });
};

const rejectEnrolment = async (id) => {
  return prisma.enrolment.update({ where: { enrolment_id: Number(id) }, data: { status: 'Dropped' } });
};

// ─── Reports ──────────────────────────────────────────────────
const getReportSummary = async () => {
  const [enrolmentsByDept, modeDistribution, topCourses] = await Promise.all([
    prisma.$queryRaw`
      SELECT d.dept_name, COUNT(e.enrolment_id) as count
      FROM departments d
      LEFT JOIN courses c ON d.dept_id = c.dept_id
      LEFT JOIN enrolments e ON c.course_id = e.course_id
      GROUP BY d.dept_id, d.dept_name
    `,
    prisma.course.groupBy({ by: ['mode'], _count: { mode: true } }),
    prisma.enrolment.groupBy({
      by: ['course_id'],
      _count: { course_id: true },
      orderBy: { _count: { course_id: 'desc' } },
      take: 5,
    }),
  ]);

  const topCoursesWithNames = await Promise.all(
    topCourses.map(async (tc) => {
      const course = await prisma.course.findUnique({ where: { course_id: tc.course_id }, select: { course_name: true } });
      return { course_name: course?.course_name, count: tc._count.course_id };
    })
  );

  return {
    enrolmentsByDept: enrolmentsByDept.map((r) => ({ dept_name: r.dept_name, count: Number(r.count) })),
    modeDistribution: modeDistribution.map((m) => ({ mode: m.mode, count: m._count.mode })),
    topCourses: topCoursesWithNames,
  };
};

const facultyService = require('../faculty/faculty.service');

const getFacultySchedule = async (facultyId) => {
  return facultyService.getSchedule(facultyId);
};

const updateFacultySchedule = async (facultyId, courseId, data) => {
  return facultyService.updateSchedule(facultyId, courseId, data, 'ADMIN', true);
};

const assignCourseToFaculty = async (facultyId, courseId) => {
  return prisma.courseFaculty.upsert({
    where: {
      course_id_faculty_id: {
        course_id: Number(courseId),
        faculty_id: Number(facultyId)
      }
    },
    update: {}, // Do nothing if already assigned
    create: {
      course_id: Number(courseId),
      faculty_id: Number(facultyId)
    }
  });
};

module.exports = {
  getDashboardStats, getStudents, createStudent, updateStudent, deleteStudent,
  getFaculties, createFaculty, updateFaculty, deleteFaculty, updateFacultySchedule, getFacultySchedule, assignCourseToFaculty,
  getCourses, createCourse, updateCourse, deleteCourse, assignFaculty,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getEnrolments, approveEnrolment, rejectEnrolment,
  getReportSummary,
};
