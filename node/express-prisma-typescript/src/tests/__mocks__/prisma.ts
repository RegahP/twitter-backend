export const PrismaClient = jest.fn().mockImplementation(() => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  follow: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    delete: jest.fn()
  },
  post: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  reaction: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
    delete: jest.fn()
  },
  chatMessage: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
}))

export const Prisma = {}
