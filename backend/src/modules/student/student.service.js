const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

const studentSelect = {
  student_id: true, user_id: true, first_name: true, last_name: true,
  phone_no: true, city: true, state: true, pincode: true, dob: true,
  gender: true, year_enrolled: true, dept_id: true, created_at: true,
  address: true, guardian_name: true, alt_phone: true,
  emergency_contact: true, blood_group: true, profile_image_url: true,
  department: { select: { dept_name: true } },
};

const getProfile = async (studentId) => {
  return prisma.student.findUnique({
    where: { student_id: Number(studentId) },
    select: studentSelect,
  });
};

const updateProfile = async (studentId, data) => {
  // Whitelist editable fields to prevent accidental or malicious updates to restricted fields
  const editableFields = [
    'phone_no', 'city', 'state', 'pincode', 'gender', 'address', 'dob',
    'guardian_name', 'alt_phone', 'emergency_contact', 'blood_group', 'profile_image_url'
  ];

  const updateData = {};
  
  // Only include fields that are in our whitelist
  editableFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (updateData.dob) updateData.dob = new Date(updateData.dob);
  
  // Handle password separately as it's not in the editableFields whitelist for profile info
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.student.update({
    where: { student_id: Number(studentId) },
    data: updateData,
    select: studentSelect,
  });
};

const getAvailableCourses = async (studentId) => {
  const enrolled = await prisma.enrolment.findMany({
    where: { student_id: Number(studentId) },
    select: { course_id: true },
  });
  const enrolledIds = enrolled.map((e) => e.course_id);

  return prisma.course.findMany({
    where: enrolledIds.length > 0 ? { course_id: { notIn: enrolledIds } } : {},
    include: {
      department: { select: { dept_name: true } },
      courseFaculty: {
        include: { faculty: { select: { first_name: true, last_name: true, designation: true } } },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

const getEnrolledCourses = async (studentId) => {
  return prisma.enrolment.findMany({
    where: { student_id: Number(studentId) },
    include: {
      course: {
        include: {
          department: { select: { dept_name: true } },
          courseFaculty: { include: { faculty: { select: { first_name: true, last_name: true } } } },
        },
      },
    },
    orderBy: { enrolled_at: 'desc' },
  });
};

const enrolInCourse = async (studentId, courseId) => {
  const existing = await prisma.enrolment.findFirst({
    where: { student_id: Number(studentId), course_id: Number(courseId) },
  });
  if (existing) throw Object.assign(new Error('Already enrolled in this course'), { statusCode: 409 });

  return prisma.enrolment.create({
    data: { student_id: Number(studentId), course_id: Number(courseId), status: 'Pending' },
    include: { course: { select: { course_name: true } } },
  });
};

const dropCourse = async (studentId, enrolmentId) => {
  const enrolment = await prisma.enrolment.findFirst({
    where: { enrolment_id: Number(enrolmentId), student_id: Number(studentId) },
  });
  if (!enrolment) throw Object.assign(new Error('Enrolment not found'), { statusCode: 404 });
  return prisma.enrolment.delete({ where: { enrolment_id: Number(enrolmentId) } });
};

const getTimetable = async (studentId) => {
  const enrolments = await prisma.enrolment.findMany({
    where: { student_id: Number(studentId), status: 'Approved' },
    include: {
      course: {
        include: {
          department: { select: { dept_name: true } },
          courseFaculty: { include: { faculty: { select: { first_name: true, last_name: true } } } },
        },
      },
    },
  });
  return enrolments.map((e) => e.course);
};

module.exports = { getProfile, updateProfile, getAvailableCourses, getEnrolledCourses, enrolInCourse, dropCourse, getTimetable };
