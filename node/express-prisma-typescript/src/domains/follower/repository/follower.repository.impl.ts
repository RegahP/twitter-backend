import { FollowerRepository } from './follower.repository'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { FollowDTO, FollowInputDTO } from '../dto'

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor (private readonly db: PrismaClient) {}

  async followUser (data: FollowInputDTO): Promise<FollowDTO> {
    return await this.db.follow.create({
      data
    }).then(follow => new FollowDTO(follow))
  }

  async unfollowUser (data: FollowInputDTO): Promise<void> {
    await this.db.follow.deleteMany({
      where: {
        followerId: data.followerId,
        followedId: data.followedId
      }
    })
  }

  async isFollowing (data: FollowInputDTO): Promise<boolean> {
    const follow = await this.db.follow.findFirst({
      where: {
        followerId: data.followerId,
        followedId: data.followedId
      }
    })
    return follow !== null
  }

  async getFollowers (userId: string, options: OffsetPagination): Promise<string[]> {
    const followers = await this.db.follow.findMany({
      where: {
        followedId: userId
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined
    })
    return followers.map(follow => follow.followerId)
  }

  async getFollowing (userId: string, options: OffsetPagination): Promise<string[]> {
    const following = await this.db.follow.findMany({
      where: {
        followerId: userId
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined
    })
    return following.map(follow => follow.followedId)
  }
}
