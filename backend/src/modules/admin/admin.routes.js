const { Router } = require('express');
const ctrl = require('./admin.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');
const { validateStudent, validateFaculty, validateDepartment } = require('../../middleware/validation');

const router = Router();
router.use(verifyToken, requireRole('admin'));

// Dashboard
router.get('/dashboard/stats', ctrl.getDashboardStats);

// Students
router.get('/students', ctrl.getStudents);
router.post('/students', validateStudent, ctrl.createStudent);
router.put('/students/:id', validateStudent, ctrl.updateStudent);
router.delete('/students/:id', ctrl.deleteStudent);

// Faculty
router.get('/faculties', ctrl.getFaculties);
router.post('/faculties', validateFaculty, ctrl.createFaculty);
router.put('/faculties/:id', validateFaculty, ctrl.updateFaculty);
router.delete('/faculties/:id', ctrl.deleteFaculty);
router.get('/faculties/:facultyId/schedule', ctrl.getFacultySchedule);
router.put('/faculties/:facultyId/courses/:courseId/schedule', ctrl.updateFacultySchedule);
router.post('/faculties/:facultyId/assign-course', ctrl.assignCourseToFaculty);

// Courses
router.get('/courses', ctrl.getCourses);
router.post('/courses', ctrl.createCourse);
router.put('/courses/:id', ctrl.updateCourse);
router.delete('/courses/:id', ctrl.deleteCourse);
router.post('/courses/:id/assign-faculty', ctrl.assignFaculty);

// Departments
router.get('/departments', ctrl.getDepartments);
router.post('/departments', validateDepartment, ctrl.createDepartment);
router.put('/departments/:id', validateDepartment, ctrl.updateDepartment);
router.delete('/departments/:id', ctrl.deleteDepartment);

// Enrolments
router.get('/enrolments', ctrl.getEnrolments);
router.put('/enrolments/:id/approve', ctrl.approveEnrolment);
router.put('/enrolments/:id/reject', ctrl.rejectEnrolment);

// Reports
router.get('/reports/summary', ctrl.getReportSummary);

module.exports = router;
