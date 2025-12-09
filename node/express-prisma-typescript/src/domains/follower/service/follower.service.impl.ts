import { OffsetPagination } from '@types'
import { FollowerRepository } from '../repository'
import { FollowerService } from './follower.service'
import { FollowDTO, FollowInputDTO } from '../dto'
import { ForbiddenException, ConflictException } from '@utils'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly repository: FollowerRepository) {}

  async followUser (data: FollowInputDTO): Promise<FollowDTO> {
    if (data.followerId === data.followedId) throw new ForbiddenException()
    if (await this.repository.isFollowing(data)) throw new ConflictException('ALREADY_FOLLOWING')
    return await this.repository.followUser(data)
  }

  async unfollowUser (data: FollowInputDTO): Promise<void> {
    await this.repository.unfollowUser(data)
  }

  async isFollowing (data: FollowInputDTO): Promise<boolean> {
    return await this.repository.isFollowing(data)
  }

  async getFollowers (userId: string, options: OffsetPagination): Promise<string[]> {
    return await this.repository.getFollowers(userId, options)
  }

  async getFollowing (userId: string, options: OffsetPagination): Promise<string[]> {
    return await this.repository.getFollowing(userId, options)
  }
}
