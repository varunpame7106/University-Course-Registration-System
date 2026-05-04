const { Router } = require('express');
const ctrl = require('./resources.controller');
const verifyToken = require('../../middleware/auth');
const requireRole = require('../../middleware/role');

const router = Router();

// --- Public / Student Read Routes ---
router.get('/library', ctrl.getLibrary);
router.get('/exams', ctrl.getExams);
router.get('/grading', ctrl.getGrading);
router.get('/holidays', ctrl.getHolidays);

// --- Protected Management Routes ---
router.use(verifyToken);

// Faculty-scoped read: ONLY returns this faculty's own uploaded resources
router.get('/faculty/library', requireRole('faculty'), ctrl.getFacultyLibrary);

// Library Management (Faculty Side)
router.post('/admin/library', requireRole('faculty'), ctrl.createLibrary);
router.put('/admin/library/:id', requireRole('faculty'), ctrl.updateLibrary);
router.delete('/admin/library/:id', requireRole('faculty'), ctrl.deleteLibrary);

// Admin read route (needs auth to confirm admin)
router.get('/admin/library', requireRole('admin'), ctrl.getLibrary);

// Admin-only Management
router.use(requireRole('admin'));

// Admin Library Delete (Admin can delete any resource)
router.delete('/admin/library/remove/:id', ctrl.adminDeleteLibrary);

// Exam Management
router.post('/admin/exams', ctrl.createExam);
router.put('/admin/exams/:id', ctrl.updateExam);
router.delete('/admin/exams/:id', ctrl.deleteExam);

// Grading Management
router.put('/admin/grading/component/:id', ctrl.updateGradingComponent);
router.post('/admin/grading/component', ctrl.updateGradingComponent); // For adding new component
router.delete('/admin/grading/component/:id', ctrl.deleteGradingComponent);

router.post('/admin/grading/scale', ctrl.createGradeScale);
router.put('/admin/grading/scale/:id', ctrl.updateGradeScale);
router.delete('/admin/grading/scale/:id', ctrl.deleteGradeScale);

// Holiday Management
router.post('/admin/holidays', ctrl.createHoliday);
router.put('/admin/holidays/:id', ctrl.updateHoliday);
router.delete('/admin/holidays/:id', ctrl.deleteHoliday);

module.exports = router;
