import { PrismaClient } from '@prisma/client'

import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { FollowInputDTO } from '@domains/follower/dto'

describe('FollowerRepositoryImpl (happy paths)', () => {
  it('followUser should create follow and return DTO', async () => {
    const db = new PrismaClient() as any
    const repo = new FollowerRepositoryImpl(db)

    const data = new FollowInputDTO({ followerId: 'u1', followedId: 'u2' } as any)
    const followRecord = {
      id: 'f1',
      followerId: 'u1',
      followedId: 'u2',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    (db.follow.create as jest.Mock).mockResolvedValue(followRecord)

    const result = await repo.followUser(data)
    expect(db.follow.create).toHaveBeenCalledWith({ data })
    expect(result).toMatchObject({ id: 'f1', followerId: 'u1', followedId: 'u2' })
  })

  it('unfollowUser should delete follow and return true', async () => {
    const db = new PrismaClient() as any
    const repo = new FollowerRepositoryImpl(db)

    const data = new FollowInputDTO({ followerId: 'u1', followedId: 'u2' } as any);
    (db.follow.delete as jest.Mock).mockResolvedValue({ id: 'f1' })

    const result = await repo.unfollowUser(data)
    expect(result).toBe(true)
  })

  it('isFollowing should return true when follow exists', async () => {
    const db = new PrismaClient() as any
    const repo = new FollowerRepositoryImpl(db)

    const data = new FollowInputDTO({ followerId: 'u1', followedId: 'u2' } as any);
    (db.follow.findFirst as jest.Mock).mockResolvedValue({ id: 'f1' })

    const result = await repo.isFollowing(data)
    expect(result).toBe(true)
  })
})
