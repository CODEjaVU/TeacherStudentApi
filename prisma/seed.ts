import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Teachers
  const teacher1 = await prisma.teacher.create({
    data: { email: "teacherken@gmail.com" },
  });

  const teacher2 = await prisma.teacher.create({
    data: { email: "teachertony@gmail.com" },
  });

  // Create Students with associated teachers
  const student1 = await prisma.student.create({
    data: {
      email: "studentjon@gmail.com",
      isSuspended: false,
      teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] }, // Many-to-many relation
    },
  });

  const student2 = await prisma.student.create({
    data: {
      email: "studentmark@gmail.com",
      isSuspended: true,
      teachers: { connect: [{ id: teacher1.id }] }, // Only connected to one teacher
    },
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
