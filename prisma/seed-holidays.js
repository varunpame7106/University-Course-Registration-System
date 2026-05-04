const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const holidays = [
  {
    title: 'Republic Day',
    date: new Date('2026-01-26'),
    type: 'Public',
    description: 'National holiday celebrating the adoption of the Indian Constitution.',
    status: 'Active',
  },
  {
    title: 'Holi',
    date: new Date('2026-03-03'),
    type: 'Public',
    description: 'Festival of colours celebrated across India.',
    status: 'Active',
  },
  {
    title: 'Good Friday',
    date: new Date('2026-04-03'),
    type: 'Public',
    description: 'National holiday commemorating the crucifixion of Jesus Christ.',
    status: 'Active',
  },
  {
    title: 'Summer Break Begins',
    date: new Date('2026-05-01'),
    type: 'Vacation',
    description: 'University summer vacation commences. Campus offices open on reduced schedule.',
    status: 'Active',
  },
  {
    title: 'Independence Day',
    date: new Date('2026-08-15'),
    type: 'Public',
    description: 'National holiday marking India\'s independence from British rule in 1947.',
    status: 'Active',
  },
  {
    title: 'Ganesh Chaturthi',
    date: new Date('2026-08-22'),
    type: 'Public',
    description: 'Major festival honouring Lord Ganesha, widely celebrated in Maharashtra.',
    status: 'Active',
  },
  {
    title: 'Gandhi Jayanti',
    date: new Date('2026-10-02'),
    type: 'Public',
    description: 'National holiday celebrating the birth anniversary of Mahatma Gandhi.',
    status: 'Active',
  },
  {
    title: 'Dussehra',
    date: new Date('2026-10-20'),
    type: 'Public',
    description: 'Vijayadashami — celebrates the victory of good over evil.',
    status: 'Active',
  },
  {
    title: 'Diwali Break',
    date: new Date('2026-11-07'),
    type: 'Vacation',
    description: 'University Diwali holiday break. Classes resume after Diwali week.',
    status: 'Active',
  },
  {
    title: 'Diwali',
    date: new Date('2026-11-08'),
    type: 'Public',
    description: 'Festival of lights — the biggest festival on the Indian calendar.',
    status: 'Active',
  },
  {
    title: 'Annual Sports Day',
    date: new Date('2026-11-20'),
    type: 'Event',
    description: 'University Annual Sports Day. All students and faculty are encouraged to participate.',
    status: 'Active',
  },
  {
    title: 'Christmas Day',
    date: new Date('2026-12-25'),
    type: 'Public',
    description: 'National holiday celebrating the birth of Jesus Christ.',
    status: 'Active',
  },
  {
    title: 'Winter Break',
    date: new Date('2026-12-27'),
    type: 'Vacation',
    description: 'University winter vacation. Campus reopens in January.',
    status: 'Active',
  },
];

async function main() {
  console.log('🌱 Seeding holidays...\n');

  let created = 0;
  let skipped = 0;

  for (const h of holidays) {
    const exists = await prisma.holiday.findFirst({
      where: { title: h.title, date: h.date },
    });

    if (exists) {
      console.log(`⚠️  Skipped (already exists): ${h.title}`);
      skipped++;
    } else {
      await prisma.holiday.create({ data: h });
      console.log(`✅ Created: ${h.title} (${h.date.toDateString()})`);
      created++;
    }
  }

  console.log(`\n🎉 Done! ${created} holidays created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
