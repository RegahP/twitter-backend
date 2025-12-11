import { OffsetPagination } from '@types'
import { FollowDTO, FollowInputDTO } from '../dto'
import { UserDTO } from '@domains/user/dto'

export interface FollowerRepository {
  followUser: (data: FollowInputDTO) => Promise<FollowDTO>
  unfollowUser: (data: FollowInputDTO) => Promise<boolean>
  isFollowing: (data: FollowInputDTO) => Promise<boolean>
  getFollowers: (userId: string, options: OffsetPagination) => Promise<UserDTO[]>
  getFollowing: (userId: string, options: OffsetPagination) => Promise<UserDTO[]>
}
