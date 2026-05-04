const service = require('./resources.service');

const wrap = (fn) => async (req, res, next) => {
  try {
    const result = await Promise.resolve(fn(req, res));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// Library
const getLibrary = wrap((req) => service.getAllLibrary(req.query));

// Faculty-scoped library — returns only resources uploaded by THIS faculty
const getFacultyLibrary = wrap((req) => {
  const { entity_id } = req.user;  // entity_id = faculty_id from JWT
  return service.getFacultyLibrary(req.query, entity_id);
});

const createLibrary = wrap((req) => {
  const { role, entity_id } = req.user;
  if (role !== 'faculty') {
    const err = new Error('Only faculty members can add resources');
    err.statusCode = 403;
    throw err;
  }
  return service.createLibrary(req.body, entity_id);
});

const updateLibrary = wrap((req) => {
  const { role, entity_id } = req.user;
  if (role !== 'faculty') {
    const err = new Error('Admin cannot modify library resources');
    err.statusCode = 403;
    throw err;
  }
  return service.updateLibrary(req.params.id, req.body, entity_id);
});

const deleteLibrary = wrap((req) => {
  const { role, entity_id } = req.user;
  if (role !== 'faculty') {
    const err = new Error('Admin cannot delete library resources via this route');
    err.statusCode = 403;
    throw err;
  }
  return service.deleteLibrary(req.params.id, entity_id);
});

const adminDeleteLibrary = wrap((req) => {
  // Admin can delete any resource - no ownership check
  return service.deleteLibrary(req.params.id, null);
});

// Exams
const getExams = wrap((req) => service.getAllExams(req.query));
const createExam = wrap((req) => service.createExam(req.body));
const updateExam = wrap((req) => service.updateExam(req.params.id, req.body));
const deleteExam = wrap((req) => service.deleteExam(req.params.id));

// Grading
const getGrading = wrap(async () => {
  const components = await service.getGradingRubric();
  const scales = await service.getGradeScales();
  return { components, scales };
});

const updateGradingComponent = wrap((req) => service.updateGradingRubric(req.params.id, req.body));
const deleteGradingComponent = wrap((req) => service.deleteGradingRubric(req.params.id));

const createGradeScale = wrap((req) => service.createGradeScale(req.body));
const updateGradeScale = wrap((req) => service.updateGradeScale(req.params.id, req.body));
const deleteGradeScale = wrap((req) => service.deleteGradeScale(req.params.id));

// Holidays
const getHolidays = wrap((req) => service.getAllHolidays(req.query));
const createHoliday = wrap((req) => service.createHoliday(req.body));
const updateHoliday = wrap((req) => service.updateHoliday(req.params.id, req.body));
const deleteHoliday = wrap((req) => service.deleteHoliday(req.params.id));

module.exports = {
  getLibrary, getFacultyLibrary, createLibrary, updateLibrary, deleteLibrary, adminDeleteLibrary,
  getExams, createExam, updateExam, deleteExam,
  getGrading, updateGradingComponent, deleteGradingComponent,
  createGradeScale, updateGradeScale, deleteGradeScale,
  getHolidays, createHoliday, updateHoliday, deleteHoliday
};
