export const PrismaClient = jest.fn().mockImplementation(() => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  follow: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn()
  },
  post: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
}))
