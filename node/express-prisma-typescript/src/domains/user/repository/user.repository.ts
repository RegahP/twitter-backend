import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (options: OffsetPagination) => Promise<UserViewDTO[]>
  getById: (userId: string) => Promise<UserDTO | null>
  getByIdView: (userId: string) => Promise<UserViewDTO | null>
  getByIdExtended: (userId: string) => Promise<ExtendedUserDTO | null>
  getByIdsExtended: (userIds: string[]) => Promise<ExtendedUserDTO[]>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  isPublicProfile: (userId: string) => Promise<boolean>
  setProfileImageKey: (userId: string, key: string | null) => Promise<UserDTO>
}
