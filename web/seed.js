const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = [
    { username: 'employee', password: 'emp123', role: 'employee' },
    { username: 'employee1', password: 'password', role: 'employee' },
    { username: 'employee2', password: 'password', role: 'employee' },
    { username: 'auditor', password: 'auditor123', role: 'auditor' },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: u,
    });
  }
  console.log('Seeded users:', await prisma.user.findMany());
}
main()
  .then(() => console.log('Seeded users successfully'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
