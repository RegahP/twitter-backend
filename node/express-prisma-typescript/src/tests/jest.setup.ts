// Runs before each test file is evaluated.
// Used to ensure S3 presign helpers have sane defaults in unit tests.

process.env.AWS_REGION = process.env.AWS_REGION ?? 'us-east-1'
process.env.AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME ?? 'test-bucket'

// Provide dummy credentials so AWS SDK signing doesn't crash in unit tests.
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? 'test'
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? 'test'

// Some modules (e.g. `src/utils/database.ts`) require DATABASE_URL at import time.
// Tests don't connect to a real DB, but Prisma config/env loading still expects a value.
process.env.DATABASE_URL =
process.env.DATABASE_URL ??
'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'
