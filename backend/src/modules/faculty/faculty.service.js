const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (facultyId) => {
  return prisma.faculty.findUnique({
    where: { faculty_id: Number(facultyId) },
    select: {
      faculty_id: true, user_id: true, first_name: true, last_name: true,
      phone_no: true, city: true, state: true, pincode: true, dob: true,
      gender: true, dept_id: true, designation: true, created_at: true,
      department: { select: { dept_name: true } },
    },
  });
};

const updateProfile = async (facultyId, data) => {
  const updateData = { ...data };
  if (data.dob) updateData.dob = new Date(data.dob);
  if (data.dept_id) updateData.dept_id = Number(data.dept_id);
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  else delete updateData.password;

  return prisma.faculty.update({
    where: { faculty_id: Number(facultyId) },
    data: updateData,
    select: {
      faculty_id: true, user_id: true, first_name: true, last_name: true,
      phone_no: true, city: true, state: true, pincode: true, dob: true,
      gender: true, dept_id: true, designation: true, created_at: true,
      department: { select: { dept_name: true } },
    },
  });
};

const getMyCourses = async (facultyId) => {
  const fid = Number(facultyId);
  const assignments = await prisma.courseFaculty.findMany({
    where: { faculty_id: fid },
    include: {
      course: {
        include: {
          department: { select: { dept_name: true } },
          _count: { select: { enrolments: { where: { status: 'Approved' } } } },
        },
      },
    },
  });
  return assignments.map((a) => a.course);
};

const getCourseStudents = async (facultyId, courseId) => {
  // Verify faculty is assigned to this course
  const assignment = await prisma.courseFaculty.findFirst({
    where: { faculty_id: Number(facultyId), course_id: Number(courseId) },
  });
  if (!assignment) throw Object.assign(new Error('Access denied to this course'), { statusCode: 403 });

  return prisma.enrolment.findMany({
    where: { course_id: Number(courseId) },
    include: {
      student: {
        select: { student_id: true, first_name: true, last_name: true, user_id: true, year_enrolled: true },
      },
    },
    orderBy: { enrolled_at: 'desc' },
  });
};

const updateCourse = async (facultyId, courseId, data) => {
  const assignment = await prisma.courseFaculty.findFirst({
    where: { faculty_id: Number(facultyId), course_id: Number(courseId) },
  });
  if (!assignment) throw Object.assign(new Error('Access denied to this course'), { statusCode: 403 });

  return prisma.course.update({
    where: { course_id: Number(courseId) },
    data: { course_name: data.course_name, timing: data.timing, duration: data.duration },
  });
};

const getSchedule = async (facultyId) => {
  const fid = Number(facultyId);

  // Fetch course assignments and custom schedule overrides in parallel
  const [assignments, customSchedules] = await Promise.all([
    prisma.courseFaculty.findMany({
      where: { faculty_id: fid },
      include: {
        course: {
          include: {
            department: { select: { dept_name: true } },
          }
        }
      },
    }),
    // Use raw SQL since prisma.schedule isn't in the generated client for this workspace
    prisma.$queryRawUnsafe(
      'SELECT * FROM schedules WHERE faculty_id = ?',
      fid
    )
  ]);

  // Build lookup map: course_id -> schedule row
  const scheduleMap = {};
  for (const s of customSchedules) {
    scheduleMap[s.course_id] = s;
  }

  return assignments.map((a) => {
    const custom = scheduleMap[a.course.course_id];
    return {
      course_id: a.course.course_id,
      course_name: a.course.course_name,
      mode: custom?.mode || a.course.mode,
      timing: custom ? `${custom.days} ${custom.start_time} - ${custom.end_time}` : a.course.timing,
      days: custom?.days || "",
      start_time: custom?.start_time || "",
      end_time: custom?.end_time || "",
      platform: custom?.venue || a.course.platform,
      college_name: a.course.college_name,
      dept_name: a.course.department.dept_name,
      note: custom?.note || "",
      updated_at: custom?.updated_at || a.course.created_at,
      updated_by_role: custom?.updated_by_role || "ADMIN",
      schedule_id: custom?.id || null
    };
  });
};

