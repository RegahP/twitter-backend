import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables')
}
const connectionString = databaseUrl

const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

export { db }
