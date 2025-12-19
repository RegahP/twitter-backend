import { FollowerRepository } from './follower.repository'
import { FollowDTO, FollowInputDTO } from '../dto'
import { UserDTO } from '@domains/user/dto'
import { PrismaClient } from '@prisma/client'

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor (private readonly db: PrismaClient) {}

  async followUser (data: FollowInputDTO): Promise<FollowDTO> {
    const follow = await this.db.follow.create({ data })
    return new FollowDTO(follow)
  }

  async unfollowUser (data: FollowInputDTO): Promise<boolean> {
    const unfollow = await this.db.follow.delete({
      where: {
        followerId_followedId: {
          followerId: data.followerId,
          followedId: data.followedId
        }
      }
    })
    return unfollow !== null
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

  async getFollowers (userId: string): Promise<UserDTO[]> {
    const followers = await this.db.follow.findMany({
      where: { followedId: userId },
      orderBy: { id: 'asc' },
      include: { follower: true }
    })
    return followers.map(f => new UserDTO(f.follower))
  }

  async getFollowing (userId: string): Promise<UserDTO[]> {
    const following = await this.db.follow.findMany({
      where: { followerId: userId },
      orderBy: { id: 'asc' },
      include: { followed: true }
    })
    return following.map(f => new UserDTO(f.followed))
  }
}
