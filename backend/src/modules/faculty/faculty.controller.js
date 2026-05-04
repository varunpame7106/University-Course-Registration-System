const svc = require('./faculty.service');
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

const getMyCourses = asyncWrapper(async (req, res) => {
  const data = await svc.getMyCourses(req.user.entity_id);
  return sendSuccess(res, data, 'Courses fetched');
});

const getCourseStudents = asyncWrapper(async (req, res) => {
  const data = await svc.getCourseStudents(req.user.entity_id, req.params.id);
  return sendSuccess(res, data, 'Students fetched');
});

const updateCourse = asyncWrapper(async (req, res) => {
  const data = await svc.updateCourse(req.user.entity_id, req.params.id, req.body);
  return sendSuccess(res, data, 'Course updated');
});

const getSchedule = asyncWrapper(async (req, res) => {
  const data = await svc.getSchedule(req.user.entity_id);
  return sendSuccess(res, data, 'Schedule fetched');
});

const updateSchedule = asyncWrapper(async (req, res) => {
  const data = await svc.updateSchedule(req.user.entity_id, req.params.id, req.body);
  return sendSuccess(res, data, 'Schedule updated successfully');
});

const createCourse = asyncWrapper(async (req, res) => {
  const data = await svc.createCourse(req.user.entity_id, req.body);
  return sendSuccess(res, data, 'Course created successfully');
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await svc.deleteCourse(req.user.entity_id, req.params.id);
  return sendSuccess(res, null, 'Course deleted successfully');
});

module.exports = { getProfile, updateProfile, getMyCourses, getCourseStudents, updateCourse, getSchedule, updateSchedule, createCourse, deleteCourse };
