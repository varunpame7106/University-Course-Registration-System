const prisma = require('../../config/db');

// --- Library Resources ---
const getAllLibrary = async (params) => {
  const { search, category, status } = params;
  return prisma.libraryResource.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { title: { contains: search } },
            { subject: { contains: search } },
            { author: { contains: search } }
          ]
        } : {},
        category && category !== 'All' ? { category } : {},
        status ? { status } : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Faculty-scoped: only returns resources uploaded by this faculty member
const getFacultyLibrary = async (params, facultyId) => {
  const { search, category, status } = params;
  return prisma.libraryResource.findMany({
    where: {
      uploaded_by_faculty_id: facultyId,
      AND: [
        search ? {
          OR: [
            { title: { contains: search } },
            { subject: { contains: search } },
            { author: { contains: search } }
          ]
        } : {},
        category && category !== 'All' ? { category } : {},
        status ? { status } : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
};

const createLibrary = async (data, facultyId) => {
  const faculty = await prisma.faculty.findUnique({ where: { faculty_id: facultyId } });
  if (!faculty) throw new Error('Faculty member not found');

  return prisma.libraryResource.create({
    data: {
      ...data,
      uploaded_by_faculty_id: facultyId,
      uploaded_by_name: `${faculty.first_name} ${faculty.last_name}`
    }
  });
};

const updateLibrary = async (id, data, facultyId) => {
  const resource = await prisma.libraryResource.findUnique({ where: { id: parseInt(id) } });
  if (!resource) throw new Error('Resource not found');

  if (facultyId && resource.uploaded_by_faculty_id !== facultyId) {
    throw new Error('Access denied. You can only edit your own resources.');
  }

  return prisma.libraryResource.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteLibrary = async (id, facultyId) => {
  const resource = await prisma.libraryResource.findUnique({ where: { id: parseInt(id) } });
  if (!resource) throw new Error('Resource not found');

  if (facultyId && resource.uploaded_by_faculty_id !== facultyId) {
    throw new Error('Access denied. You can only delete your own resources.');
  }

  return prisma.libraryResource.delete({ where: { id: parseInt(id) } });
};

// --- Exam Schedules ---
const getAllExams = async (params) => {
  const { search, semester, status } = params;
  return prisma.examSchedule.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { subjectName: { contains: search } },
            { subjectCode: { contains: search } }
          ]
        } : {},
        semester && semester !== 'All' ? { semester } : {},
        status ? { status } : {}
      ]
    },
    orderBy: { examDate: 'asc' }
  });
};

const createExam = async (data) => {
  // Simple duplicate check (same date, time, hall)
  const exists = await prisma.examSchedule.findFirst({
    where: {
      examDate: new Date(data.examDate),
      startTime: data.startTime,
      hall: data.hall
    }
  });
  if (exists) throw new Error('Exam already scheduled at this time and hall');
  
  return prisma.examSchedule.create({ 
    data: { ...data, examDate: new Date(data.examDate) } 
  });
};

const updateExam = async (id, data) => prisma.examSchedule.update({ 
  where: { id: parseInt(id) }, 
  data: { ...data, examDate: data.examDate ? new Date(data.examDate) : undefined } 
});

const deleteExam = async (id) => prisma.examSchedule.delete({ where: { id: parseInt(id) } });

// --- Grading Rubric ---
const getGradingRubric = async () => prisma.gradingRubric.findMany();
const updateGradingRubric = async (id, data) => prisma.gradingRubric.upsert({
  where: { id: parseInt(id) || 0 },
  update: data,
  create: data
});
const deleteGradingRubric = async (id) => prisma.gradingRubric.delete({ where: { id: parseInt(id) } });

const getGradeScales = async () => prisma.gradeScale.findMany({ orderBy: { minPercent: 'desc' } });
const createGradeScale = async (data) => prisma.gradeScale.create({ data });
const updateGradeScale = async (id, data) => prisma.gradeScale.update({ where: { id: parseInt(id) }, data });
const deleteGradeScale = async (id) => prisma.gradeScale.delete({ where: { id: parseInt(id) } });

// --- Holidays ---
const getAllHolidays = async (params) => {
  const { search, type, status } = params;
  return prisma.holiday.findMany({
    where: {
      AND: [
        search ? { title: { contains: search } } : {},
        type && type !== 'All' ? { type } : {},
        status ? { status } : {}
      ]
    },
    orderBy: { date: 'asc' }
  });
};

const createHoliday = async (data) => prisma.holiday.create({ 
  data: { ...data, date: new Date(data.date) } 
});

const updateHoliday = async (id, data) => prisma.holiday.update({ 
  where: { id: parseInt(id) }, 
  data: { ...data, date: data.date ? new Date(data.date) : undefined } 
});

const deleteHoliday = async (id) => prisma.holiday.delete({ where: { id: parseInt(id) } });

module.exports = {
  getAllLibrary, getFacultyLibrary, createLibrary, updateLibrary, deleteLibrary,
  getAllExams, createExam, updateExam, deleteExam,
  getGradingRubric, updateGradingRubric, deleteGradingRubric,
  getGradeScales, createGradeScale, updateGradeScale, deleteGradeScale,
  getAllHolidays, createHoliday, updateHoliday, deleteHoliday
};
