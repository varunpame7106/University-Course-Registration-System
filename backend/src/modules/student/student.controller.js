const svc = require('./student.service');
const asyncWrapper = require('../../utils/asyncWrapper');
const { sendSuccess } = require('../../utils/apiResponse');

const getProfile = asyncWrapper(async (req, res) => {
  const data = await svc.getProfile(req.user.entity_id);
  return sendSuccess(res, data, 'Profile fetched');
});

const updateProfile = asyncWrapper(async (req, res) => {
  const data = await svc.updateProfile(req.user.entity_id, req.body);
  return sendSuccess(res, data, 'Profile updated');
});

const getAvailableCourses = asyncWrapper(async (req, res) => {
  const data = await svc.getAvailableCourses(req.user.entity_id);
  return sendSuccess(res, data, 'Available courses fetched');
});

const getEnrolledCourses = asyncWrapper(async (req, res) => {
  const data = await svc.getEnrolledCourses(req.user.entity_id);
  return sendSuccess(res, data, 'Enrolled courses fetched');
});

const enrolInCourse = asyncWrapper(async (req, res) => {
  const data = await svc.enrolInCourse(req.user.entity_id, req.params.id);
  return sendSuccess(res, data, 'Enrolled successfully', null, 201);
});

const dropCourse = asyncWrapper(async (req, res) => {
  await svc.dropCourse(req.user.entity_id, req.params.id);
  return sendSuccess(res, null, 'Course dropped successfully');
});

const getTimetable = asyncWrapper(async (req, res) => {
  const data = await svc.getTimetable(req.user.entity_id);
  return sendSuccess(res, data, 'Timetable fetched');
});

module.exports = { getProfile, updateProfile, getAvailableCourses, getEnrolledCourses, enrolInCourse, dropCourse, getTimetable };
