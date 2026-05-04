const { Router } = require('express');
const ctrl = require('./student.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();
router.use(verifyToken, requireRole('student'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/courses/available', ctrl.getAvailableCourses);
router.get('/courses/enrolled', ctrl.getEnrolledCourses);
router.post('/courses/:id/enrol', ctrl.enrolInCourse);
router.delete('/enrolments/:id', ctrl.dropCourse);
router.get('/timetable', ctrl.getTimetable);

module.exports = router;
