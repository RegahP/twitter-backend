import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  getUserExtended: (userId: any) => Promise<ExtendedUserDTO>
  getUsersExtended: (userIds: string[]) => Promise<ExtendedUserDTO[]>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  isPublicProfile: (userId: string) => Promise<boolean>
  setProfileImageKey: (userId: string, key: string | null) => Promise<UserDTO>
}
