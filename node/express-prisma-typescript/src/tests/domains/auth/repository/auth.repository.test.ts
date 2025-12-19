import { PrismaClient } from '@prisma/client'

import { UserRepositoryImpl } from '@domains/user/repository'

describe('Auth Repository usage (happy paths)', () => {
  it('UserRepositoryImpl.getByEmailOrUsername should return ExtendedUserDTO when found', async () => {
    const db = new PrismaClient() as any
    const repo = new UserRepositoryImpl(db)

    ;(db.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashed',
      name: null,
      createdAt: new Date(),
      isPublic: true,
      profileImageKey: null
    })

    const result = await repo.getByEmailOrUsername('test@example.com', 'testuser')
    expect(result?.id).toBe('u1')
    expect(result?.password).toBe('hashed')
  })

  it('UserRepositoryImpl.create should create and return UserDTO', async () => {
    const db = new PrismaClient() as any
    const repo = new UserRepositoryImpl(db)

    ;(db.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      name: null,
      createdAt: new Date(),
      isPublic: true,
      profileImageKey: null
    })

    const result = await repo.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashed'
    } as any)

    expect(db.user.create).toHaveBeenCalled()
    expect(result.id).toBe('u1')
  })
})
