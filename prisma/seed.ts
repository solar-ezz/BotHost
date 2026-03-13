import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Database ready')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
