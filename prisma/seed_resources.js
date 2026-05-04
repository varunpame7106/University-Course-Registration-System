const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Academic Resources dummy data...');

  // 1. Digital Library Resources
  const libraryData = [
    { title: 'Data Structures and Algorithms', subject: 'Computer Science', author: 'Robert Lafore', category: 'Computer Science', description: 'Comprehensive guide to DSA', fileUrl: 'https://example.com/dsa.pdf', status: 'Active' },
    { title: 'Database Systems: The Complete Book', subject: 'IT', author: 'Hector Garcia-Molina', category: 'Computer Science', description: 'In-depth database management', fileUrl: 'https://example.com/dbms.pdf', status: 'Active' },
    { title: 'Modern Operating Systems', subject: 'CS', author: 'Andrew Tanenbaum', category: 'Computer Science', description: 'OS fundamentals', fileUrl: 'https://example.com/os.pdf', status: 'Active' },
    { title: 'Engineering Mathematics', subject: 'Mathematics', author: 'K.A. Stroud', category: 'Engineering', description: 'Advanced math for engineers', fileUrl: 'https://example.com/math.pdf', status: 'Active' },
    { title: 'Mechanical Vibrations', subject: 'Mechanical', author: 'S.S. Rao', category: 'Mechanical', description: 'Vibration analysis', fileUrl: 'https://example.com/mech.pdf', status: 'Active' },
  ];

  for (const lib of libraryData) {
    await prisma.libraryResource.create({ data: lib });
  }
  console.log('✅ Library resources seeded');

  // 2. Exam Schedules
  const examData = [
    { subjectCode: 'CS301', subjectName: 'Database Management Systems', semester: 'Sem 5', examDate: new Date('2026-05-10'), startTime: '10:00 AM', duration: '3 Hours', hall: 'Hall A', status: 'Upcoming' },
    { subjectCode: 'CS302', subjectName: 'Operating Systems', semester: 'Sem 5', examDate: new Date('2026-05-12'), startTime: '02:00 PM', duration: '3 Hours', hall: 'Hall B', status: 'Upcoming' },
    { subjectCode: 'CS303', subjectName: 'Computer Networks', semester: 'Sem 5', examDate: new Date('2026-05-15'), startTime: '10:00 AM', duration: '3 Hours', hall: 'Lab 1', status: 'Upcoming' },
    { subjectCode: 'HS201', subjectName: 'Professional Ethics', semester: 'Sem 4', examDate: new Date('2026-04-20'), startTime: '10:00 AM', duration: '2 Hours', hall: 'Online', status: 'Completed' },
  ];

  for (const exam of examData) {
    await prisma.examSchedule.create({ data: exam });
  }
  console.log('✅ Exam schedules seeded');

  // 3. Grading Rubric
  const gradingComponents = [
    { component: 'Attendance', marks: 10 },
    { component: 'Assignment', marks: 10 },
    { component: 'Mid Sem Exam', marks: 30 },
    { component: 'End Sem Exam', marks: 50 },
  ];

  for (const comp of gradingComponents) {
    await prisma.gradingRubric.create({ data: comp });
  }
  console.log('✅ Grading components seeded');

  // 4. Grade Scales
  const gradeScales = [
    { grade: 'O', minPercent: 90, maxPercent: 100, gpa: 10.0 },
    { grade: 'A+', minPercent: 80, maxPercent: 89, gpa: 9.0 },
    { grade: 'A', minPercent: 70, maxPercent: 79, gpa: 8.0 },
    { grade: 'B+', minPercent: 60, maxPercent: 69, gpa: 7.0 },
    { grade: 'B', minPercent: 50, maxPercent: 59, gpa: 6.0 },
    { grade: 'C', minPercent: 40, maxPercent: 49, gpa: 5.0 },
    { grade: 'F', minPercent: 0, maxPercent: 39, gpa: 0.0 },
  ];

  for (const scale of gradeScales) {
    await prisma.gradeScale.create({ data: scale });
  }
  console.log('✅ Grade scales seeded');

  // 5. Holidays
  const holidayData = [
    { title: 'Republic Day', date: new Date('2026-01-26'), type: 'Public', description: 'National Holiday', status: 'Active' },
    { title: 'Holi Festival', date: new Date('2026-03-14'), type: 'Public', description: 'Festival of Colors', status: 'Active' },
    { title: 'Independence Day', date: new Date('2026-08-15'), type: 'Public', description: 'National Holiday', status: 'Active' },
    { title: 'Diwali Break', date: new Date('2026-11-05'), type: 'Vacation', description: 'Winter Break', status: 'Active' },
    { title: 'Christmas', date: new Date('2026-12-25'), type: 'Public', description: 'Winter Festival', status: 'Active' },
  ];

  for (const hol of holidayData) {
    await prisma.holiday.create({ data: hol });
  }
  console.log('✅ Holidays seeded');

  console.log('\n🎉 Resources Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
