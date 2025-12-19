import { FollowDTO, FollowInputDTO } from '../dto'
import { UserDTO } from '@domains/user/dto'

export interface FollowerService {
  followUser: (data: FollowInputDTO) => Promise<FollowDTO>
  unfollowUser: (data: FollowInputDTO) => Promise<boolean>
  isFollowing: (data: FollowInputDTO) => Promise<boolean>
  getFollowers: (userId: string) => Promise<UserDTO[]>
  getFollowing: (userId: string) => Promise<UserDTO[]>
}
