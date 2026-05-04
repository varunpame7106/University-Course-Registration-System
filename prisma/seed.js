const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('../backend/node_modules/bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Clear existing data in correct order
  await prisma.enrolment.deleteMany();
  await prisma.courseFaculty.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.department.deleteMany();
  await prisma.administrator.deleteMany();

  // ─── Admin ────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.administrator.create({
    data: {
      user_id: 'admin',
      password: adminPassword,
    },
  });
  console.log('✅ Admin created: user_id=admin, password=admin123');

  // ─── Departments ──────────────────────────────────────────────
  const deptsData = [
    { name: 'Computer Science' },
    { name: 'Mechanical Engineering' },
    { name: 'Electronics & Communication' },
    { name: 'Civil Engineering' },
    { name: 'Information Technology' },
    { name: 'Electrical Engineering' }
  ];

  const depts = [];
  for (const d of deptsData) {
    const dept = await prisma.department.create({ data: { dept_name: d.name } });
    depts.push(dept);
  }
  console.log(`✅ ${depts.length} Departments created`);

  const [cs, mech, ec, civil, it, elec] = depts;

  // ─── Faculty ──────────────────────────────────────────────────
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const facultyData = [
    { uid: 'FAC001', fn: 'Priya', ln: 'Sharma', domain: 'Artificial Intelligence', desig: 'Professor', dept: cs.dept_id },
    { uid: 'FAC002', fn: 'Rajesh', ln: 'Kumar', domain: 'Thermodynamics', desig: 'Associate Professor', dept: mech.dept_id },
    { uid: 'FAC003', fn: 'Sneha', ln: 'Patil', domain: 'VLSI Design', desig: 'Assistant Professor', dept: ec.dept_id },
    { uid: 'FAC004', fn: 'Amit', ln: 'Verma', domain: 'Structural Engineering', desig: 'Professor', dept: civil.dept_id },
    { uid: 'FAC005', fn: 'Neha', ln: 'Gupta', domain: 'Cyber Security', desig: 'Assistant Professor', dept: it.dept_id },
    { uid: 'FAC006', fn: 'Vikram', ln: 'Singh', domain: 'Power Systems', desig: 'Associate Professor', dept: elec.dept_id },
    { uid: 'FAC007', fn: 'Anjali', ln: 'Deshmukh', domain: 'Machine Learning', desig: 'Assistant Professor', dept: cs.dept_id },
    { uid: 'FAC008', fn: 'Sanjay', ln: 'Rathod', domain: 'Fluid Dynamics', desig: 'Professor', dept: mech.dept_id },
    { uid: 'FAC009', fn: 'Kavita', ln: 'Iyer', domain: 'Digital Electronics', desig: 'Associate Professor', dept: ec.dept_id },
    { uid: 'FAC010', fn: 'Rahul', ln: 'Bose', domain: 'Software Engineering', desig: 'Assistant Professor', dept: it.dept_id }
  ];

  const faculties = [];
  for (const f of facultyData) {
    const faculty = await prisma.faculty.create({
      data: {
        user_id: f.uid,
        password: facultyPassword,
        first_name: f.fn,
        last_name: f.ln,
        dob: new Date('1980-01-01'),
        gender: faculties.length % 2 === 0 ? 'Male' : 'Female',
        address: 'Faculty Housing, University Campus',
        domain: f.domain,
        designation: f.desig,
        contact_no: `98000000${faculties.length}`,
        dept_id: f.dept,
      },
    });
    faculties.push(faculty);
  }
  console.log(`✅ ${faculties.length} Faculty members created`);

  // ─── Courses ──────────────────────────────────────────────────
  const coursesData = [
    { name: 'Machine Learning Fundamentals', dept: cs.dept_id, mode: 'Online', timing: 'Mon, Wed 10:00 AM' },
    { name: 'Fluid Mechanics', dept: mech.dept_id, mode: 'Offline', timing: 'Tue, Thu 2:00 PM' },
    { name: 'VLSI Circuit Design', dept: ec.dept_id, mode: 'Online', timing: 'Fri 9:00 AM' },
    { name: 'Cloud Computing', dept: cs.dept_id, mode: 'Online', timing: 'Tue, Thu 11:00 AM' },
    { name: 'Heat Transfer', dept: mech.dept_id, mode: 'Offline', timing: 'Mon, Wed 4:00 PM' },
    { name: 'Digital Signal Processing', dept: ec.dept_id, mode: 'Offline', timing: 'Wed, Fri 1:00 PM' },
    { name: 'Surveying & Levelling', dept: civil.dept_id, mode: 'Offline', timing: 'Mon, Fri 8:00 AM' },
    { name: 'Database Systems', dept: it.dept_id, mode: 'Online', timing: 'Sat 10:00 AM' },
    { name: 'Control Systems', dept: elec.dept_id, mode: 'Offline', timing: 'Tue, Thu 3:00 PM' },
    { name: 'Web Technologies', dept: it.dept_id, mode: 'Online', timing: 'Wed 2:00 PM' },
    { name: 'Concrete Technology', dept: civil.dept_id, mode: 'Offline', timing: 'Thu 10:00 AM' },
    { name: 'Electric Machines', dept: elec.dept_id, mode: 'Offline', timing: 'Mon 2:00 PM' }
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: {
        course_name: c.name,
        dept_id: c.dept,
        duration: '45 hrs / semester',
        mode: c.mode,
        platform: c.mode === 'Online' ? 'Zoom' : null,
        college_name: c.mode === 'Offline' ? 'Main Engineering Block' : null,
        timing: c.timing,
        created_by: admin.admin_id,
      },
    });
    courses.push(course);
  }
  console.log(`✅ ${courses.length} Courses created`);

  // ─── Assign Faculty to Courses ────────────────────────────────
  for (let i = 0; i < courses.length; i++) {
    await prisma.courseFaculty.create({
      data: { 
        course_id: courses[i].course_id, 
        faculty_id: faculties[i % faculties.length].faculty_id 
      }
    });
  }
  console.log('✅ Faculty assigned to courses');

  // ─── Students ─────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];
  const firstNames = ['Aarav', 'Ishaan', 'Ananya', 'Riya', 'Dev', 'Aditya', 'Sanya', 'Kabir', 'Zoya', 'Arjun', 'Myra', 'Vivaan', 'Diya', 'Vihaan', 'Kiara', 'Aaryan', 'Ira', 'Reyansh', 'Sia', 'Advait'];
  const lastNames = ['Mehta', 'Joshi', 'Singh', 'Desai', 'Patel', 'Sharma', 'Kapoor', 'Verma', 'Gupta', 'Malhotra', 'Reddy', 'Iyer', 'Choudhury', 'Das', 'Sen', 'Nair', 'Pillai', 'Bose', 'Dutta', 'Roy'];

  for (let i = 1; i <= 30; i++) {
    const year = i <= 15 ? 2024 : 2023;
    const student = await prisma.student.create({
      data: {
        user_id: `PRN${year}${String(i).padStart(3, '0')}`,
        password: studentPassword,
        first_name: firstNames[i % firstNames.length],
        last_name: lastNames[i % lastNames.length],
        dob: new Date('2002-01-01'),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        phone_no: `9000000${String(i).padStart(3, '0')}`,
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        year_enrolled: year,
        dept_id: depts[i % depts.length].dept_id,
      },
    });
    students.push(student);
  }
  console.log(`✅ ${students.length} Students created`);

  // ─── Sample Enrolments ────────────────────────────────────────
  const statuses = ['Approved', 'Pending', 'Dropped'];
  for (const s of students) {
    // Each student enrols in 2-3 random courses
    const numEnrolments = Math.floor(Math.random() * 2) + 2;
    const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
    const selected = shuffledCourses.slice(0, numEnrolments);
    
    for (const c of selected) {
      await prisma.enrolment.create({
        data: {
          student_id: s.student_id,
          course_id: c.course_id,
          status: statuses[Math.floor(Math.random() * 2)], // Mostly Approved/Pending
        }
      }).catch(() => {}); // Skip duplicates
    }
  }
  console.log('✅ Mass enrolments created');

  console.log('\n🎉 Comprehensive Seed complete!');
  console.log(`  Total Departments : ${depts.length}`);
  console.log(`  Total Faculty     : ${faculties.length}`);
  console.log(`  Total Courses     : ${courses.length}`);
  console.log(`  Total Students    : ${students.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
