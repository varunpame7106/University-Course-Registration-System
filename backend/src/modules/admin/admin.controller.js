const adminService = require('./admin.service');
const asyncWrapper = require('../../utils/asyncWrapper');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// Dashboard
const getDashboardStats = asyncWrapper(async (req, res) => {
  const data = await adminService.getDashboardStats();
  return sendSuccess(res, data, 'Dashboard stats fetched');
});

// Students
const getStudents = asyncWrapper(async (req, res) => {
  const result = await adminService.getStudents(req.query);
  return sendSuccess(res, result.data, 'Students fetched', result.pagination);
});

const createStudent = asyncWrapper(async (req, res) => {
  const student = await adminService.createStudent(req.body);
  return sendSuccess(res, student, 'Student created', null, 201);
});

const updateStudent = asyncWrapper(async (req, res) => {
  const student = await adminService.updateStudent(req.params.id, req.body);
  return sendSuccess(res, student, 'Student updated');
});

const deleteStudent = asyncWrapper(async (req, res) => {
  await adminService.deleteStudent(req.params.id);
  return sendSuccess(res, null, 'Student deleted');
});

// Faculty
const getFaculties = asyncWrapper(async (req, res) => {
  const result = await adminService.getFaculties(req.query);
  return sendSuccess(res, result.data, 'Faculty fetched', result.pagination);
});

const createFaculty = asyncWrapper(async (req, res) => {
  const faculty = await adminService.createFaculty(req.body);
  return sendSuccess(res, faculty, 'Faculty created', null, 201);
});

const updateFaculty = asyncWrapper(async (req, res) => {
  const faculty = await adminService.updateFaculty(req.params.id, req.body);
  return sendSuccess(res, faculty, 'Faculty updated');
});

const deleteFaculty = asyncWrapper(async (req, res) => {
  await adminService.deleteFaculty(req.params.id);
  return sendSuccess(res, null, 'Faculty deleted');
});

// Courses
const getCourses = asyncWrapper(async (req, res) => {
  const result = await adminService.getCourses(req.query);
  return sendSuccess(res, result.data, 'Courses fetched', result.pagination);
});

const createCourse = asyncWrapper(async (req, res) => {
  const data = { ...req.body, created_by: req.user.entity_id };
  const course = await adminService.createCourse(data);
  return sendSuccess(res, course, 'Course created', null, 201);
});

const updateCourse = asyncWrapper(async (req, res) => {
  const course = await adminService.updateCourse(req.params.id, req.body);
  return sendSuccess(res, course, 'Course updated');
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await adminService.deleteCourse(req.params.id);
  return sendSuccess(res, null, 'Course deleted');
});

const assignFaculty = asyncWrapper(async (req, res) => {
  const { faculty_ids } = req.body;
  if (!Array.isArray(faculty_ids)) return sendError(res, 'faculty_ids must be an array', [], 400);
  const result = await adminService.assignFaculty(req.params.id, faculty_ids);
  return sendSuccess(res, result, 'Faculty assigned to course');
});

// Departments
const getDepartments = asyncWrapper(async (req, res) => {
  const data = await adminService.getDepartments();
  return sendSuccess(res, data, 'Departments fetched');
});

const createDepartment = asyncWrapper(async (req, res) => {
  const dept = await adminService.createDepartment(req.body.dept_name);
  return sendSuccess(res, dept, 'Department created', null, 201);
});

const updateDepartment = asyncWrapper(async (req, res) => {
  const dept = await adminService.updateDepartment(req.params.id, req.body.dept_name);
  return sendSuccess(res, dept, 'Department updated');
});

const deleteDepartment = asyncWrapper(async (req, res) => {
  await adminService.deleteDepartment(req.params.id);
  return sendSuccess(res, null, 'Department deleted');
});

// Enrolments
const getEnrolments = asyncWrapper(async (req, res) => {
  const result = await adminService.getEnrolments(req.query);
  return sendSuccess(res, result.data, 'Enrolments fetched', result.pagination);
});

const approveEnrolment = asyncWrapper(async (req, res) => {
  const enrolment = await adminService.approveEnrolment(req.params.id);
  return sendSuccess(res, enrolment, 'Enrolment approved');
});

const rejectEnrolment = asyncWrapper(async (req, res) => {
  const enrolment = await adminService.rejectEnrolment(req.params.id);
  return sendSuccess(res, enrolment, 'Enrolment rejected');
});

// Reports
const getReportSummary = asyncWrapper(async (req, res) => {
  const data = await adminService.getReportSummary();
  return sendSuccess(res, data, 'Report summary fetched');
});

const getFacultySchedule = asyncWrapper(async (req, res) => {
  const data = await adminService.getFacultySchedule(req.params.facultyId);
  return sendSuccess(res, data, 'Faculty schedule fetched');
});

const updateFacultySchedule = asyncWrapper(async (req, res) => {
  const data = await adminService.updateFacultySchedule(req.params.facultyId, req.params.courseId, req.body);
  return sendSuccess(res, data, 'Faculty schedule updated');
});

const assignCourseToFaculty = asyncWrapper(async (req, res) => {
  const data = await adminService.assignCourseToFaculty(req.params.facultyId, req.body.course_id);
  return sendSuccess(res, data, 'Course assigned to faculty');
});

module.exports = {
  getDashboardStats,
  getStudents, createStudent, updateStudent, deleteStudent,
  getFaculties, createFaculty, updateFaculty, deleteFaculty, updateFacultySchedule, getFacultySchedule, assignCourseToFaculty,
  getCourses, createCourse, updateCourse, deleteCourse, assignFaculty,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getEnrolments, approveEnrolment, rejectEnrolment,
  getReportSummary,
};
