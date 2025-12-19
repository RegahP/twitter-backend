import { PrismaClient } from '@prisma/client'

import { UserRepositoryImpl } from '@domains/user/repository'

describe('UserRepositoryImpl (happy paths)', () => {
  it('getById should return UserDTO when found', async () => {
    const db = new PrismaClient() as any
    const repo = new UserRepositoryImpl(db);

    (db.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      name: 'name',
      createdAt: new Date(),
      isPublic: true,
      profileImageKey: null
    })

    const result = await repo.getById('u1')
    expect(result?.id).toBe('u1')
    expect(result?.profileImageUrl).toBe(null)
  })

  it('setProfileImageKey should update and return UserDTO', async () => {
    const db = new PrismaClient() as any
    const repo = new UserRepositoryImpl(db);

    (db.user.update as jest.Mock).mockResolvedValue({
      id: 'u1',
      name: 'name',
      createdAt: new Date(),
      isPublic: true,
      profileImageKey: null
    })

    const result = await repo.setProfileImageKey('u1', null)
    expect(db.user.update).toHaveBeenCalled()
    expect(result.id).toBe('u1')
  })
})
