import { NotFoundException } from '@utils'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getByIdView(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserExtended (userId: any): Promise<ExtendedUserDTO> {
    const user = await this.repository.getByIdExtended(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUsersExtended (userIds: string[]): Promise<ExtendedUserDTO[]> {
    return await this.repository.getByIdsExtended(userIds)
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    const recommendations = await this.repository.getRecommendedUsersPaginated(options)
    return recommendations.filter(user => user.id !== userId)
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async isPublicProfile (userId: string): Promise<boolean> {
    return await this.repository.isPublicProfile(userId)
  }

  async setProfileImageKey (userId: string, key: string | null): Promise<UserDTO> {
    return await this.repository.setProfileImageKey(userId, key)
  }
}