const updateSchedule = async (facultyId, courseId, data, updatedByRole = 'FACULTY', skipAssignmentCheck = false) => {
  const fid = Number(facultyId);
  const cid = Number(courseId);

  // 1. Verify assignment (if not admin)
  if (!skipAssignmentCheck) {
    const assignment = await prisma.courseFaculty.findFirst({
      where: { faculty_id: fid, course_id: cid },
    });
    if (!assignment) throw Object.assign(new Error('Access denied to this course'), { statusCode: 403 });
  }

  // 2. Overlap validation using raw SQL
  const newDays = data.days.split(',').map(d => d.trim());
  const newStart = parseTimeToMinutes(data.start_time);
  const newEnd = parseTimeToMinutes(data.end_time);

  if (newStart >= newEnd) throw Object.assign(new Error('Start time must be before end time'), { statusCode: 400 });

  const otherSchedules = await prisma.$queryRawUnsafe(
    'SELECT * FROM schedules WHERE faculty_id = ? AND course_id != ?',
    fid, cid
  );

  for (const s of otherSchedules) {
    const sDays = s.days.split(',').map(d => d.trim());
    const commonDays = newDays.filter(d => sDays.includes(d));
    
    if (commonDays.length > 0) {
      const sStart = parseTimeToMinutes(s.start_time);
      const sEnd = parseTimeToMinutes(s.end_time);
      if (newStart < sEnd && newEnd > sStart) {
        throw Object.assign(new Error(`Schedule overlaps with another course on ${commonDays.join(', ')}`), { statusCode: 400 });
      }
    }
  }

  // 3. Upsert schedule using raw SQL (INSERT ... ON DUPLICATE KEY UPDATE)
  await prisma.$executeRawUnsafe(
    `INSERT INTO schedules (faculty_id, course_id, days, start_time, end_time, mode, venue, note, updated_by_role, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       days = VALUES(days),
       start_time = VALUES(start_time),
       end_time = VALUES(end_time),
       mode = VALUES(mode),
       venue = VALUES(venue),
       note = VALUES(note),
       updated_by_role = VALUES(updated_by_role),
       updated_at = NOW()`,
    fid, cid, data.days, data.start_time, data.end_time, data.mode, data.venue, data.note || null, updatedByRole
  );

  // Return the updated schedule row
  const [updated] = await prisma.$queryRawUnsafe(
    'SELECT * FROM schedules WHERE faculty_id = ? AND course_id = ?',
    fid, cid
  );
  return updated;
};

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

const createCourse = async (facultyId, data) => {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        course_name: data.course_name,
        dept_id: Number(data.dept_id),
        duration: data.duration,
        mode: data.mode,
        timing: data.timing,
        platform: data.platform,
        college_name: data.college_name,
        created_by_faculty: Number(facultyId),
        created_by_role: 'FACULTY',
        description: data.description,
      },
    });

    await tx.courseFaculty.create({
      data: {
        course_id: course.course_id,
        faculty_id: Number(facultyId),
      },
    });

    return course;
  });
};

const deleteCourse = async (facultyId, courseId) => {
  const course = await prisma.course.findUnique({
    where: { course_id: Number(courseId) },
    include: { courseFaculty: true },
  });

  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

  // Check if faculty is creator or assigned
  const isCreator = course.created_by_faculty === Number(facultyId);
  const isAssigned = course.courseFaculty.some((cf) => cf.faculty_id === Number(facultyId));

  if (!isCreator && !isAssigned) {
    throw Object.assign(new Error('Access denied to delete this course'), { statusCode: 403 });
  }

  return prisma.$transaction([
    prisma.enrolment.deleteMany({ where: { course_id: Number(courseId) } }),
    prisma.courseFaculty.deleteMany({ where: { course_id: Number(courseId) } }),
    prisma.course.delete({ where: { course_id: Number(courseId) } }),
  ]);
};

module.exports = { getProfile, updateProfile, getMyCourses, getCourseStudents, updateCourse, getSchedule, updateSchedule, createCourse, deleteCourse };
