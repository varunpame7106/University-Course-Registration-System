const { Router } = require('express');
const ctrl = require('./faculty.controller');
const adminCtrl = require('../admin/admin.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();
router.use(verifyToken, requireRole('faculty'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/courses', ctrl.getMyCourses);
router.get('/courses/:id/students', ctrl.getCourseStudents);
router.get('/departments', adminCtrl.getDepartments);
router.post('/courses', ctrl.createCourse);
router.put('/courses/:id', ctrl.updateCourse);
router.delete('/courses/:id', ctrl.deleteCourse);
router.get('/schedule', ctrl.getSchedule);
router.put('/schedule/:id', ctrl.updateSchedule);

module.exports = router;
