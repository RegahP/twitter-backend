import { OffsetPagination } from '@types'
import { FollowDTO, FollowInputDTO } from '../dto'

export interface FollowerRepository {
  followUser: (data: FollowInputDTO) => Promise<FollowDTO>
  unfollowUser: (data: FollowInputDTO) => Promise<void>
  isFollowing: (data: FollowInputDTO) => Promise<boolean>
  getFollowers: (userId: string, options: OffsetPagination) => Promise<string[]>
  getFollowing: (userId: string, options: OffsetPagination) => Promise<string[]>
}
